import { useState } from "react";
import MapSelector from "@/components/MapSelector";
import TierSelector from "@/components/TierSelector";
import BookingConfirmation from "@/components/BookingConfirmation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

export type Location = {
  lat: number;
  lng: number;
  address?: string;
};

export type TierType = "standard" | "premium";

const BookRide = () => {
  const navigate = useNavigate();
  const [pickup, setPickup] = useState<Location | null>(null);
  const [destination, setDestination] = useState<Location | null>(null);
  const [stops, setStops] = useState<Location[]>([]);
  const [selectedTier, setSelectedTier] = useState<TierType>("standard");
  const [distance, setDistance] = useState<number>(0);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleAddStop = () => {
    setStops([...stops, { lat: 0, lng: 0, address: "New Stop" }]);
  };

  const handleStopChange = (index: number, location: Location) => {
    const newStops = [...stops];
    newStops[index] = location;
    setStops(newStops);
  };

  const handleRemoveStop = (index: number) => {
    const newStops = stops.filter((_, i) => i !== index);
    setStops(newStops);
  };

  const handleConfirmBooking = () => {
    setShowConfirmation(true);
  };

  const handleFinalConfirm = () => {
    const bookingId = `AG-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    navigate(`/tracking/${bookingId}`, { 
      state: { pickup, destination, stops, tier: selectedTier, distance } 
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold">Book Your Flight</h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className={`grid lg:grid-cols-2 gap-8 max-w-7xl mx-auto ${showConfirmation ? 'pointer-events-none opacity-50' : ''}`}>
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-semibold mb-2">Select Route</h2>
              <p className="text-muted-foreground">
                Choose your pickup, destination, and any stops on the map
              </p>
            </div>
            <MapSelector
              pickup={pickup}
              destination={destination}
              stops={stops}
              onPickupChange={setPickup}
              onDestinationChange={setDestination}
              onStopChange={handleStopChange}
              onDistanceCalculated={setDistance}
            />
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Stops</h3>
              <div className="space-y-2">
                {stops.map((stop, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 border rounded-md">
                    <p className="flex-grow font-medium">
                      {stop.address || `Stop ${index + 1}`}
                    </p>
                    <Button variant="ghost" size="icon" onClick={() => handleRemoveStop(index)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button
                variant="outline"
                className="w-full mt-4"
                onClick={handleAddStop}
                disabled={stops.length >= 3} // Limit stops for simplicity
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Stop
              </Button>
            </div>

            <TierSelector
              selectedTier={selectedTier}
              onTierChange={setSelectedTier}
              distance={distance}
              disabled={!pickup || !destination}
            />

            <Button
              size="lg"
              className="w-full"
              disabled={!pickup || !destination}
              onClick={handleConfirmBooking}
            >
              Review Booking
            </Button>
          </div>
        </div>
      </div>

      {showConfirmation && pickup && destination && (
        <BookingConfirmation
          pickup={pickup}
          destination={destination}
          stops={stops}
          tier={selectedTier}
          distance={distance}
          onConfirm={handleFinalConfirm}
          onCancel={() => setShowConfirmation(false)}
        />
      )}
    </div>
  );
};

export default BookRide;