import { cn } from "@/lib/utils";
import { Badge } from "./badge";

const map: Record<string, { variant: any; label?: string }> = {
  passed: { variant: "success" },
  ready: { variant: "success" },
  approved: { variant: "success" },
  applied: { variant: "success" },
  complete: { variant: "success" },
  resolved: { variant: "success" },
  automated: { variant: "info" },
  running: { variant: "warning" },
  processing: { variant: "warning" },
  pending: { variant: "warning" },
  draft: { variant: "secondary" },
  skipped: { variant: "secondary" },
  blocked: { variant: "purple" },
  failed: { variant: "danger" },
  open: { variant: "danger" },
  broken: { variant: "danger" },
  critical: { variant: "danger" },
  high: { variant: "danger" },
  medium: { variant: "warning" },
  low: { variant: "success" },
};

export function StatusPill({ status, className }: { status: string; className?: string }) {
  const key = status.toLowerCase();
  const cfg = map[key] ?? { variant: "secondary" };
  return (
    <Badge variant={cfg.variant} className={cn("capitalize", className)}>
      {cfg.label ?? status}
    </Badge>
  );
}
