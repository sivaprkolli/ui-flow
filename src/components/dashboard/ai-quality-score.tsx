import { aiQualityScore } from "@/lib/mock-data";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

export function AIQualityScore() {
  const { score, metrics, defectRisk } = aiQualityScore;
  const circumference = 2 * Math.PI * 52;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-5">
        <div className="relative size-32 shrink-0">
          <svg className="size-full -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="52" fill="none" strokeWidth="10" className="stroke-secondary" />
            <circle
              cx="60"
              cy="60"
              r="52"
              fill="none"
              strokeWidth="10"
              strokeLinecap="round"
              stroke="url(#scoreGrad)"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className="transition-all duration-1000"
            />
            <defs>
              <linearGradient id="scoreGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" />
                <stop offset="100%" stopColor="#d946ef" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-semibold">{score}</span>
            <span className="text-[11px] text-muted-foreground">/ 100</span>
          </div>
        </div>
        <div className="flex-1 space-y-1">
          <p className="text-sm font-medium">AI Quality Score</p>
          <p className="text-xs text-muted-foreground">
            Composite score across coverage, stability and defect risk.
          </p>
          <div className="flex items-center gap-2 pt-1">
            <span className="text-xs text-muted-foreground">Defect Risk</span>
            <Badge variant="success">{defectRisk}</Badge>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {metrics.map((m) => (
          <div key={m.label}>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{m.label}</span>
              <span className="font-medium">{m.value}%</span>
            </div>
            <Progress value={m.value} indicatorClassName="bg-gradient-to-r from-primary to-fuchsia-500" />
          </div>
        ))}
      </div>
    </div>
  );
}
