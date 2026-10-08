"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  Play, RotateCcw, ListChecks, Square, Sparkles, Search, Brain, History,
  Camera, BookOpen, Lightbulb, HeartPulse, Monitor, FileBarChart,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Drawer } from "@/components/ui/drawer";
import { useToast } from "@/components/ui/toast";
import { executionRows, failureInvestigation, type ExecutionRow } from "@/lib/mock-data";
import { VariableExecutionEvidence } from "@/components/variables/variable-evidence";
import { ActivityIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";

const statusStyle: Record<string, { dot: string; text: string }> = {
  Passed: { dot: "bg-success", text: "text-success" },
  Failed: { dot: "bg-danger", text: "text-danger" },
  Running: { dot: "bg-warning animate-pulse", text: "text-warning" },
  Skipped: { dot: "bg-muted-foreground", text: "text-muted-foreground" },
};

export default function ExecutionPage() {
  const { toast } = useToast();
  const [completed, setCompleted] = useState(120);
  const [running, setRunning] = useState(true);
  const [failure, setFailure] = useState<ExecutionRow | null>(null);
  const total = 186;

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => {
      setCompleted((c) => {
        if (c >= 142) {
          setRunning(false);
          return c;
        }
        return c + 1;
      });
    }, 350);
    return () => clearInterval(t);
  }, [running]);

  const pct = Math.round((completed / total) * 100);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Test Execution"
        description="Live execution across the QA environment on Chromium."
        icon={<Play className="size-5" />}
        actions={
          <>
            <Button variant="gradient" onClick={() => { setRunning(true); toast({ title: "Running all tests", variant: "info" }); }}>
              <Play className="size-4" /> Run All
            </Button>
            <Button variant="secondary" onClick={() => toast({ title: "Re-running failed tests", variant: "info" })}>
              <RotateCcw className="size-4" /> Run Failed
            </Button>
            <Button variant="secondary" onClick={() => toast({ title: "Running selected", variant: "info" })}>
              <ListChecks className="size-4" /> Run Selected
            </Button>
            <Button variant="secondary" asChild>
              <Link href="/failure-analysis"><Search className="size-4" /> Failure Analysis</Link>
            </Button>
            <Button variant="secondary" asChild>
              <Link href="/execution-report"><FileBarChart className="size-4" /> Execution Report</Link>
            </Button>
            <Button variant="danger" onClick={() => { setRunning(false); toast({ title: "Execution stopped", variant: "warning" }); }}>
              <Square className="size-4" /> Stop
            </Button>
          </>
        }
      />

      <div className="flex flex-wrap gap-3">
        <Selector label="Environment" value="QA" />
        <Selector label="Browser" value="Chromium" icon={<Monitor className="size-3.5" />} />
      </div>

      {/* Progress */}
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-base">Execution Progress</CardTitle>
          <Badge variant={running ? "warning" : "success"}>
            <span className={cn("size-1.5 rounded-full", running ? "bg-warning animate-pulse" : "bg-success")} />
            {running ? "Running" : "Completed"}
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="mb-2 flex items-baseline justify-between">
            <span className="text-2xl font-semibold tabular-nums">{completed} / {total}</span>
            <span className="text-sm text-muted-foreground">{pct}%</span>
          </div>
          <Progress value={pct} indicatorClassName="bg-gradient-to-r from-primary to-fuchsia-500" />
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat dot="bg-success" label="Passed" value={132} />
            <Stat dot="bg-danger" label="Failed" value={6} />
            <Stat dot="bg-warning" label="Running" value={running ? 4 : 0} />
            <Stat dot="bg-muted-foreground" label="Skipped" value={4} />
          </div>
        </CardContent>
      </Card>

      <VariableExecutionEvidence testCaseId="TC-001" />

      {/* Live grid */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Live Execution Grid</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-5 py-3 font-medium">Test</th>
                  <th className="px-5 py-3 font-medium">Browser</th>
                  <th className="px-5 py-3 font-medium">Duration</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {executionRows.map((r) => {
                  const style = statusStyle[r.status];
                  const clickable = r.status === "Failed";
                  return (
                    <tr
                      key={r.id}
                      onClick={() => clickable && setFailure(r)}
                      className={cn(
                        "border-b border-border/60 last:border-0",
                        clickable ? "cursor-pointer hover:bg-danger/5" : "hover:bg-accent/40"
                      )}
                    >
                      <td className="px-5 py-3 font-medium">
                        {r.test}
                        {clickable && <span className="ml-2 text-xs text-danger">· view analysis</span>}
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">{r.browser}</td>
                      <td className="px-5 py-3 tabular-nums text-muted-foreground">{r.duration}</td>
                      <td className="px-5 py-3">
                        <span className={cn("flex items-center gap-2 font-medium", style.text)}>
                          <span className={cn("size-2 rounded-full", style.dot)} />
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Failure analysis drawer */}
      <Drawer open={!!failure} onClose={() => setFailure(null)}>
        {failure && (
          <div className="p-6">
            <div className="flex items-center gap-2 text-primary">
              <Sparkles className="size-4" />
              <span className="text-sm font-medium">AI Failure Analysis</span>
            </div>
            <h2 className="mt-2 text-xl font-semibold">Checkout — TC-045</h2>
            <Badge variant="danger" className="mt-2">
              <span className="size-1.5 rounded-full bg-danger" /> Failed
            </Badge>

            <div className="mt-5 rounded-lg border border-danger/30 bg-danger/5 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-danger">Failure</p>
              <p className="mt-1 text-sm font-medium">Locator not found</p>
              <div className="mt-2 rounded bg-background p-2 font-mono text-xs">
                page.locator(&quot;#checkout-button&quot;)
              </div>
            </div>

            <h3 className="mt-6 mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              AI Investigation
            </h3>
            <div className="space-y-1">
              {failureInvestigation.map((step, i) => (
                <div key={step.label} className="relative pl-9">
                  {i !== failureInvestigation.length - 1 && (
                    <span className="absolute left-[15px] top-8 h-[calc(100%-0.5rem)] w-px bg-border" />
                  )}
                  <div className={cn(
                    "absolute left-0 top-1 flex size-8 items-center justify-center rounded-full border",
                    i === failureInvestigation.length - 1 ? "border-success/40 bg-success/10 text-success" : "border-primary/30 bg-primary/10 text-primary"
                  )}>
                    <ActivityIcon name={step.icon} className="size-4" />
                  </div>
                  <div className="pb-4">
                    <p className="text-sm font-medium">{step.label}</p>
                    <p className="text-xs text-muted-foreground">{step.detail}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-lg border border-success/30 bg-success/5 p-4">
              <div className="flex items-center gap-2 text-success">
                <HeartPulse className="size-4" />
                <p className="text-sm font-medium">Self-healed and re-executed — test now passing</p>
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}

function Selector({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="flex items-center gap-1 font-medium">{icon}{value}</span>
    </div>
  );
}

function Stat({ dot, label, value }: { dot: string; label: string; value: number }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-border bg-secondary/30 px-3 py-2">
      <span className={cn("size-2.5 rounded-full", dot)} />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold tabular-nums">{value}</p>
      </div>
    </div>
  );
}
