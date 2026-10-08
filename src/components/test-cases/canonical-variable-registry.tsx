"use client";

import { AlertTriangle, Braces, CheckCircle2, CopyCheck, Database, GitBranch, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { detectDuplicateVariables, extractVariablesFromText, validateCanonicalVariables } from "@/lib/canonical-variables";
import type { TestCase } from "@/lib/mock-data";

const typeVariant: Record<string, any> = {
  credential: "danger", environment: "info", test_data: "success", static: "secondary",
  runtime: "purple", correlated: "purple", synthetic: "info",
};

export function CanonicalVariableRegistry({ testCase }: { testCase: TestCase }) {
  const issues = validateCanonicalVariables(testCase.id, testCase.variables, testCase.manualSteps);
  const errors = issues.filter((issue) => issue.severity === "error");
  const extracted = testCase.manualSteps.flatMap((step) => extractVariablesFromText(step.instruction, testCase.variables));
  const aliases = detectDuplicateVariables(["user_name", "userName", "login_username", "product"], testCase.variables);

  return (
    <div className="space-y-4">
      <Card className={cn("border", errors.length ? "border-danger/40" : "border-success/30")}>
        <CardHeader className="flex-row items-center justify-between p-4">
          <CardTitle className="flex items-center gap-2 text-sm"><Braces className="size-4 text-primary" /> Canonical Variable Registry</CardTitle>
          <Badge variant={errors.length ? "danger" : "success"}>{errors.length ? `${errors.length} blocking issue${errors.length === 1 ? "" : "s"}` : "Validation passed"}</Badge>
        </CardHeader>
        <CardContent className="space-y-2 p-4 pt-0">
          {testCase.variables.map((variable) => (
            <div key={variable.variableId} className="rounded-lg border border-border bg-secondary/20 p-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div><p className="font-mono text-xs text-primary">{variable.variableId}</p><p className="mt-0.5 text-sm font-semibold">{variable.name}</p><p className="mt-0.5 text-xs text-muted-foreground">{variable.description}</p></div>
                <div className="flex flex-wrap gap-1"><Badge variant={typeVariant[variable.type] ?? "secondary"}>{variable.type}</Badge>{variable.required && <Badge variant="outline">Required</Badge>}{variable.mask && <Badge variant="warning">Masked</Badge>}</div>
              </div>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground"><span className="flex items-center gap-1"><Database className="size-3" /> {variable.source}</span>{variable.dataKey && <span>key: <code>{variable.dataKey}</code></span>}{variable.dependencies?.length ? <span className="flex items-center gap-1"><GitBranch className="size-3" /> depends on {variable.dependencies.join(", ")}</span> : null}</div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card><CardHeader className="p-4"><CardTitle className="flex items-center gap-2 text-sm"><CopyCheck className="size-4 text-primary" /> Extraction & duplicate review</CardTitle></CardHeader><CardContent className="space-y-2 p-4 pt-0">
        <div className="flex flex-wrap gap-2">{extracted.map((entry, index) => <Badge key={`${entry.name}-${index}`} variant="success">&#123;&#123;{entry.name}&#125;&#125; {entry.existingVariableId ? `→ ${entry.existingVariableId}` : ""}</Badge>)}</div>
        <p className="pt-1 text-xs text-muted-foreground">Semantic aliases are compared against this test case registry; high-confidence matches are reused, never silently renamed.</p>
        <div className="space-y-1.5">{aliases.map((alias) => <div key={alias.candidate} className="flex items-center gap-2 text-xs"><CheckCircle2 className="size-3.5 text-success" /><code>{alias.candidate}</code><span className="text-muted-foreground">reuses</span><code className="text-primary">{alias.canonicalName}</code><span className="text-muted-foreground">({Math.round(alias.confidence * 100)}%)</span></div>)}</div>
      </CardContent></Card>

      {issues.length > 0 && <Card className="border-danger/30 bg-danger/5"><CardContent className="space-y-2 p-4">{issues.map((issue, index) => <div key={`${issue.code}-${index}`} className="flex gap-2 text-sm"><AlertTriangle className={cn("mt-0.5 size-4 shrink-0", issue.severity === "error" ? "text-danger" : "text-warning")} /><span>{issue.message}</span></div>)}</CardContent></Card>}
      {!errors.length && <div className="flex items-center gap-2 rounded-lg border border-success/30 bg-success/5 p-3 text-xs text-success"><ShieldCheck className="size-4" /> Script generators may consume these immutable names and IDs; unresolved names block generation.</div>}
    </div>
  );
}
