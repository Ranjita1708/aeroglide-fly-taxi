import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MapPin, Plane, Clock, CreditCard } from "lucide-react";
import { Card } from "@/components/ui/card";

type Location = {
  lat: number;
  lng: number;
  address?: string;
};

type TierType = "standard" | "premium";

type Props = {
  pickup: Location;
  destination: Location;
  stops: Location[];
  tier: TierType;
  distance: number;
  onConfirm: () => void;
  onCancel: () => void;
};

const BASE_PRICE_PER_KM = 150;
const TIER_MULTIPLIERS = {
  standard: 1.0,
  premium: 1.5,
};

const BookingConfirmation = ({
  pickup,
  destination,
  stops,
  tier,
  distance,
  onConfirm,
  onCancel,
}: Props) => {
  const totalPrice = Math.round(
    BASE_PRICE_PER_KM * distance * TIER_MULTIPLIERS[tier]
  );
  const estimatedTime = Math.ceil(distance * 2);

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Confirm Your Flight</DialogTitle>
          <DialogDescription>
            Review your booking details before confirming
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Route */}
          <Card className="p-4 space-y-3">
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-primary mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Pickup</p>
                <p className="font-medium">
                  {pickup.address || `${pickup.lat.toFixed(4)}, ${pickup.lng.toFixed(4)}`}
                </p>
              </div>
            </div>

            {stops.map((stop, index) => (
              <div key={index} className="flex items-start gap-3 pl-4 border-l-2 border-dashed ml-2.5">
                <MapPin className="h-5 w-5 text-yellow-500 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Stop {index + 1}</p>
                  <p className="font-medium">
                    {stop.address || `${stop.lat.toFixed(4)}, ${stop.lng.toFixed(4)}`}
                  </p>
                </div>
              </div>
            ))}
            
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-destructive mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Destination</p>
                <p className="font-medium">
                  {destination.address || `${destination.lat.toFixed(4)}, ${destination.lng.toFixed(4)}`}
                </p>
              </div>
            </div>
          </Card>

          {/* Flight Details */}
          <Card className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Plane className="h-5 w-5 text-accent" />
                <span className="text-sm text-muted-foreground">Cabin Class</span>
              </div>
              <span className="font-semibold uppercase">
                {tier === "standard" ? "Standard AG-1" : "Premium AG-P"}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-success" />
                <span className="text-sm text-muted-foreground">Est. Flight Time</span>
              </div>
              <span className="font-semibold">{estimatedTime} minutes</span>
            </div>

            <div className="flex items-center justify-between pt-3 border-t">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Distance</span>
              </div>
              <span className="font-semibold">{distance.toFixed(2)} km</span>
            </div>
          </Card>

          {/* Price */}
          <Card className="p-4 bg-primary/5 border-primary/20">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold">Total Fare</span>
              <span className="text-3xl font-bold text-primary">
                ₹{totalPrice.toLocaleString()}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Payment will be processed via on-file method
            </p>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={onConfirm} size="lg">
            Confirm Booking
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BookingConfirmation;
