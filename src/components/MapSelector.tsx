import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, Polyline } from "react-leaflet";
import L from "leaflet";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation } from "lucide-react";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

type Location = {
  lat: number;
  lng: number;
  address?: string;
};

type Props = {
  pickup: Location | null;
  destination: Location | null;
  onPickupChange: (location: Location) => void;
  onDestinationChange: (location: Location) => void;
  onDistanceCalculated: (distance: number) => void;
};

// Component to handle map clicks
const MapClickHandler = ({ 
  onMapClick, 
  mode 
}: { 
  onMapClick: (lat: number, lng: number) => void;
  mode: "pickup" | "destination" | null;
}) => {
  useMapEvents({
    click: (e) => {
      if (mode) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
};

// Calculate distance between two points (Haversine formula)
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const MapSelector = ({
  pickup,
  destination,
  onPickupChange,
  onDestinationChange,
  onDistanceCalculated,
}: Props) => {
  const [mode, setMode] = useState<"pickup" | "destination" | null>(null);
  const [center, setCenter] = useState<[number, number]>([12.9716, 77.5946]); // Bengaluru

  useEffect(() => {
    // Calculate distance when both points are set
    if (pickup && destination) {
      const dist = calculateDistance(pickup.lat, pickup.lng, destination.lat, destination.lng);
      onDistanceCalculated(dist);
    }
  }, [pickup, destination, onDistanceCalculated]);

  const handleMapClick = (lat: number, lng: number) => {
    const location: Location = { lat, lng, address: `${lat.toFixed(4)}, ${lng.toFixed(4)}` };
    
    if (mode === "pickup") {
      onPickupChange(location);
      setMode("destination");
    } else if (mode === "destination") {
      onDestinationChange(location);
      setMode(null);
    }
  };

  const handleCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location: Location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            address: "Current Location",
          };
          onPickupChange(location);
          setCenter([position.coords.latitude, position.coords.longitude]);
          setMode("destination");
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  };

  const flightPath: [number, number][] = 
    pickup && destination 
      ? [[pickup.lat, pickup.lng], [destination.lat, destination.lng]]
      : [];

  return (
    <div className="space-y-4">
      <Card className="p-4 space-y-3">
        <div className="flex gap-2">
          <Button
            variant={mode === "pickup" ? "default" : "outline"}
            className="flex-1"
            onClick={() => setMode("pickup")}
          >
            <MapPin className="h-4 w-4 mr-2" />
            {pickup ? "Change Pickup" : "Set Pickup"}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleCurrentLocation}
            title="Use current location"
          >
            <Navigation className="h-4 w-4" />
          </Button>
        </div>
        
        <Button
          variant={mode === "destination" ? "default" : "outline"}
          className="w-full"
          onClick={() => setMode("destination")}
          disabled={!pickup}
        >
          <MapPin className="h-4 w-4 mr-2" />
          {destination ? "Change Destination" : "Set Destination"}
        </Button>

        {mode && (
          <p className="text-sm text-muted-foreground text-center">
            Tap on the map to set {mode === "pickup" ? "pickup" : "destination"} point
          </p>
        )}

        {pickup && destination && (
          <div className="pt-2 border-t space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Air Distance</span>
              <span className="font-semibold">
                {calculateDistance(pickup.lat, pickup.lng, destination.lat, destination.lng).toFixed(2)} km
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Est. Flight Time</span>
              <span className="font-semibold">
                {Math.ceil(calculateDistance(pickup.lat, pickup.lng, destination.lat, destination.lng) * 2)} min
              </span>
            </div>
          </div>
        )}
      </Card>

      <div className="h-[500px] rounded-lg overflow-hidden border">
        <MapContainer
          center={center}
          zoom={12}
          className="h-full w-full"
          zoomControl={true}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          <MapClickHandler onMapClick={handleMapClick} mode={mode} />
          {pickup && <Marker position={[pickup.lat, pickup.lng]} />}
          {destination && <Marker position={[destination.lat, destination.lng]} />}
          {flightPath.length === 2 && (
            <Polyline
              positions={flightPath}
              color="#0098ff"
              weight={3}
              opacity={0.7}
              dashArray="10, 10"
            />
          )}
        </MapContainer>
      </div>
    </div>
  );
};

export default MapSelector;
