import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  sub: string;
  icon: LucideIcon;
  accent?: string;
  trend?: { value: string; up: boolean };
}

export function StatCard({ label, value, sub, icon: Icon, accent = "text-primary", trend }: StatCardProps) {
  return (
    <Card className="group relative overflow-hidden p-5 transition-all hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-1 text-3xl font-semibold tracking-tight">{value}</p>
        </div>
        <div className={cn("flex size-10 items-center justify-center rounded-xl bg-secondary", accent)}>
          <Icon className="size-5" />
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <p className="text-xs text-muted-foreground">{sub}</p>
        {trend && (
          <span
            className={cn(
              "flex items-center gap-1 text-xs font-medium",
              trend.up ? "text-success" : "text-danger"
            )}
          >
            {trend.up ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
            {trend.value}
          </span>
        )}
      </div>
      <div className={cn("absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-current transition-transform group-hover:scale-x-100", accent)} />
    </Card>
  );
}
