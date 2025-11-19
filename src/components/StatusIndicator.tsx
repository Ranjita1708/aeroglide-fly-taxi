import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Plane, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

type Status = "pending" | "enroute-pickup" | "flying" | "completed";

type Props = {
  status: Status;
  progress: number;
};

const statusConfig = {
  pending: {
    label: "Pending Confirmation",
    description: "Your flight is being prepared",
    icon: Clock,
    color: "text-muted-foreground",
  },
  "enroute-pickup": {
    label: "En Route to Pickup",
    description: "Your AeroGlide taxi is on its way",
    icon: Plane,
    color: "text-primary",
  },
  flying: {
    label: "Flying to Destination",
    description: "You're on your way! Enjoy the view",
    icon: Plane,
    color: "text-accent",
  },
  completed: {
    label: "Journey Complete",
    description: "Thank you for flying with AeroGlide",
    icon: CheckCircle2,
    color: "text-success",
  },
};

const StatusIndicator = ({ status, progress }: Props) => {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-start gap-4">
        <div className={cn("w-12 h-12 rounded-full flex items-center justify-center bg-muted", config.color)}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold">{config.label}</h3>
          <p className="text-sm text-muted-foreground">{config.description}</p>
        </div>
        {status !== "completed" && (
          <div className="text-right">
            <p className="text-2xl font-bold text-primary">{Math.round(progress)}%</p>
          </div>
        )}
      </div>

      {status !== "completed" && (
        <Progress value={progress} className="h-2" />
      )}

      <div className="grid grid-cols-4 gap-2">
        {Object.keys(statusConfig).map((key, index) => {
          const isActive = Object.keys(statusConfig).indexOf(status) >= index;
          return (
            <div
              key={key}
              className={cn(
                "h-1 rounded-full transition-colors",
                isActive ? "bg-primary" : "bg-muted"
              )}
            />
          );
        })}
      </div>
    </Card>
  );
};

export default StatusIndicator;
