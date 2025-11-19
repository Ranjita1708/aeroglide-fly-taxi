import { useState } from "react";
import MapSelector from "@/components/MapSelector";
import TierSelector from "@/components/TierSelector";
import BookingConfirmation from "@/components/BookingConfirmation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
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
  const [selectedTier, setSelectedTier] = useState<TierType>("standard");
  const [distance, setDistance] = useState<number>(0);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleConfirmBooking = () => {
    setShowConfirmation(true);
  };

  const handleFinalConfirm = () => {
    // Generate a mock booking ID and navigate to tracking
    const bookingId = `AG-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    navigate(`/tracking/${bookingId}`, { 
      state: { pickup, destination, tier: selectedTier, distance } 
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
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
          {/* Map Section */}
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-semibold mb-2">Select Route</h2>
              <p className="text-muted-foreground">
                Choose your pickup and destination points on the map
              </p>
            </div>
            <MapSelector
              pickup={pickup}
              destination={destination}
              onPickupChange={setPickup}
              onDestinationChange={setDestination}
              onDistanceCalculated={setDistance}
            />
          </div>

          {/* Booking Details Section */}
          <div className="space-y-6">
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

      {/* Confirmation Modal */}
      {showConfirmation && pickup && destination && (
        <BookingConfirmation
          pickup={pickup}
          destination={destination}
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
