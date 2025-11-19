import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Star } from "lucide-react";
import { cn } from "@/lib/utils";

type TierType = "standard" | "premium";

type Props = {
  selectedTier: TierType;
  onTierChange: (tier: TierType) => void;
  distance: number;
  disabled?: boolean;
};

const BASE_PRICE_PER_KM = 150; // Base price in rupees per km

const tiers = [
  {
    id: "standard" as TierType,
    name: "Standard AG-1",
    description: "Perfect for solo travelers or couples",
    capacity: 2,
    multiplier: 1.0,
    icon: Users,
    features: ["2 Passengers", "Standard Comfort", "20kg Luggage"],
  },
  {
    id: "premium" as TierType,
    name: "Premium AG-P",
    description: "Spacious comfort for groups",
    capacity: 4,
    multiplier: 1.5,
    icon: Star,
    features: ["4 Passengers", "Premium Comfort", "40kg Luggage", "Priority Boarding"],
  },
];

const TierSelector = ({ selectedTier, onTierChange, distance, disabled }: Props) => {
  const calculatePrice = (multiplier: number): number => {
    return Math.round(BASE_PRICE_PER_KM * distance * multiplier);
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Choose Your Cabin</h2>
        <p className="text-muted-foreground">
          Select the tier that best fits your needs
        </p>
      </div>

      <div className="space-y-4">
        {tiers.map((tier) => {
          const Icon = tier.icon;
          const price = calculatePrice(tier.multiplier);
          const isSelected = selectedTier === tier.id;

          return (
            <Card
              key={tier.id}
              className={cn(
                "p-6 cursor-pointer transition-all hover:shadow-lg",
                isSelected && "ring-2 ring-primary shadow-lg",
                disabled && "opacity-50 cursor-not-allowed"
              )}
              onClick={() => !disabled && onTierChange(tier.id)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center",
                    tier.id === "premium" ? "bg-premium/10" : "bg-primary/10"
                  )}>
                    <Icon className={cn(
                      "h-6 w-6",
                      tier.id === "premium" ? "text-premium" : "text-primary"
                    )} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{tier.name}</h3>
                    <p className="text-sm text-muted-foreground">{tier.description}</p>
                  </div>
                </div>
                {distance > 0 && (
                  <div className="text-right">
                    <div className="text-2xl font-bold">₹{price.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">
                      ₹{Math.round(price / distance)}/km
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {tier.features.map((feature) => (
                  <span
                    key={feature}
                    className="text-xs px-3 py-1 rounded-full bg-muted text-muted-foreground"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </Card>
          );
        })}
      </div>

      {distance > 0 && (
        <Card className="p-4 bg-muted/50">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Distance</span>
              <span className="font-medium">{distance.toFixed(2)} km</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Base Rate</span>
              <span className="font-medium">₹{BASE_PRICE_PER_KM}/km</span>
            </div>
            <div className="flex justify-between pt-2 border-t">
              <span className="font-semibold">Total Fare</span>
              <span className="font-bold text-primary text-lg">
                ₹{calculatePrice(tiers.find(t => t.id === selectedTier)?.multiplier || 1).toLocaleString()}
              </span>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default TierSelector;
