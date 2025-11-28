import { useEffect, useRef, useState } from "react";
import L, { Map as LeafletMap, LatLngExpression, LeafletMouseEvent, Polyline as LeafletPolyline } from "leaflet";
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

export type Location = {
  lat: number;
  lng: number;
  address?: string;
};

type Props = {
  pickup: Location | null;
  destination: Location | null;
  stops: Location[];
  onPickupChange: (location: Location) => void;
  onDestinationChange: (location: Location) => void;
  onStopChange: (index: number, location: Location) => void;
  onDistanceCalculated: (distance: number) => void;
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
  stops,
  onPickupChange,
  onDestinationChange,
  onStopChange,
  onDistanceCalculated,
}: Props) => {
  const [mode, setMode] = useState<"pickup" | "destination" | "stop" | null>(null);
  const [editingStopIndex, setEditingStopIndex] = useState<number | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const markersRef = useRef<{ pickup?: L.Marker; destination?: L.Marker; path?: LeafletPolyline; stops: L.Marker[] }>({ stops: [] });

  useEffect(() => {
    if (mapRef.current || !mapContainerRef.current) return;

    const initialCenter: LatLngExpression = [12.9716, 77.5946]; // Bengaluru

    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: 12,
      zoomControl: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    mapRef.current = map;
  }, []);

  useEffect(() => {
    const newStopIndex = stops.findIndex(stop => stop.lat === 0 && stop.lng === 0);
    if (newStopIndex !== -1) {
      setMode("stop");
      setEditingStopIndex(newStopIndex);
    }
  }, [stops]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const handleClick = (e: LeafletMouseEvent) => {
      if (!mode) return;
      const { lat, lng } = e.latlng;
      const location: Location = { lat, lng, address: `${lat.toFixed(4)}, ${lng.toFixed(4)}` };

      if (mode === "pickup") {
        onPickupChange(location);
        setMode("destination");
      } else if (mode === "destination") {
        onDestinationChange(location);
        setMode(null);
      } else if (mode === "stop" && editingStopIndex !== null) {
        onStopChange(editingStopIndex, location);
        setMode(null);
        setEditingStopIndex(null);
      }
    };

    map.on("click", handleClick);

    return () => {
      map.off("click", handleClick);
    };
  }, [mode, onDestinationChange, onPickupChange, onStopChange, editingStopIndex]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const markers = markersRef.current;

    if (markers.pickup) markers.pickup.remove();
    if (markers.destination) markers.destination.remove();
    if (markers.path) markers.path.remove();
    markers.stops.forEach(marker => marker.remove());
    markers.stops = [];

    const layerGroup = L.layerGroup().addTo(map);

    if (pickup) {
      markers.pickup = L.marker([pickup.lat, pickup.lng]).addTo(layerGroup);
    }

    if (destination) {
      markers.destination = L.marker([destination.lat, destination.lng]).addTo(layerGroup);
    }

    const validStops = stops.filter(stop => stop.lat !== 0 || stop.lng !== 0);

    validStops.forEach(stop => {
      const stopMarker = L.marker([stop.lat, stop.lng], {
        icon: L.icon({
          iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-yellow.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41]
        })
      }).addTo(layerGroup);
      markers.stops.push(stopMarker);
    });

    if (pickup && destination) {
      const pathLatLngs: LatLngExpression[] = [
        [pickup.lat, pickup.lng],
        ...validStops.map(s => [s.lat, s.lng] as LatLngExpression),
        [destination.lat, destination.lng],
      ];

      markers.path = L.polyline(pathLatLngs, {
        color: "#0098ff",
        weight: 3,
        opacity: 0.7,
        dashArray: "10, 10",
      }).addTo(layerGroup);

      let totalDistance = 0;
      for (let i = 0; i < pathLatLngs.length - 1; i++) {
        const p1 = pathLatLngs[i] as [number, number];
        const p2 = pathLatLngs[i+1] as [number, number];
        totalDistance += calculateDistance(p1[0], p1[1], p2[0], p2[1]);
      }
      onDistanceCalculated(totalDistance);

      if (markers.path) {
        map.fitBounds(markers.path.getBounds(), { padding: [40, 40] });
      }
    }

    return () => {
      layerGroup.remove();
    };
  }, [pickup, destination, stops, onDistanceCalculated]);

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location: Location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          address: "Current Location",
        };
        onPickupChange(location);
        setMode("destination");

        if (mapRef.current) {
          mapRef.current.setView([location.lat, location.lng], 14);
        }
      },
      (error) => {
        console.error("Error getting location:", error);
      },
    );
  };

  const distanceDisplay = pickup && destination ? calculateDistance(pickup.lat, pickup.lng, destination.lat, destination.lng) : null;

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
            Tap on the map to set {mode === 'stop' ? `stop ${editingStopIndex !== null ? editingStopIndex + 1 : ''}`: mode} point
          </p>
        )}

        {distanceDisplay && (
          <div className="pt-2 border-t space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Air Distance</span>
              <span className="font-semibold">{distanceDisplay.toFixed(2)} km</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Est. Flight Time</span>
              <span className="font-semibold">{Math.ceil(distanceDisplay * 2)} min</span>
            </div>
          </div>
        )}
      </Card>

      <div className="h-[500px] rounded-lg overflow-hidden border">
        <div ref={mapContainerRef} className="h-full w-full" />
      </div>
    </div>
  );
};

export default MapSelector;
