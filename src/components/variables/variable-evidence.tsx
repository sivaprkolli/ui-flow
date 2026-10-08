import { Braces, CheckCircle2, EyeOff, GitBranch, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { resolveCanonicalVariable } from "@/lib/canonical-variables";
import { testCases } from "@/lib/mock-data";

export function VariableExecutionEvidence({ testCaseId = "TC-001" }: { testCaseId?: string }) {
  const testCase = testCases.find((item) => item.id === testCaseId) ?? testCases[0];
  const resolved = testCase.variables.map((variable) => resolveCanonicalVariable(variable, "QA"));
  return <Card><CardHeader className="flex-row items-center justify-between"><CardTitle className="flex items-center gap-2 text-base"><Braces className="size-4 text-primary" /> Canonical Variable Runtime Context</CardTitle><Badge variant="success"><CheckCircle2 className="size-3" /> {resolved.length} resolved</Badge></CardHeader><CardContent className="space-y-2">{resolved.map((variable) => <div key={variable.variableId} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-secondary/20 px-3 py-2"><div><p className="font-mono text-xs text-primary">{variable.variableId} · {variable.name}</p><p className="text-xs text-muted-foreground">{variable.source} → {variable.valueReference}</p></div><div className="flex gap-1">{variable.masked && <Badge variant="warning"><EyeOff className="size-3" /> Masked</Badge>}<Badge variant={variable.status === "resolved" ? "success" : "secondary"}>{variable.status}</Badge></div></div>)}<p className="flex items-center gap-2 pt-1 text-xs text-muted-foreground"><ShieldCheck className="size-3.5 text-success" /> Execution records IDs, sources and outcomes only; secret values are not stored in trace, report, or logs.</p></CardContent></Card>;
}

export function VariableTraceabilityEvidence({ testCaseId = "TC-001" }: { testCaseId?: string }) {
  const testCase = testCases.find((item) => item.id === testCaseId) ?? testCases[0];
  const links = testCase.manualSteps.flatMap((step) => step.variableIds.map((variableId) => ({ step, variable: testCase.variables.find((item) => item.variableId === variableId)! })));
  return <Card><CardHeader><CardTitle className="flex items-center gap-2 text-base"><GitBranch className="size-4 text-primary" /> Variable-level Traceability</CardTitle></CardHeader><CardContent className="space-y-2">{links.map(({ step, variable }) => <div key={`${step.step}-${variable.variableId}`} className="grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-lg border border-border bg-secondary/20 p-3"><span className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">{step.step}</span><div><p className="font-mono text-xs text-primary">{variable.variableId} → {variable.name}</p><p className="text-xs text-muted-foreground">Manual step {step.step} → automation step {step.automationStep}</p></div><Badge variant="secondary">{variable.type}</Badge></div>)}</CardContent></Card>;
}
