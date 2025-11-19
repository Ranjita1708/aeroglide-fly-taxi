import { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import StatusIndicator from "@/components/StatusIndicator";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Home } from "lucide-react";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Custom plane icon
const planeIcon = new L.Icon({
  iconUrl: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSIjMDA5OGZmIj48cGF0aCBkPSJNMjEgMTZWMTRMMTMgOVY0YTEgMSAwIDAgMC0yIDB2NWwtOCA1djJsOC0yLjV2NS41bC0yIDEuNXYxLjVsMy0xIDMgMXYtMS41bC0yLTEuNXYtNS41eiIvPjwvc3ZnPg==",
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

type Status = "pending" | "enroute-pickup" | "flying" | "completed";

const MapUpdater = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
};

const Tracking = () => {
  const { bookingId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { pickup, destination, tier, distance } = location.state || {};

  const [vehiclePosition, setVehiclePosition] = useState<[number, number]>(
    pickup ? [pickup.lat, pickup.lng] : [12.9716, 77.5946]
  );
  const [status, setStatus] = useState<Status>("pending");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!pickup || !destination) return;

    const totalSteps = 100;
    const pickupPos: [number, number] = [pickup.lat, pickup.lng];
    const destPos: [number, number] = [destination.lat, destination.lng];

    // Simulate vehicle movement
    let step = 0;
    const interval = setInterval(() => {
      step++;
      const progressPct = step / totalSteps;

      // Calculate current position
      const currentLat = pickupPos[0] + (destPos[0] - pickupPos[0]) * progressPct;
      const currentLng = pickupPos[1] + (destPos[1] - pickupPos[1]) * progressPct;
      setVehiclePosition([currentLat, currentLng]);
      setProgress(progressPct * 100);

      // Update status based on progress
      if (progressPct < 0.2) {
        setStatus("pending");
      } else if (progressPct < 0.3) {
        setStatus("enroute-pickup");
      } else if (progressPct < 0.95) {
        setStatus("flying");
      } else {
        setStatus("completed");
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [pickup, destination]);

  if (!pickup || !destination) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground mb-4">No booking information found</p>
          <Button onClick={() => navigate("/book")}>Book a Ride</Button>
        </Card>
      </div>
    );
  }

  const flightPath: [number, number][] = [
    [pickup.lat, pickup.lng],
    [destination.lat, destination.lng],
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Tracking Flight</h1>
            <p className="text-sm text-muted-foreground">ID: {bookingId}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
          >
            <Home className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Status */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <StatusIndicator status={status} progress={progress} />
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        <MapContainer
          center={vehiclePosition}
          zoom={13}
          className="h-full w-full"
          zoomControl={false}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          <MapUpdater center={vehiclePosition} />
          <Marker position={[pickup.lat, pickup.lng]} />
          <Marker position={[destination.lat, destination.lng]} />
          <Marker position={vehiclePosition} icon={planeIcon} />
          <Polyline
            positions={flightPath}
            color="#0098ff"
            weight={3}
            opacity={0.6}
            dashArray="10, 10"
          />
        </MapContainer>

        {/* Info Card Overlay */}
        <div className="absolute bottom-4 left-4 right-4 md:left-auto md:w-96 z-[1000]">
          <Card className="p-6 space-y-4 backdrop-blur-sm bg-card/95">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Tier</span>
              <span className="font-semibold uppercase">{tier}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Distance</span>
              <span className="font-semibold">{distance.toFixed(2)} km</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Est. Time</span>
              <span className="font-semibold">{Math.ceil(distance * 2)} min</span>
            </div>
            {status === "completed" && (
              <Button className="w-full" onClick={() => navigate("/")}>
                Complete Journey
              </Button>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Tracking;
