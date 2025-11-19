import { useEffect, useRef, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import L, { Map as LeafletMap, LatLngExpression, Polyline as LeafletPolyline } from "leaflet";
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
  iconUrl:
    "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSIjMDA5OGZmIj48cGF0aCBkPSJNMjEgMTZWMTRMMTMgOVY0YTEgMSAwIDAgMC0yIDB2NWwtOCA1djJsOC0yLjV2NS41bC0yIDEuNXYxLjVsMy0xIDMgMXYtMS41bC0yLTEuNXYtNS41eiIvPjwvc3ZnPg==",
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

type Status = "pending" | "enroute-pickup" | "flying" | "completed";

type LocationType = {
  lat: number;
  lng: number;
  address?: string;
};

const Tracking = () => {
  const { bookingId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { pickup, destination, tier, distance } = (location.state || {}) as {
    pickup?: LocationType;
    destination?: LocationType;
    tier?: string;
    distance?: number;
  };

  const [vehiclePosition, setVehiclePosition] = useState<[number, number]>(
    pickup ? [pickup.lat, pickup.lng] : [12.9716, 77.5946],
  );
  const [status, setStatus] = useState<Status>("pending");
  const [progress, setProgress] = useState(0);

  const mapRef = useRef<LeafletMap | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const layersRef = useRef<{ pickup?: L.Marker; destination?: L.Marker; path?: LeafletPolyline; vehicle?: L.Marker }>({});

  // Initialize map
  useEffect(() => {
    if (mapRef.current || !mapContainerRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: vehiclePosition,
      zoom: 13,
      zoomControl: false,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    mapRef.current = map;
  }, [vehiclePosition]);

  // Update markers and path when pickup/destination/vehicle change
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !pickup || !destination) return;

    const layers = layersRef.current;

    // Clear existing
    if (layers.pickup) layers.pickup.remove();
    if (layers.destination) layers.destination.remove();
    if (layers.path) layers.path.remove();
    if (layers.vehicle) layers.vehicle.remove();

    const layerGroup = L.layerGroup().addTo(map);

    layers.pickup = L.marker([pickup.lat, pickup.lng]).addTo(layerGroup);
    layers.destination = L.marker([destination.lat, destination.lng]).addTo(layerGroup);
    layers.vehicle = L.marker(vehiclePosition, { icon: planeIcon }).addTo(layerGroup);

    const pathLatLngs: LatLngExpression[] = [
      [pickup.lat, pickup.lng],
      [destination.lat, destination.lng],
    ];
    layers.path = L.polyline(pathLatLngs, {
      color: "#0098ff",
      weight: 3,
      opacity: 0.6,
      dashArray: "10, 10",
    }).addTo(layerGroup);

    map.fitBounds(layers.path.getBounds(), { padding: [40, 40] });

    return () => {
      layerGroup.remove();
    };
  }, [pickup, destination, vehiclePosition]);

  // Simulate vehicle movement
  useEffect(() => {
    if (!pickup || !destination) return;

    const totalSteps = 100;
    const pickupPos: [number, number] = [pickup.lat, pickup.lng];
    const destPos: [number, number] = [destination.lat, destination.lng];

    let step = 0;
    const interval = setInterval(() => {
      step++;
      const progressPct = step / totalSteps;

      const currentLat = pickupPos[0] + (destPos[0] - pickupPos[0]) * progressPct;
      const currentLng = pickupPos[1] + (destPos[1] - pickupPos[1]) * progressPct;
      setVehiclePosition([currentLat, currentLng]);
      setProgress(progressPct * 100);

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

      if (mapRef.current && layersRef.current.vehicle) {
        layersRef.current.vehicle.setLatLng([currentLat, currentLng]);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [pickup, destination]);

  if (!pickup || !destination || !tier || typeof distance !== "number") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground mb-4">No booking information found</p>
          <Button onClick={() => navigate("/book")}>
            Book a Ride
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Tracking Flight</h1>
            <p className="text-sm text-muted-foreground">ID: {bookingId}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
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

      {/* Map and overlay */}
      <div className="flex-1 relative">
        <div ref={mapContainerRef} className="h-full w-full" />

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
