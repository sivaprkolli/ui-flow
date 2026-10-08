"use client";

import Link from "next/link";
import { BarChart3, CheckCircle2, Clock3, Download, FileBarChart, Play, RotateCcw, Share2, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ExecutionDurationChart, BrowserExecutionChart } from "@/components/operational/charts";
import { executionReportMetrics, executionRows } from "@/lib/mock-data";
import { useToast } from "@/components/ui/toast";

export default function ExecutionReportPage() {
  const { toast } = useToast();
  const metrics = executionReportMetrics;
  return <div className="space-y-6">
    <PageHeader title="Execution Report" description={`Build ${metrics.build} · ${metrics.suite} · completed in ${metrics.duration}.`} icon={<FileBarChart className="size-5" />} actions={<><Button variant="secondary" asChild><Link href="/execution"><Play className="size-4" /> Live Execution</Link></Button><Button variant="secondary" onClick={() => toast({ title: "Downloading execution report", description: `Build ${metrics.build} report queued.`, variant: "info" })}><Download className="size-4" /> Export</Button><Button variant="outline" onClick={() => toast({ title: "Execution report link copied", variant: "success" })}><Share2 className="size-4" /> Share</Button></>} />

    <Card className="border-primary/25 bg-gradient-to-r from-primary/8 via-card to-fuchsia-500/5"><CardContent className="flex flex-wrap items-center gap-5 p-5"><div><p className="text-xs text-muted-foreground">Execution verdict</p><p className="mt-1 flex items-center gap-2 text-xl font-semibold"><CheckCircle2 className="size-5 text-success" /> Stable with follow-up</p></div><Badge variant="success">Pass rate {metrics.passRate}%</Badge><Badge variant="warning">{metrics.retries} retries</Badge><Badge variant="success"><Sparkles className="size-3" /> {metrics.selfHealed} self-healed</Badge><p className="ml-auto text-sm text-muted-foreground">Build {metrics.build} is ready once critical open defects are addressed.</p></CardContent></Card>

    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6"><Metric label="Total" value={metrics.total.toString()} icon={BarChart3} tone="text-primary" /><Metric label="Passed" value={metrics.passed.toString()} icon={CheckCircle2} tone="text-success" /><Metric label="Failed" value={metrics.failed.toString()} icon={FileBarChart} tone="text-danger" /><Metric label="Skipped" value={metrics.skipped.toString()} icon={RotateCcw} tone="text-muted-foreground" /><Metric label="Duration" value={metrics.duration} icon={Clock3} tone="text-sky-400" /><Metric label="Avg. duration" value={metrics.avgDuration} icon={Clock3} tone="text-fuchsia-400" /></div>

    <div className="grid gap-6 lg:grid-cols-3"><Card className="lg:col-span-2"><CardHeader><CardTitle className="text-base">Execution Duration & Pass Rate</CardTitle><CardDescription>Build-over-build execution efficiency and reliability.</CardDescription></CardHeader><CardContent><ExecutionDurationChart /></CardContent></Card><Card><CardHeader><CardTitle className="text-base">Result Composition</CardTitle><CardDescription>Latest build outcome.</CardDescription></CardHeader><CardContent className="space-y-4"><ResultRow label="Passed" value={metrics.passed} total={metrics.total} tone="bg-success" /><ResultRow label="Failed" value={metrics.failed} total={metrics.total} tone="bg-danger" /><ResultRow label="Skipped" value={metrics.skipped} total={metrics.total} tone="bg-muted-foreground" /><div className="rounded-lg border border-border bg-secondary/30 p-3 text-xs text-muted-foreground">{metrics.selfHealed} failure(s) recovered autonomously before final report generation.</div></CardContent></Card></div>

    <div className="grid gap-6 lg:grid-cols-2"><Card><CardHeader><CardTitle className="text-base">Cross-Browser Execution</CardTitle><CardDescription>Results by supported browser target.</CardDescription></CardHeader><CardContent><BrowserExecutionChart /></CardContent></Card><Card><CardHeader><CardTitle className="text-base">Latest Execution Results</CardTitle><CardDescription>Most recent individual test outcomes from build {metrics.build}.</CardDescription></CardHeader><CardContent className="p-0"><div className="max-h-[310px] overflow-auto scrollbar-thin"><table className="w-full text-sm"><thead className="sticky top-0 bg-card"><tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground"><th className="px-5 py-3 font-medium">Test</th><th className="px-5 py-3 font-medium">Duration</th><th className="px-5 py-3 font-medium">Status</th></tr></thead><tbody>{executionRows.map((row) => <tr key={row.id} className="border-b border-border/60 last:border-0"><td className="px-5 py-3"><p className="font-medium">{row.test}</p><p className="font-mono text-xs text-primary">{row.id}</p></td><td className="px-5 py-3 tabular-nums text-muted-foreground">{row.duration}</td><td className="px-5 py-3"><Badge variant={row.status === "Passed" ? "success" : row.status === "Failed" ? "danger" : row.status === "Running" ? "warning" : "secondary"}>{row.status}</Badge></td></tr>)}</tbody></table></div></CardContent></Card></div>
  </div>;
}

function Metric({ label, value, icon: Icon, tone }: { label: string; value: string; icon: typeof BarChart3; tone: string }) { return <Card><CardContent className="p-4"><Icon className={`size-4 ${tone}`} /><p className="mt-2 text-2xl font-semibold">{value}</p><p className="mt-1 text-xs text-muted-foreground">{label}</p></CardContent></Card>; }
function ResultRow({ label, value, total, tone }: { label: string; value: number; total: number; tone: string }) { const percent = Math.round((value / total) * 1000) / 10; return <div><div className="mb-1 flex items-center justify-between text-sm"><span>{label}</span><span className="font-medium">{value} · {percent}%</span></div><Progress value={percent} indicatorClassName={tone} /></div>; }
