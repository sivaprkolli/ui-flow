"use client";

import { useMemo, useState } from "react";
import {
  Database, Plus, Upload, RefreshCw, ShieldCheck, Cloud, FileJson, Github, WandSparkles,
  Server, EyeOff, Link2, Check, ExternalLink, ListChecks, LockKeyhole, RotateCcw, CircleAlert,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Drawer } from "@/components/ui/drawer";
import { StatusPill } from "@/components/ui/status-pill";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/toast";
import { testCases, testDataGovernance, testDataSets, type TestDataSet } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const sourceMeta = {
  Database: { icon: Database, label: "Database", className: "text-sky-400 bg-sky-500/10" },
  API: { icon: Cloud, label: "API", className: "text-violet-400 bg-violet-500/10" },
  File: { icon: FileJson, label: "File", className: "text-amber-400 bg-amber-500/10" },
  Repository: { icon: Github, label: "Repository", className: "text-foreground bg-secondary" },
  Synthetic: { icon: WandSparkles, label: "Synthetic", className: "text-fuchsia-400 bg-fuchsia-500/10" },
};

export default function TestDataPage() {
  const { toast } = useToast();
  const [selected, setSelected] = useState<TestDataSet | null>(null);
  const [sourceFilter, setSourceFilter] = useState("All");
  const [environment, setEnvironment] = useState("QA");
  const filtered = useMemo(() => testDataSets.filter((set) => (sourceFilter === "All" || set.sourceType === sourceFilter) && set.environment === environment), [environment, sourceFilter]);
  const sourceSummary = Object.entries(sourceMeta).map(([type, meta]) => ({ type, ...meta, count: testDataSets.filter((set) => set.sourceType === type).length }));
  const healthyCount = testDataGovernance.filter((policy) => policy.healthScore >= 90 && policy.freshness === "Fresh").length;

  return <div className="space-y-6">
    <PageHeader title="Test Data" description="Govern source-backed datasets with schema validation, worker isolation and deterministic cleanup." icon={<Database className="size-5" />} actions={<>
      <Button variant="gradient" onClick={() => toast({ title: "New dataset", description: "Choose a source, schema contract and lifecycle policy to begin.", variant: "success" })}><Plus className="size-4" /> New Dataset</Button>
      <Button variant="secondary" onClick={() => toast({ title: "Import data", description: "CSV and JSON imports are ready for mapping and contract validation.", variant: "info" })}><Upload className="size-4" /> Import CSV / JSON</Button>
      <Button variant="outline" onClick={() => toast({ title: "Sync started", description: "Refreshing sources and validating schemas before they can be used.", variant: "info" })}><RefreshCw className="size-4" /> Sync All</Button>
    </>} />

    <div className="grid gap-4 md:grid-cols-3">
      <Card className="border-success/25 bg-success/5"><CardContent className="p-5"><div className="flex items-center gap-2 text-success"><ShieldCheck className="size-5" /><p className="text-sm font-medium">Quality-gated sources</p></div><p className="mt-2 text-3xl font-semibold">{healthyCount} / {testDataSets.length}</p><p className="mt-1 text-xs text-muted-foreground">Fresh, schema-compatible and ready for guarded execution.</p></CardContent></Card>
      <Card><CardContent className="p-5"><div className="flex items-center gap-2 text-primary"><LockKeyhole className="size-5" /><p className="text-sm font-medium">Isolation policy</p></div><p className="mt-2 text-sm font-semibold">Execution-scoped leases</p><p className="mt-1 text-xs text-muted-foreground">Parallel workers cannot mutate the same record.</p></CardContent></Card>
      <Card><CardContent className="p-5"><div className="flex items-center gap-2 text-fuchsia-400"><EyeOff className="size-5" /><p className="text-sm font-medium">Audit policy</p></div><p className="mt-2 text-sm font-semibold">Masked by default</p><p className="mt-1 text-xs text-muted-foreground">Dataset IDs and outcomes are logged; sensitive values never are.</p></CardContent></Card>
    </div>

    <Card className="border-primary/25 bg-gradient-to-r from-primary/8 via-card to-fuchsia-500/5"><CardContent className="flex flex-wrap items-center gap-x-6 gap-y-3 p-5"><div className="flex items-center gap-2 text-sm font-medium"><ShieldCheck className="size-5 text-success" /> Fail closed before execution</div><p className="text-sm text-muted-foreground">The QA Agent blocks stale or incompatible data sources before a record is reserved.</p><Badge variant="success"><Check className="size-3" /> QA vault policy active</Badge></CardContent></Card>

    <section><div className="mb-3 flex items-center justify-between"><h2 className="text-base font-semibold">Connected Sources</h2><span className="text-xs text-muted-foreground">{testDataSets.length} managed datasets</span></div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">{sourceSummary.map((source) => { const Icon = source.icon; return <button key={source.type} onClick={() => setSourceFilter(sourceFilter === source.type ? "All" : source.type)} className={cn("rounded-xl border bg-card p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-md", sourceFilter === source.type ? "border-primary ring-1 ring-primary/25" : "border-border")}><div className={cn("flex size-9 items-center justify-center rounded-lg", source.className)}><Icon className="size-4" /></div><p className="mt-3 text-sm font-medium">{source.label}</p><p className="mt-0.5 text-xs text-muted-foreground">{source.count} dataset{source.count === 1 ? "" : "s"}</p></button>; })}</div></section>

    <div className="flex flex-wrap items-center gap-2"><span className="mr-1 text-xs text-muted-foreground">Environment</span>{["QA", "Staging", "Local"].map((env) => <button key={env} onClick={() => setEnvironment(env)} className={cn("rounded-full border px-3 py-1.5 text-xs font-medium", environment === env ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-accent")}><Server className="mr-1 inline size-3" />{env}</button>)}{sourceFilter !== "All" && <button onClick={() => setSourceFilter("All")} className="ml-1 text-xs font-medium text-primary hover:underline">Clear source filter</button>}</div>

    <Card><CardHeader className="flex-row items-start justify-between"><div><CardTitle className="text-base">Dataset Registry</CardTitle><CardDescription>Source lineage, data contract health and assignment coverage.</CardDescription></div><Badge variant="secondary">{filtered.length} visible</Badge></CardHeader><CardContent className="p-0"><div className="overflow-x-auto scrollbar-thin"><table className="w-full text-sm"><thead><tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground"><th className="px-5 py-3 font-medium">Dataset</th><th className="px-5 py-3 font-medium">Source</th><th className="px-5 py-3 font-medium">Environment</th><th className="px-5 py-3 font-medium">Health</th><th className="px-5 py-3 font-medium">Lifecycle</th><th className="px-5 py-3 font-medium">Last validation</th><th className="px-5 py-3 font-medium">Status</th></tr></thead><tbody>{filtered.map((set) => { const meta = sourceMeta[set.sourceType]; const Icon = meta.icon; const policy = testDataGovernance.find((item) => item.dataSetId === set.id)!; return <tr key={set.id} onClick={() => setSelected(set)} className="cursor-pointer border-b border-border/60 last:border-0 hover:bg-accent/40"><td className="px-5 py-3"><span className="font-mono text-xs font-medium text-primary">{set.id}</span><p className="mt-0.5 font-medium">{set.name}</p></td><td className="px-5 py-3"><span className="flex items-center gap-1.5"><Icon className={cn("size-4", meta.className.split(" ")[0])} />{set.source}</span></td><td className="px-5 py-3"><Badge variant="secondary">{set.environment}</Badge></td><td className="px-5 py-3"><span className={cn("font-semibold", policy.healthScore >= 90 ? "text-success" : "text-warning")}>{policy.healthScore}</span><span className="ml-1 text-xs text-muted-foreground">/ 100</span></td><td className="px-5 py-3"><Badge variant={policy.freshness === "Fresh" ? "success" : "warning"}>{policy.freshness}</Badge></td><td className="px-5 py-3 text-muted-foreground">{policy.lastValidated}</td><td className="px-5 py-3"><StatusPill status={set.status} /></td></tr>; })}</tbody></table></div>{!filtered.length && <p className="p-8 text-center text-sm text-muted-foreground">No data sources match these filters.</p>}</CardContent></Card>

    <Drawer open={!!selected} onClose={() => setSelected(null)}>{selected && <DatasetDrawer dataSet={selected} onSync={() => toast({ title: `${selected.name} synchronized`, description: "Source freshness, schema and masking policy validated.", variant: "success" })} onAssign={() => toast({ title: "Dataset assignment opened", description: `${selected.testCaseIds.length} linked test cases found.`, variant: "info" })} />}</Drawer>
  </div>;
}

function DatasetDrawer({ dataSet, onSync, onAssign }: { dataSet: TestDataSet; onSync: () => void; onAssign: () => void }) {
  const meta = sourceMeta[dataSet.sourceType]; const Icon = meta.icon;
  const policy = testDataGovernance.find((item) => item.dataSetId === dataSet.id)!;
  const relatedCases = testCases.filter((test) => dataSet.testCaseIds.includes(test.id));
  const fresh = policy.freshness === "Fresh" && dataSet.status === "Synced";
  return <div className="p-6"><span className="font-mono text-xs font-medium text-primary">{dataSet.id}</span><h2 className="mt-1 text-xl font-semibold">{dataSet.name}</h2><div className="mt-3 flex flex-wrap gap-2"><Badge variant="secondary"><Icon className="size-3" /> {meta.label}</Badge><Badge variant="secondary">{dataSet.environment}</Badge><Classification value={dataSet.classification} /><StatusPill status={dataSet.status} /></div>
    <div className="mt-6 rounded-xl border border-border bg-secondary/30 p-4"><p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Data source</p><p className="mt-1 flex items-center gap-2 text-sm font-medium"><Link2 className="size-4 text-primary" />{dataSet.source}</p><p className="mt-1 text-xs text-muted-foreground">{dataSet.records.toLocaleString()} records · last refreshed {dataSet.lastSynced}</p></div>
    <section className="mt-6"><div className="mb-2 flex items-center justify-between"><h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Automation safeguards</h3><Badge variant={fresh ? "success" : "danger"}>{fresh ? "Eligible for run" : "Execution blocked"}</Badge></div><div className="rounded-xl border border-border p-4"><div className="flex items-center justify-between"><div><p className="text-sm font-medium">Data health</p><p className="text-xs text-muted-foreground">Source, contract and lifecycle confidence</p></div><span className={cn("text-2xl font-semibold", policy.healthScore >= 90 ? "text-success" : "text-warning")}>{policy.healthScore}</span></div><Progress className="mt-3" value={policy.healthScore} indicatorClassName={policy.healthScore >= 90 ? "bg-success" : "bg-warning"} /><div className="mt-4 space-y-2"><><div className="flex gap-2 text-sm"><ListChecks className="mt-0.5 size-4 shrink-0 text-primary" /><div><p className="font-medium">Schema {policy.schemaVersion}</p><p className="text-xs text-muted-foreground">Validated {policy.lastValidated}</p></div></div><div className="flex gap-2 text-sm"><LockKeyhole className="mt-0.5 size-4 shrink-0 text-primary" /><div><p className="font-medium">{policy.reservationPolicy}</p><p className="text-xs text-muted-foreground">Worker-level isolation</p></div></div><div className="flex gap-2 text-sm"><RotateCcw className="mt-0.5 size-4 shrink-0 text-primary" /><div><p className="font-medium">{policy.cleanupPolicy}</p><p className="text-xs text-muted-foreground">Runs even after a failure</p></div></div><div className="flex gap-2 text-sm"><EyeOff className="mt-0.5 size-4 shrink-0 text-primary" /><div><p className="font-medium">{policy.auditPolicy}</p><p className="text-xs text-muted-foreground">Values remain masked</p></div></div></></div></div>{!fresh && <div className="mt-3 flex gap-2 rounded-lg border border-danger/30 bg-danger/5 p-3 text-sm text-danger"><CircleAlert className="mt-0.5 size-4 shrink-0" /><div><p className="font-medium">Preflight will fail closed.</p><p className="text-xs">Refresh this source and revalidate its schema before automation can reserve records.</p></div></div>}</section>
    <section className="mt-6"><h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Masked field preview</h3><div className="space-y-2">{dataSet.fields.map((field) => <div key={field.key} className="flex items-center justify-between rounded-lg border border-border bg-secondary/20 px-3 py-2"><div><p className="font-mono text-sm">{field.key}</p><p className="text-[11px] text-muted-foreground">{field.classification}</p></div><code className="max-w-[55%] truncate rounded bg-background px-2 py-1 text-xs">{field.value}</code></div>)}</div></section>
    <section className="mt-6"><h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Assigned test cases</h3><div className="flex flex-wrap gap-2">{relatedCases.map((test) => <Badge key={test.id} variant="default">{test.id} · {test.title}</Badge>)}</div></section>
    <div className="mt-6 grid grid-cols-2 gap-2"><Button variant="secondary" onClick={onSync}><RefreshCw className="size-4" /> Refresh & validate</Button><Button variant="gradient" onClick={onAssign}><Link2 className="size-4" /> Assign to tests</Button><Button variant="outline" className="col-span-2"><EyeOff className="size-4" /> Review masking policy <ExternalLink className="ml-auto size-3.5" /></Button></div>
  </div>;
}

function Classification({ value }: { value: TestDataSet["classification"] }) { const variant = value === "Secret" ? "danger" : value === "Masked PII" ? "warning" : value === "Synthetic" ? "purple" : "success"; return <Badge variant={variant}><EyeOff className="size-3" /> {value}</Badge>; }
