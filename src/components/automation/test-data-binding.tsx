"use client";

import { useState } from "react";
import { CheckCircle2, CircleAlert, Clock3, Database, Play, RefreshCw, ShieldCheck, ShieldX, TestTube2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { TestDataGovernance, TestDataSet } from "@/lib/mock-data";

type PreflightState = "idle" | "running" | "passed" | "blocked";

interface TestDataBindingProps {
  dataSet: TestDataSet;
  governance: TestDataGovernance;
  onRun: () => void;
}

export function TestDataBinding({ dataSet, governance, onRun }: TestDataBindingProps) {
  const [state, setState] = useState<PreflightState>("idle");
  const blockedBySource = dataSet.status !== "Synced" || governance.freshness === "Stale";
  const ready = state === "passed";
  const checks = [
    { label: `Schema ${governance.schemaVersion}`, detail: "Required fields and types match the generated fixture.", ok: true },
    { label: "Freshness SLA", detail: `${governance.lastValidated} · SLA ${governance.freshnessSla}`, ok: !blockedBySource },
    { label: governance.reservationPolicy, detail: "Prevents parallel workers from mutating the same data record.", ok: true },
    { label: governance.cleanupPolicy, detail: "Runs in fixture teardown even when the test fails or is interrupted.", ok: true },
    { label: governance.auditPolicy, detail: "Records dataset ID and outcome without logging secret values.", ok: true },
  ];

  const runPreflight = () => {
    setState("running");
    window.setTimeout(() => setState(blockedBySource ? "blocked" : "passed"), 700);
  };

  return (
    <Card className={cn("border", state === "blocked" ? "border-danger/40" : "border-primary/25")}>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-base"><TestTube2 className="size-4 text-primary" /> Data Quality Gate</CardTitle>
        {state === "passed" ? <Badge variant="success"><CheckCircle2 className="size-3" /> Ready to run</Badge> : state === "blocked" ? <Badge variant="danger"><ShieldX className="size-3" /> Blocked</Badge> : <Badge variant="secondary"><Clock3 className="size-3" /> Preflight required</Badge>}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between gap-3 rounded-lg bg-secondary/40 px-3 py-2">
          <div className="flex items-center gap-2"><Database className="size-4 text-primary" /><div><p className="text-sm font-medium">{dataSet.id} · {dataSet.name}</p><p className="text-xs text-muted-foreground">Health score based on source, schema, SLA and lifecycle policies</p></div></div>
          <span className={cn("text-lg font-semibold", governance.healthScore >= 90 ? "text-success" : "text-warning")}>{governance.healthScore}</span>
        </div>
        <Progress value={governance.healthScore} indicatorClassName={governance.healthScore >= 90 ? "bg-success" : "bg-warning"} />

        <div className="space-y-2">
          {checks.map((check) => <div key={check.label} className="flex gap-2 rounded-lg border border-border bg-secondary/20 px-3 py-2"><div className="pt-0.5">{check.ok ? <CheckCircle2 className="size-4 text-success" /> : <CircleAlert className="size-4 text-danger" />}</div><div><p className="text-sm font-medium">{check.label}</p><p className="text-xs text-muted-foreground">{check.detail}</p></div></div>)}
        </div>

        {state === "blocked" && <div className="rounded-lg border border-danger/30 bg-danger/5 p-3 text-sm text-danger"><p className="font-medium">Run prevented to avoid non-deterministic results.</p><p className="mt-1 text-xs">Refresh this source and validate its schema before the agent reserves any records.</p></div>}
        {state === "passed" && <div className="rounded-lg border border-success/30 bg-success/5 p-3 text-sm text-success"><p className="font-medium">Preflight passed.</p><p className="mt-1 text-xs">The agent will reserve an execution-scoped lease, use masked values, then run teardown and write an audit event.</p></div>}

        <div className="grid grid-cols-2 gap-2">
          <Button variant="secondary" disabled={state === "running"} onClick={runPreflight}>{state === "running" ? <RefreshCw className="size-4 animate-spin" /> : <ShieldCheck className="size-4" />}{state === "running" ? "Validating..." : "Run preflight"}</Button>
          <Button variant="gradient" disabled={!ready} onClick={onRun}><Play className="size-4" /> Run guarded test</Button>
        </div>
      </CardContent>
    </Card>
  );
}
