"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Sparkles, Bot, Play, Check, Pencil, ArrowRight, Database, Link2, Braces, FileCheck2, ListChecks } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusPill } from "@/components/ui/status-pill";
import { Drawer } from "@/components/ui/drawer";
import { useToast } from "@/components/ui/toast";
import { CanonicalVariableRegistry } from "@/components/test-cases/canonical-variable-registry";
import { AutomateTestCaseModal } from "@/components/recorder/automate-test-case-modal";
import { generateBddFeature, validateCanonicalVariables } from "@/lib/canonical-variables";
import { testCases, testDataSets, type TestCase } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

type TestCaseFormat = "standard" | "bdd";

export default function TestCasesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [format, setFormat] = useState<TestCaseFormat>("standard");
  const [selected, setSelected] = useState<TestCase | null>(null);
  const [recorderTestCase, setRecorderTestCase] = useState<TestCase | null>(null);
  const selectedDataSets = selected ? testDataSets.filter((dataSet) => selected.testDataSetIds.includes(dataSet.id)) : [];
  const validationErrors = selected ? validateCanonicalVariables(selected.id, selected.variables, selected.manualSteps).filter((issue) => issue.severity === "error") : [];
  const formatLabel = format === "standard" ? "Standard Test Cases" : "BDD / Gherkin Scenarios";

  const switchFormat = (nextFormat: TestCaseFormat) => {
    setFormat(nextFormat);
    setSelected(null);
  };

  return <div className="space-y-6">
    <PageHeader title="Test Cases" description={format === "standard" ? "Develop detailed manual test cases with a canonical, immutable variable registry." : "Review executable BDD scenarios derived from the same canonical variable registry."} icon={<FileText className="size-5" />} actions={<Badge variant="default" className="px-3 py-1"><Sparkles className="size-3" /> 186 {format === "standard" ? "Test Cases" : "Scenarios"}</Badge>} />

    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-2">
      <div className="flex rounded-lg bg-secondary/60 p-1">
        <button onClick={() => switchFormat("standard")} className={cn("flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors", format === "standard" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}><ListChecks className="size-4" /> Standard Test Cases</button>
        <button onClick={() => switchFormat("bdd")} className={cn("flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors", format === "bdd" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}><FileCheck2 className="size-4" /> BDD / Gherkin</button>
      </div>
      <p className="px-2 text-xs text-muted-foreground">Only the selected format is displayed. Variable IDs and names remain shared.</p>
    </div>

    <div className="flex flex-wrap gap-2">{["Requirement", "Scenario", "Priority", format === "standard" ? "Test Case Type" : "Feature", "Canonical Variables", "Test Data", "Automation Status"].map((filter) => <button key={filter} className="flex items-center gap-1.5 rounded-lg border border-border bg-secondary/40 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground">{filter}<ArrowRight className="size-3 rotate-90" /></button>)}</div>

    <Card><CardContent className="p-0"><div className="overflow-x-auto scrollbar-thin"><table className="w-full text-sm"><thead><tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground"><th className="px-5 py-3 font-medium">{format === "standard" ? "TC ID" : "Scenario ID"}</th><th className="px-5 py-3 font-medium">{format === "standard" ? "Test Case" : "Feature / Scenario"}</th><th className="px-5 py-3 font-medium">Priority</th><th className="px-5 py-3 font-medium">Canonical Variables</th><th className="px-5 py-3 font-medium">Test Data</th><th className="px-5 py-3 font-medium">{format === "standard" ? "Automation" : "BDD Status"}</th><th className="px-5 py-3 font-medium">Status</th></tr></thead><tbody>{testCases.map((test) => <tr key={test.id} onClick={() => setSelected(test)} className="cursor-pointer border-b border-border/60 last:border-0 hover:bg-accent/40"><td className="px-5 py-3"><span className="font-mono text-xs font-medium text-primary">{test.id}</span></td><td className="px-5 py-3">{format === "standard" ? <><p className="font-medium">{test.title}</p><p className="text-xs text-muted-foreground">{test.type}</p></> : <><p className="font-medium">Feature: {test.requirement}</p><p className="text-xs text-muted-foreground">Scenario: {test.title}</p></>}</td><td className="px-5 py-3"><StatusPill status={test.priority} /></td><td className="px-5 py-3"><span className="flex items-center gap-1.5 text-xs text-muted-foreground"><Braces className="size-3.5 text-primary" />{test.variables.length} mapped</span></td><td className="px-5 py-3"><span className="flex items-center gap-1.5 text-xs text-muted-foreground"><Database className="size-3.5 text-primary" />{test.testDataSetIds.length} set{test.testDataSetIds.length === 1 ? "" : "s"}</span></td><td className="px-5 py-3">{format === "standard" ? <StatusPill status={test.automation} /> : <Badge variant="success"><FileCheck2 className="size-3" /> Generated</Badge>}</td><td className="px-5 py-3"><StatusPill status={test.status} /></td></tr>)}</tbody></table></div></CardContent></Card>

    <Drawer open={!!selected} onClose={() => setSelected(null)} className="max-w-2xl">
      {selected && <div className="p-6"><div className="flex items-start justify-between gap-4"><div><span className="font-mono text-xs font-medium text-primary">{selected.id}</span><h2 className="mt-1 text-xl font-semibold">{format === "standard" ? selected.title : `Scenario: ${selected.title}`}</h2></div><Badge variant={format === "standard" ? "default" : "success"}>{format === "standard" ? "Standard" : "BDD / Gherkin"}</Badge></div><div className="mt-3 flex flex-wrap gap-2"><StatusPill status={selected.priority} /><Badge variant="secondary">{selected.type}</Badge><StatusPill status={selected.status} /></div>
        {format === "standard" ? <Section title="Manual Test Case"><ol className="space-y-2">{selected.manualSteps.map((step) => <li key={step.step} className="flex gap-3 rounded-lg border border-border bg-secondary/20 p-3"><span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary">{step.step}</span><div><p className="text-sm">{step.instruction}</p><p className="mt-1 text-xs text-muted-foreground">Automation step {step.automationStep} · {step.variableIds.length ? step.variableIds.join(", ") : "No variable"}</p></div></li>)}</ol></Section> : <Section title="Gherkin Scenario"><div className="overflow-x-auto rounded-lg border border-border bg-secondary/20 p-4"><pre className="whitespace-pre-wrap font-mono text-xs leading-6 text-foreground">{generateBddFeature({ testCaseId: selected.id, requirementId: selected.requirement, title: selected.title, variables: selected.variables, manualSteps: selected.manualSteps })}</pre></div><p className="mt-2 text-xs text-muted-foreground">This is the selected BDD representation only. It retains the exact canonical &#123;&#123;variable_name&#125;&#125; references and stable IDs.</p></Section>}
        <Section title="Source-backed Test Data"><div className="space-y-2">{selectedDataSets.map((dataSet) => <div key={dataSet.id} className="rounded-lg border border-border bg-secondary/20 p-3"><p className="flex items-center gap-2 text-sm font-medium"><Database className="size-4 text-primary" />{dataSet.name}</p><p className="mt-1 text-xs text-muted-foreground">{dataSet.id} · {dataSet.source} · {dataSet.environment}</p></div>)}<Button variant="outline" size="sm" onClick={() => router.push(`/test-data?testCase=${selected.id}`)}><Link2 className="size-3.5" /> Manage Test Data</Button></div></Section>
        <Section title="Canonical Variable Registry"><CanonicalVariableRegistry testCase={selected} /></Section>
        <div className="mt-6 grid grid-cols-2 gap-2"><Button variant="secondary" onClick={() => toast({ title: `Edit ${formatLabel}`, variant: "info" })}><Pencil className="size-4" /> Edit</Button><Button variant="secondary" disabled={validationErrors.length > 0} onClick={() => setRecorderTestCase(selected)}><Bot className="size-4" /> Automate Test Case</Button><Button variant="gradient" onClick={() => router.push("/execution")}><Play className="size-4" /> Execute</Button><Button variant="success" onClick={() => toast({ title: `${formatLabel} approved`, variant: "success" })}><Check className="size-4" /> Approve</Button></div>{validationErrors.length > 0 && <p className="mt-2 text-xs text-danger">Resolve canonical variable validation before generating automation.</p>}
      </div>}
    </Drawer>

    <AutomateTestCaseModal testCase={recorderTestCase} open={!!recorderTestCase} onClose={() => setRecorderTestCase(null)} onOpenManual={() => { setRecorderTestCase(null); router.push("/recorder"); }} />
  </div>;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) { return <section className="mt-6"><h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</h3>{children}</section>; }
