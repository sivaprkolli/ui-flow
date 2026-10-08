"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { aiActivity, type ActivityStatus } from "@/lib/mock-data";
import { ActivityIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";

const statusStyles: Record<ActivityStatus, { ring: string; icon: string; dot: string }> = {
  done: { ring: "border-success/30 bg-success/10", icon: "text-success", dot: "bg-success" },
  active: { ring: "border-primary/40 bg-primary/10", icon: "text-primary", dot: "bg-primary" },
  warning: { ring: "border-warning/40 bg-warning/10", icon: "text-warning", dot: "bg-warning" },
  info: { ring: "border-sky-500/30 bg-sky-500/10", icon: "text-sky-400", dot: "bg-sky-400" },
};

export function AIActivity() {
  const [expanded, setExpanded] = useState<string | null>("a5");

  return (
    <div className="relative space-y-1">
      {aiActivity.map((a, i) => {
        const style = statusStyles[a.status];
        const isOpen = expanded === a.id;
        return (
          <div key={a.id} className="relative pl-11">
            {i !== aiActivity.length - 1 && (
              <span className="absolute left-[19px] top-9 h-[calc(100%-1rem)] w-px bg-border" />
            )}
            <div
              className={cn(
                "absolute left-0 top-1 flex size-9 items-center justify-center rounded-full border",
                style.ring
              )}
            >
              {a.status === "active" && (
                <span className="absolute inline-flex size-9 animate-ping rounded-full bg-primary/20" />
              )}
              <ActivityIcon name={a.icon} className={cn("size-4", style.icon)} />
            </div>

            <button
              onClick={() => setExpanded(isOpen ? null : a.id)}
              className="flex w-full items-start justify-between gap-3 rounded-lg px-3 py-2 text-left hover:bg-accent/40"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">{a.title}</p>
                  {a.status === "active" && (
                    <span className="rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                      In progress
                    </span>
                  )}
                </div>
                {isOpen && (
                  <p className="mt-1 text-xs text-muted-foreground animate-fade-in">{a.detail}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-muted-foreground">{a.time}</span>
                <ChevronDown
                  className={cn("size-4 text-muted-foreground transition-transform", isOpen && "rotate-180")}
                />
              </div>
            </button>
          </div>
        );
      })}
    </div>
  );
}
