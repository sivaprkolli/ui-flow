"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProcessingProps {
  title: string;
  steps: string[];
}

export function AIProcessing({ title, steps }: ProcessingProps) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (current >= steps.length) return;
    const t = setTimeout(() => setCurrent((c) => c + 1), 700);
    return () => clearTimeout(t);
  }, [current, steps.length]);

  const pct = Math.round((current / steps.length) * 100);

  return (
    <div className="rounded-xl border border-primary/30 bg-primary/5 p-5 ai-glow">
      <div className="flex items-center gap-2">
        <Sparkles className="size-4 animate-pulse text-primary" />
        <p className="text-sm font-medium">{title}</p>
      </div>
      <div className="mt-4 space-y-2">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-2 text-sm">
            {i < current ? (
              <CheckCircle2 className="size-4 text-success" />
            ) : i === current ? (
              <Loader2 className="size-4 animate-spin text-primary" />
            ) : (
              <span className="size-4 rounded-full border border-border" />
            )}
            <span className={cn(i <= current ? "text-foreground" : "text-muted-foreground")}>{s}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center gap-3">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
          <div className="h-full rounded-full bg-gradient-to-r from-primary to-fuchsia-500 transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>
        <span className="text-xs font-medium text-primary">{pct}% complete</span>
      </div>
    </div>
  );
}
