"use client";

import Link from "next/link";
import { BarChart3, Sparkles, Download, Share2, Play, GitBranch, ArrowRight, Braces } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendChart } from "@/components/reports/trend-chart";
import { VariableExecutionEvidence } from "@/components/variables/variable-evidence";
import { useToast } from "@/components/ui/toast";

const kpis = [
  { label: "Automation Coverage", value: "87%", accent: "text-fuchsia-400" },
  { label: "Requirement Coverage", value: "94%", accent: "text-primary" },
  { label: "Pass Rate", value: "92%", accent: "text-success" },
  { label: "Defect Density", value: "0.8", accent: "text-warning" },
  { label: "Self-Healing Rate", value: "94%", accent: "text-emerald-400" },
];

export default function ReportsPage() {
  const { toast } = useToast();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quality Intelligence"
        description="Release-level analytics across builds, coverage and stability."
        icon={<BarChart3 className="size-5" />}
        actions={
          <>
            <Button variant="secondary" asChild>
              <Link href="/traceability"><GitBranch className="size-4" /> Traceability</Link>
            </Button>
            <Button variant="secondary" onClick={() => toast({ title: "Downloading report", variant: "info" })}>
              <Download className="size-4" /> Download Report
            </Button>
            <Button variant="outline" onClick={() => toast({ title: "Share link copied", variant: "success" })}>
              <Share2 className="size-4" /> Share Report
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {kpis.map((k) => (
          <Card key={k.label} className="p-5">
            <p className={`text-3xl font-semibold ${k.accent}`}>{k.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{k.label}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <VariableExecutionEvidence testCaseId="TC-001" />
        <Card className="lg:col-span-2 border-primary/25 bg-primary/5"><CardContent className="p-5"><div className="flex items-center gap-2 text-primary"><Braces className="size-5" /><p className="font-medium">Variable Integrity Report</p></div><p className="mt-2 text-sm text-muted-foreground">100% of TC-001 manual steps, web/mobile/API/performance artifacts, runtime resolution, and report evidence reuse the exact immutable registry mappings: VAR-001 through VAR-004.</p><div className="mt-3 flex flex-wrap gap-1.5">{["VAR-001 → base_url", "VAR-002 → username", "VAR-003 → password", "VAR-004 → product_name"].map((item) => <Badge key={item} variant="success">{item}</Badge>)}</div></CardContent></Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Test Execution Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <TrendChart />
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-card to-fuchsia-500/5">
          <div className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-primary/10 blur-3xl" />
          <CardHeader>
            <CardTitle className="text-base">Release Quality Score</CardTitle>
          </CardHeader>
          <CardContent className="relative flex flex-col items-center text-center">
            <div className="text-7xl font-semibold text-gradient">92</div>
            <Badge variant="success" className="mt-2">Release Confidence: HIGH</Badge>
            <p className="mt-4 text-sm text-muted-foreground">
              The current build is stable. 92% of tests passed and 94% of critical requirements are covered.
              Three failures were automatically healed. Two high-priority defects require attention before release.
            </p>
            <Button variant="gradient" className="mt-5 w-full" asChild>
              <Link href="/execution-report"><Play className="size-4" /> View Execution Report</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="flex items-start gap-3 p-5">
          <Sparkles className="mt-0.5 size-5 shrink-0 text-primary" />
          <div>
            <p className="text-sm font-medium">AI Release Summary</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Build #482 is release-ready with high confidence. Coverage and stability trends are positive across
              the last 7 builds. Address BUG-102 (Critical) and BUG-103 (High) to reach full green status.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
