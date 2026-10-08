"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { workflowNodes } from "@/lib/mock-data";
import { ActivityIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";

const hrefMap: Record<string, string> = {
  req: "/requirements",
  analysis: "/analysis",
  scenario: "/scenarios",
  cases: "/test-cases",
  automation: "/automation",
  execution: "/execution",
  failure: "/failure-analysis",
  healing: "/self-healing",
  defects: "/defects",
  report: "/reports",
};

const statusStyle: Record<string, string> = {
  done: "border-success/30 bg-success/5 text-success",
  active: "border-primary/40 bg-primary/5 text-primary ai-glow",
  warning: "border-warning/40 bg-warning/5 text-warning",
};

export function WorkflowViz() {
  return (
    <div className="flex flex-wrap items-stretch gap-2">
      {workflowNodes.map((node, i) => (
        <div key={node.id} className="flex items-center gap-2">
          <Link
            href={hrefMap[node.id] ?? "/"}
            className={cn(
              "group relative flex w-[132px] flex-col gap-2 rounded-xl border bg-card p-3 transition-all hover:-translate-y-0.5 hover:shadow-md",
              statusStyle[node.status] ?? "border-border"
            )}
          >
            <div className="flex items-center justify-between">
              <div className={cn("flex size-8 items-center justify-center rounded-lg bg-current/10")}>
                <ActivityIcon name={node.icon} className="size-4" />
              </div>
              {node.status === "active" && (
                <span className="relative flex size-2">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex size-2 rounded-full bg-primary" />
                </span>
              )}
            </div>
            <div>
              <p className="text-xs font-medium leading-tight text-foreground">{node.label}</p>
              <p className="mt-0.5 text-lg font-semibold text-foreground">{node.count}</p>
            </div>
            {node.status === "active" && (
              <div className="h-1 overflow-hidden rounded-full bg-secondary">
                <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-primary to-fuchsia-500" />
              </div>
            )}
          </Link>
          {i !== workflowNodes.length - 1 && (
            <ArrowRight
              className={cn(
                "size-4 shrink-0",
                node.status === "active" ? "text-primary" : "text-muted-foreground/40"
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}
