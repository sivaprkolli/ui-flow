"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, CircleDot, Database, Layers3, Play, ShieldCheck, Tag, TestTube2, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { executionTestCatalog, testDataGovernance } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

type ScopeMode = "module" | "feature" | "tag";

export function ExecutionControlCenter({ onRunScope }: { onRunScope: (count: number, label: string) => void }) {
  const [mode, setMode] = useState<ScopeMode>("module");
  const values = useMemo(() => Array.from(new Set(executionTestCatalog.flatMap((test) => mode === "module" ? [test.module] : mode === "feature" ? [test.feature] : test.tags))).sort(), [mode]);
  const [scope, setScope] = useState("Authentication");
  const [retries, setRetries] = useState(true);
  const [artifacts, setArtifacts] = useState(true);
  const selectedTests = useMemo(() => executionTestCatalog.filter((test) => mode === "module" ? test.module === scope : mode === "feature" ? test.feature === scope : test.tags.includes(scope)), [mode, scope]);
  const staleData = testDataGovernance.filter((item) => item.freshness === "Stale");

  const switchMode = (next: ScopeMode) => {
    setMode(next);
    const nextValues = Array.from(new Set(executionTestCatalog.flatMap((test) => next === "module" ? [test.module] : next === "feature" ? [test.feature] : test.tags))).sort();
    setScope(nextValues[0]);
  };

  return <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
    <Card className="border-primary/25"><CardHeader className="flex-row items-start justify-between"><div><CardTitle className="flex items-center gap-2 text-base"><TestTube2 className="size-4 text-primary" /> Run Scope & Preflight</CardTitle><CardDescription>Choose module, feature, or tag and validate execution prerequisites before starting.</CardDescription></div><Badge variant="success"><CheckCircle2 className="size-3" /> Ready</Badge></CardHeader><CardContent className="space-y-4"><div className="flex rounded-lg bg-secondary/60 p-1">{(["module", "feature", "tag"] as ScopeMode[]).map((item) => <button key={item} onClick={() => switchMode(item)} className={cn("flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium capitalize", mode === item ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>{item === "module" ? <Layers3 className="size-4" /> : item === "feature" ? <CircleDot className="size-4" /> : <Tag className="size-4" />}{item}</button>)}</div><label><span className="mb-1.5 block text-xs text-muted-foreground">Selected {mode}</span><select value={scope} onChange={(event) => setScope(event.target.value)} className="h-10 w-full rounded-lg border border-border bg-secondary/20 px-3 text-sm outline-none focus:ring-2 focus:ring-ring">{values.map((value) => <option key={value}>{value}</option>)}</select></label><div className="rounded-xl border border-border bg-secondary/20 p-3"><div className="flex items-center justify-between"><div><p className="text-sm font-medium">{selectedTests.length} tests selected</p><p className="text-xs text-muted-foreground">{selectedTests.filter((test) => test.status === "Failed").length} previously failed · {selectedTests.filter((test) => test.status === "Flaky").length} flaky</p></div><div className="flex -space-x-1">{selectedTests.slice(0, 5).map((test) => <span key={test.id} title={test.title} className={cn("flex size-7 items-center justify-center rounded-full border-2 border-card text-[10px] font-semibold", test.status === "Failed" ? "bg-danger/20 text-danger" : test.status === "Flaky" ? "bg-warning/20 text-warning" : "bg-success/15 text-success")}>{test.id.replace(/[^0-9]/g, "").slice(-2) || "T"}</span>)}</div></div></div><div className="grid grid-cols-2 gap-2"><Toggle label="Retry failures" detail="Up to 2 attempts" on={retries} onToggle={() => setRetries((value) => !value)} /><Toggle label="Capture artifacts" detail="Trace, video, HAR" on={artifacts} onToggle={() => setArtifacts((value) => !value)} /></div><Button variant="gradient" className="w-full" onClick={() => onRunScope(selectedTests.length, `${mode}: ${scope}`)}><Play className="size-4" /> Run {selectedTests.length} Selected Tests</Button></CardContent></Card>
    <Card><CardHeader><CardTitle className="flex items-center gap-2 text-base"><ShieldCheck className="size-4 text-primary" /> Execution Preflight</CardTitle><CardDescription>Live readiness checks for this scope.</CardDescription></CardHeader><CardContent className="space-y-2"><Preflight label="QA environment" detail="https://qa.example.test · healthy" status="ok" /><Preflight label="Worker pool" detail="4 of 4 workers available" status="ok" /><Preflight label="Canonical variables" detail="All selected tests resolved" status="ok" /><Preflight label="Test data health" detail={staleData.length ? `${staleData.length} source needs refresh: TD-004` : "All data sources fresh"} status={staleData.length ? "warning" : "ok"} /><Preflight label="Recorder artifacts" detail={artifacts ? "Trace, screenshots and video enabled" : "Disabled for this run"} status={artifacts ? "ok" : "warning"} /></CardContent></Card>
  </div>;
}

function Toggle({ label, detail, on, onToggle }: { label: string; detail: string; on: boolean; onToggle: () => void }) { return <button onClick={onToggle} className={cn("rounded-lg border p-3 text-left", on ? "border-primary/30 bg-primary/5" : "border-border bg-secondary/20")}><div className="flex items-center justify-between"><span className="text-sm font-medium">{label}</span><span className={cn("relative h-5 w-9 rounded-full", on ? "bg-primary" : "bg-muted-foreground/30")}><span className={cn("absolute top-0.5 size-4 rounded-full bg-white transition-transform", on ? "translate-x-4" : "translate-x-0.5")} /></span></div><p className="mt-1 text-xs text-muted-foreground">{detail}</p></button>; }
function Preflight({ label, detail, status }: { label: string; detail: string; status: "ok" | "warning" }) { return <div className="flex items-start gap-3 rounded-lg border border-border bg-secondary/20 p-3">{status === "ok" ? <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" /> : <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" />}<div><p className="text-sm font-medium">{label}</p><p className="text-xs text-muted-foreground">{detail}</p></div></div>; }
