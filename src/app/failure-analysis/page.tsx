"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle, BarChart3, Brain, Bug, CheckCircle2, CircleDot, Clock3,
  ExternalLink, Filter, HeartPulse, Search, Sparkles, TrendingDown, WandSparkles,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Drawer } from "@/components/ui/drawer";
import { StatusPill } from "@/components/ui/status-pill";
import { Progress } from "@/components/ui/progress";
import {
  FailureCategoryChart, FailedCasesTrendChart, LaunchStatisticsChart,
  InvestigatedPctChart, FailureDurationChart, TrendDots,
} from "@/components/operational/charts";
import { FailureObservability } from "@/components/operational/failure-observability";
import {
  failureAnalysisRecords, failureInvestigation, flakyTests,
  mostFailedTests, uniqueBugsTable, investigatedPct,
  type FailureAnalysisRecord,
} from "@/lib/mock-data";
import { ActivityIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";

type DashboardView = "overview" | "investigation";

export default function FailureAnalysisPage() {
  const [view, setView] = useState<DashboardView>("overview");
  const [selected, setSelected] = useState<FailureAnalysisRecord | null>(null);
  const [causeFilter, setCauseFilter] = useState("All");

  const causeOptions = ["All", ...Array.from(new Set(failureAnalysisRecords.map((f) => f.category)))];
  const filteredRecords = causeFilter === "All" ? failureAnalysisRecords : failureAnalysisRecords.filter((f) => f.category === causeFilter);
  const selfHealed = failureAnalysisRecords.filter((f) => f.status === "Self-healed").length;
  const openDefects = failureAnalysisRecords.filter((f) => f.status === "Open defect").length;
  const avgConf = Math.round(failureAnalysisRecords.reduce((s, f) => s + f.confidence, 0) / failureAnalysisRecords.length);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Failure Analysis"
        description="ReportPortal-style widget dashboard: launch statistics, investigated %, most failed, flaky tests, unique bugs, and duration analytics."
        icon={<Brain className="size-5" />}
        actions={<>
          <Button variant="secondary" asChild><Link href="/execution"><Search className="size-4" /> Execution Grid</Link></Button>
          <Button variant="gradient"><WandSparkles className="size-4" /> Analyze All</Button>
        </>}
      />

      {/* ── Dashboard / Investigation toggle ── */}
      <div className="flex items-center gap-1 rounded-xl border border-border bg-secondary/40 p-1 w-fit">
        <button onClick={() => setView("overview")} className={cn("rounded-lg px-4 py-2 text-sm font-medium transition-colors", view === "overview" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
          <BarChart3 className="mr-2 inline size-4" />Dashboard
        </button>
        <button onClick={() => setView("investigation")} className={cn("rounded-lg px-4 py-2 text-sm font-medium transition-colors", view === "investigation" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
          <Brain className="mr-2 inline size-4" />Investigation Queue
        </button>
      </div>

      {/* ═══════════════════════ DASHBOARD VIEW ═══════════════════════ */}
      {view === "overview" && (
        <div className="space-y-6">
          {/* Row 1 — KPI strip */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <KpiCard icon={CircleDot}    label="Failures analyzed"    value={failureAnalysisRecords.length} note="Latest window"      accent="text-danger" bg="bg-danger/5" />
            <KpiCard icon={HeartPulse}   label="Self-healed"          value={`${selfHealed}/${failureAnalysisRecords.length}`} note="AI locator fixes" accent="text-success" bg="bg-success/5" />
            <KpiCard icon={Bug}          label="Open defects"         value={openDefects}            note="Need escalation"     accent="text-warning" bg="bg-warning/5" />
            <KpiCard icon={Brain}        label="Avg AI confidence"    value={`${avgConf}%`}          note="Root-cause accuracy"  accent="text-primary" bg="bg-primary/5" />
          </div>

          {/* Row 2 — Launch statistics (full width) */}
          <Widget title="Launch Statistics" description="Stacked pass / failed / skipped / to-investigate across the last 7 builds — mirrors ReportPortal's Launch Statistics Bar chart." icon={BarChart3}>
            <LaunchStatisticsChart />
          </Widget>

          {/* Row 3 — Failed cases trend + Investigated % */}
          <div className="grid gap-6 lg:grid-cols-3">
            <Widget title="Failed Cases Trend" description="Failed and unresolved failure counts per build. Mirrors ReportPortal's 'Failed Cases Trend Chart'." icon={TrendingDown} className="lg:col-span-2">
              <FailedCasesTrendChart />
            </Widget>
            <Widget title="Investigated %" description="How many failures have been root-caused vs still pending. Mirrors ReportPortal's 'Investigated Percentage' donut." icon={CheckCircle2}>
              <InvestigatedPctChart />
              <div className="mt-4 space-y-2 border-t border-border pt-4">
                <ProgressRow label="Automation Bug" value={investigatedPct.automation} total={investigatedPct.investigated + investigatedPct.toInvestigate} color="bg-primary" />
                <ProgressRow label="System Issue"   value={investigatedPct.system}     total={investigatedPct.investigated + investigatedPct.toInvestigate} color="bg-warning" />
                <ProgressRow label="Product Bug"    value={investigatedPct.productBug} total={investigatedPct.investigated + investigatedPct.toInvestigate} color="bg-danger" />
                <ProgressRow label="To Investigate" value={investigatedPct.toInvestigate} total={investigatedPct.investigated + investigatedPct.toInvestigate} color="bg-muted-foreground" />
              </div>
            </Widget>
          </div>

          {/* Row 4 — Most failed + Flaky */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Most Failed Tests */}
            <Widget title="Most Failed Tests" description="Tests ranked by total failure count across the selected window. Mirrors ReportPortal's 'Most Failed Tests' widget." icon={CircleDot}>
              <div className="space-y-2 mt-1">
                {mostFailedTests.map((test, index) => (
                  <div key={test.testId} className="flex items-center gap-3 rounded-lg border border-border bg-secondary/20 p-3 hover:bg-accent/40 cursor-pointer" onClick={() => { const rec = failureAnalysisRecords.find((f) => f.testId === test.testId); if (rec) { setSelected(rec); setView("investigation"); } }}>
                    <span className={cn("flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white", index === 0 ? "bg-danger" : index === 1 ? "bg-warning" : "bg-secondary text-foreground")}>{index + 1}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{test.title}</p>
                      <p className="text-xs text-muted-foreground">{test.testId} · {test.module}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="font-mono text-sm font-bold text-danger">{test.failCount}</span>
                      <TrendDots trend={test.trend} />
                    </div>
                    <div className="w-14 text-right">
                      <span className="text-xs font-semibold text-danger">{test.failRate}%</span>
                      <p className="text-[10px] text-muted-foreground">fail rate</p>
                    </div>
                  </div>
                ))}
              </div>
            </Widget>

            {/* Flaky Tests */}
            <Widget title="Flaky Tests" description="Tests that switch between pass and fail without code changes. Mirrors ReportPortal's 'Flaky Tests' widget." icon={AlertTriangle}>
              <div className="space-y-3 mt-1">
                {flakyTests.map((test) => (
                  <div key={test.testId} className="rounded-xl border border-warning/25 bg-warning/5 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{test.title}</p>
                        <p className="font-mono text-xs text-muted-foreground">{test.testId}</p>
                      </div>
                      <Badge variant="warning">{test.flakyRate}% flaky</Badge>
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                      <div className="rounded-md border border-border bg-card p-2 text-center"><p className="text-muted-foreground">Failures</p><p className="mt-0.5 font-bold text-danger">{test.failures}</p></div>
                      <div className="rounded-md border border-border bg-card p-2 text-center"><p className="text-muted-foreground">Switches</p><p className="mt-0.5 font-bold text-warning">{test.switches}</p></div>
                      <div className="rounded-md border border-border bg-card p-2 text-center"><p className="text-muted-foreground">Flaky rate</p><p className="mt-0.5 font-bold">{test.flakyRate}%</p></div>
                    </div>
                  </div>
                ))}
              </div>
            </Widget>
          </div>

          {/* Row 5 — Failure root-cause + Duration */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Widget title="Failure Root-Cause Distribution" description="AI-classified root causes across the regression window." icon={Brain}>
              <FailureCategoryChart />
            </Widget>
            <Widget title="Failure Duration Analytics" description="Average test duration when the test is in a failed state. Long failures indicate slow detection." icon={Clock3}>
              <FailureDurationChart />
            </Widget>
          </div>

          {/* Row 6 — Unique Bugs table */}
          <Widget title="Unique Bugs" description="Distinct failure fingerprints matched to defect IDs. Mirrors ReportPortal's 'Unique Bugs' table widget." icon={Bug}>
            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground"><th className="px-4 py-3 font-medium">Bug ID</th><th className="px-4 py-3 font-medium">Test</th><th className="px-4 py-3 font-medium">Title</th><th className="px-4 py-3 font-medium">Fail count</th><th className="px-4 py-3 font-medium">First seen</th><th className="px-4 py-3 font-medium">Last seen</th><th className="px-4 py-3 font-medium">Tags</th><th className="px-4 py-3 font-medium">Status</th></tr></thead>
                <tbody>
                  {uniqueBugsTable.map((bug) => (
                    <tr key={bug.bugId} className="border-b border-border/60 last:border-0 hover:bg-accent/40">
                      <td className="px-4 py-3 font-mono text-xs text-primary">{bug.bugId}</td>
                      <td className="px-4 py-3 font-mono text-xs">{bug.test}</td>
                      <td className="px-4 py-3 font-medium">{bug.title}</td>
                      <td className="px-4 py-3"><span className="flex size-7 items-center justify-center rounded-full bg-danger/15 font-mono text-xs font-bold text-danger">{bug.failCount}</span></td>
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{bug.firstSeen}</td>
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{bug.lastSeen}</td>
                      <td className="px-4 py-3"><div className="flex flex-wrap gap-1">{bug.tags.map((tag) => <Badge key={tag} variant="secondary" className="text-[10px]">{tag}</Badge>)}</div></td>
                      <td className="px-4 py-3"><StatusPill status={bug.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Widget>

          {/* Row 7 — AI Triage Summary */}
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="border-primary/25 bg-gradient-to-br from-primary/10 via-card to-fuchsia-500/5 lg:col-span-1">
              <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Sparkles className="size-4 text-primary" /> AI Triage Summary</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {[["Highest risk",       "Checkout UI change",         "text-danger"],
                  ["Fastest fix",         "Role locator replacement",    "text-success"],
                  ["Data health concern", "TD-004 fixture stale",        "text-warning"],
                  ["Recommended action",  "Resolve BUG-103 before release", "text-primary"],
                ].map(([label, value, tone]) => (
                  <div key={label} className="rounded-lg border border-border bg-card/60 p-3">
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
                    <p className={cn("mt-1 text-sm font-medium", tone)}>{value}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card className="lg:col-span-2">
              <CardHeader><CardTitle className="text-base">Investigation Progress</CardTitle><CardDescription>Across all failures in the current regression window</CardDescription></CardHeader>
              <CardContent className="space-y-3">
                {["Self-healed", "Open defect", "Investigating", "Resolved"].map((status) => {
                  const count = failureAnalysisRecords.filter((f) => f.status === status).length;
                  const pct = Math.round(count / failureAnalysisRecords.length * 100);
                  const color = status === "Self-healed" ? "bg-success" : status === "Open defect" ? "bg-danger" : status === "Investigating" ? "bg-warning" : "bg-muted-foreground";
                  return <div key={status} className="space-y-1"><div className="flex items-center justify-between text-sm"><span className="font-medium">{status}</span><span className="font-mono text-xs text-muted-foreground">{count} · {pct}%</span></div><Progress value={pct} indicatorClassName={color} /></div>;
                })}
                <Button variant="gradient" className="mt-2 w-full" onClick={() => setView("investigation")}><Brain className="size-4" /> Open Investigation Queue</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* ═══════════════════════ INVESTIGATION VIEW ═══════════════════════ */}
      {view === "investigation" && (
        <div className="space-y-6">
          {selected && <FailureObservability record={selected} />}

          {/* Root cause filter */}
          <Card className="border-primary/25 bg-primary/5">
            <CardContent className="flex flex-wrap items-center gap-3 p-4">
              <div className="flex items-center gap-2"><Filter className="size-4 text-primary" /><span className="text-sm font-medium">Filter by root cause</span></div>
              <div className="flex flex-wrap gap-2 lg:ml-auto">
                {causeOptions.map((cause) => {
                  const count = cause === "All" ? failureAnalysisRecords.length : failureAnalysisRecords.filter((f) => f.category === cause).length;
                  return (
                    <button key={cause} onClick={() => setCauseFilter(cause)} className={cn("rounded-full border px-3 py-1.5 text-xs font-medium transition-colors", causeFilter === cause ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground hover:bg-accent hover:text-foreground")}>
                      {cause} <span className={cn("ml-1 rounded-full px-1.5 py-0.5 text-[10px]", causeFilter === cause ? "bg-white/20" : "bg-secondary")}>{count}</span>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Investigation queue table */}
          <Card>
            <CardHeader><CardTitle className="text-base">Failure Investigation Queue</CardTitle><CardDescription>Select a record to load the 5-run observability comparison above.</CardDescription></CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto scrollbar-thin">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground"><th className="px-5 py-3 font-medium">Failure</th><th className="px-5 py-3 font-medium">Category</th><th className="px-5 py-3 font-medium">Severity</th><th className="px-5 py-3 font-medium">AI confidence</th><th className="px-5 py-3 font-medium">Affected</th><th className="px-5 py-3 font-medium">Status</th></tr></thead>
                  <tbody>
                    {filteredRecords.map((record) => (
                      <tr key={record.id} onClick={() => setSelected(record)} className={cn("cursor-pointer border-b border-border/60 last:border-0 hover:bg-accent/40", selected?.id === record.id && "bg-primary/5")}>
                        <td className="px-5 py-3"><p className="font-mono text-xs text-primary">{record.id} · {record.testId}</p><p className="mt-0.5 font-medium">{record.test}</p><p className="text-xs text-muted-foreground">{record.occurredAt} · {record.duration}</p></td>
                        <td className="px-5 py-3"><Badge variant="secondary">{record.category}</Badge></td>
                        <td className="px-5 py-3"><StatusPill status={record.severity} /></td>
                        <td className="px-5 py-3"><div className="flex items-center gap-2"><div className="h-1.5 w-16 overflow-hidden rounded-full bg-secondary"><div className="h-full rounded-full bg-primary" style={{ width: `${record.confidence}%` }} /></div><span className="text-xs font-medium">{record.confidence}%</span></div></td>
                        <td className="px-5 py-3 tabular-nums">{record.affectedTests}</td>
                        <td className="px-5 py-3"><StatusPill status={record.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Drawer for deep investigation */}
          <Drawer open={!!selected && !!selected.suggestedFix} onClose={() => setSelected(null)}>
            {selected && <FailureDrawer record={selected} />}
          </Drawer>
        </div>
      )}
    </div>
  );
}

/* ── Sub-components ── */

function Widget({ title, description, icon: Icon, children, className }: { title: string; description: string; icon: typeof Brain; children: React.ReactNode; className?: string }) {
  return (
    <Card className={className}>
      <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Icon className="size-4 text-primary" />{title}</CardTitle><CardDescription>{description}</CardDescription></CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function KpiCard({ icon: Icon, label, value, note, accent, bg }: { icon: typeof Brain; label: string; value: string | number; note: string; accent: string; bg: string }) {
  return (
    <Card className={cn("border", bg === "bg-danger/5" ? "border-danger/20" : bg === "bg-success/5" ? "border-success/20" : bg === "bg-warning/5" ? "border-warning/20" : "border-primary/20")}>
      <CardContent className={cn("p-5", bg)}>
        <Icon className={cn("size-5", accent)} />
        <p className={cn("mt-2 text-3xl font-semibold", accent)}>{value}</p>
        <p className="mt-1 text-sm font-medium">{label}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{note}</p>
      </CardContent>
    </Card>
  );
}

function ProgressRow({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const pct = total ? Math.round(value / total * 100) : 0;
  return (
    <div className="flex items-center gap-3 text-xs">
      <span className="w-28 text-muted-foreground">{label}</span>
      <div className="flex-1 overflow-hidden rounded-full bg-secondary" style={{ height: 6 }}>
        <div className={cn("h-full rounded-full", color)} style={{ width: `${pct}%` }} />
      </div>
      <span className="w-8 text-right font-mono font-medium">{value}</span>
    </div>
  );
}

function FailureDrawer({ record }: { record: FailureAnalysisRecord }) {
  const { failureInvestigation: fi } = { failureInvestigation } as { failureInvestigation: typeof failureInvestigation };
  return (
    <div className="p-6">
      <div className="flex items-center gap-2 text-primary"><Sparkles className="size-4" /><span className="text-sm font-medium">AI Failure Investigation</span></div>
      <span className="mt-3 block font-mono text-xs text-primary">{record.id} · {record.testId}</span>
      <h2 className="mt-1 text-xl font-semibold">{record.test}</h2>
      <div className="mt-3 flex flex-wrap gap-2"><StatusPill status={record.severity} /><Badge variant="secondary">{record.category}</Badge><StatusPill status={record.status} /></div>
      <section className="mt-6"><h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Root cause</h3><p className="mt-2 rounded-lg border border-danger/30 bg-danger/5 p-3 text-sm">{record.rootCause}</p></section>
      <section className="mt-5"><h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Suggested remediation</h3><p className="mt-2 rounded-lg border border-success/30 bg-success/5 p-3 text-sm">{record.suggestedFix}</p></section>
      <section className="mt-6"><h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Evidence</h3><div className="flex flex-wrap gap-2">{record.evidence.map((item) => <Badge key={item} variant="secondary">{item}</Badge>)}</div></section>
      <section className="mt-6"><h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">AI investigation timeline</h3>
        <div className="space-y-1">
          {failureInvestigation.map((step, index) => (
            <div key={step.label} className="relative pl-9">
              {index !== failureInvestigation.length - 1 && <span className="absolute left-[15px] top-8 h-[calc(100%-0.5rem)] w-px bg-border" />}
              <div className={cn("absolute left-0 top-1 flex size-8 items-center justify-center rounded-full border", index === failureInvestigation.length - 1 ? "border-success/40 bg-success/10 text-success" : "border-primary/30 bg-primary/10 text-primary")}>
                <ActivityIcon name={step.icon} className="size-4" />
              </div>
              <div className="pb-4"><p className="text-sm font-medium">{step.label}</p><p className="text-xs text-muted-foreground">{step.detail}</p></div>
            </div>
          ))}
        </div>
      </section>
      <div className="mt-5 grid grid-cols-2 gap-2">
        <Button variant="gradient"><HeartPulse className="size-4" /> Apply Suggested Fix</Button>
        <Button variant="secondary"><ExternalLink className="size-4" /> Create / Open Defect</Button>
      </div>
    </div>
  );
}
