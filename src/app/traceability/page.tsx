"use client";

import { AlertTriangle, CheckCircle2, GitBranch, Link2, ShieldCheck, Unlink } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { VariableTraceabilityEvidence } from "@/components/variables/variable-evidence";
import { traceabilityCoverageMatrix, traceabilityMetrics } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const coverageCards = [
  { label: "Requirement Coverage", value: traceabilityMetrics.requirementCoverage, detail: "Requirements linked to test cases" },
  { label: "Scenario Coverage", value: traceabilityMetrics.scenarioCoverage, detail: "Acceptance criteria mapped to scenarios" },
  { label: "Automation Coverage", value: traceabilityMetrics.automationCoverage, detail: "Test cases backed by automation" },
  { label: "Execution Coverage", value: traceabilityMetrics.executionCoverage, detail: "Automated cases executed in build #482" },
];

export default function TraceabilityPage() {
  return <div className="space-y-6">
    <PageHeader title="Requirement-to-Test Traceability" description="Measure coverage and follow a requirement through scenarios, tests, automation, execution, defects, and variables." icon={<GitBranch className="size-5" />} />

    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{coverageCards.map((card) => <Card key={card.label} className="p-5"><p className="text-xs text-muted-foreground">{card.label}</p><p className="mt-1 text-3xl font-semibold">{card.value}%</p><Progress value={card.value} className="mt-3" indicatorClassName={card.value >= 90 ? "bg-success" : "bg-warning"} /><p className="mt-2 text-xs text-muted-foreground">{card.detail}</p></Card>)}</div>

    <div className="grid gap-4 md:grid-cols-3"><Metric icon={Link2} label="Fully linked defects" value={`${traceabilityMetrics.defectLinked}%`} detail="Open defects have requirement and test evidence" accent="text-success" /><Metric icon={Unlink} label="Orphaned test cases" value={traceabilityMetrics.orphanTestCases.toString()} detail="Need a linked requirement or scenario" accent="text-warning" /><Metric icon={AlertTriangle} label="Critical tests unautomated" value={traceabilityMetrics.unautomatedCritical.toString()} detail="High-priority coverage gap" accent="text-danger" /></div>

    <Card><CardHeader><CardTitle className="flex items-center gap-2 text-base"><ShieldCheck className="size-4 text-primary" /> Traceability Coverage Matrix</CardTitle><CardDescription>Requirement coverage across criteria, scenarios, test cases, automation, execution, and defects.</CardDescription></CardHeader><CardContent className="p-0"><div className="overflow-x-auto scrollbar-thin"><table className="w-full text-sm"><thead><tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground"><th className="px-5 py-3 font-medium">Requirement</th><th className="px-5 py-3 font-medium">Criteria</th><th className="px-5 py-3 font-medium">Scenarios</th><th className="px-5 py-3 font-medium">Test Cases</th><th className="px-5 py-3 font-medium">Automated</th><th className="px-5 py-3 font-medium">Passed</th><th className="px-5 py-3 font-medium">Defects</th><th className="px-5 py-3 font-medium">Coverage</th></tr></thead><tbody>{traceabilityCoverageMatrix.map((row) => <tr key={row.requirement} className="border-b border-border/60 last:border-0 hover:bg-accent/40"><td className="px-5 py-3"><p className="font-mono text-xs text-primary">{row.requirement}</p><p className="mt-0.5 font-medium">{row.title}</p></td><td className="px-5 py-3 tabular-nums">{row.criteria}</td><td className="px-5 py-3 tabular-nums">{row.scenarios}</td><td className="px-5 py-3 tabular-nums">{row.testCases}</td><td className="px-5 py-3 tabular-nums">{row.automated}</td><td className="px-5 py-3 tabular-nums text-success">{row.passed}</td><td className="px-5 py-3"><Badge variant={row.defects ? "danger" : "success"}>{row.defects}</Badge></td><td className="px-5 py-3"><div className="flex items-center gap-2"><Progress value={row.coverage} className="w-20" indicatorClassName={row.coverage >= 90 ? "bg-success" : "bg-warning"} /><span className="text-xs font-medium">{row.coverage}%</span></div></td></tr>)}</tbody></table></div></CardContent></Card>

    <VariableTraceabilityEvidence testCaseId="TC-001" />
  </div>;
}

function Metric({ icon: Icon, label, value, detail, accent }: { icon: typeof Link2; label: string; value: string; detail: string; accent: string }) { return <Card><CardContent className="p-5"><Icon className={cn("size-5", accent)} /><p className="mt-3 text-2xl font-semibold">{value}</p><p className="mt-1 text-sm font-medium">{label}</p><p className="mt-1 text-xs text-muted-foreground">{detail}</p></CardContent></Card>; }
