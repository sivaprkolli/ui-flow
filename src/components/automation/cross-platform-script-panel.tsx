"use client";

import { useState } from "react";
import { Braces, CheckCircle2, Code2, Copy, FileCheck2, MonitorSmartphone, Network, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CodeEditor } from "@/components/automation/code-editor";
import { generateBddStepDefinitions, generateCanonicalAutomationScript, type AutomationPlatform } from "@/lib/canonical-variables";
import type { TestCase } from "@/lib/mock-data";
import { useToast } from "@/components/ui/toast";

type ScriptTarget = AutomationPlatform | "bdd";

const platforms: Array<{ id: ScriptTarget; label: string; icon: typeof Code2; language: string }> = [
  { id: "web", label: "Web · Playwright", icon: Code2, language: "typescript" },
  { id: "mobile", label: "Mobile · Appium", icon: MonitorSmartphone, language: "python" },
  { id: "api", label: "API", icon: Network, language: "python" },
  { id: "performance", label: "Performance", icon: Zap, language: "javascript" },
  { id: "bdd", label: "BDD · Cucumber", icon: FileCheck2, language: "typescript" },
];

export function CrossPlatformScriptPanel({ testCase }: { testCase: TestCase }) {
  const { toast } = useToast();
  const [platform, setPlatform] = useState<ScriptTarget>("web");
  const current = platforms.find((item) => item.id === platform)!;
  const content = platform === "bdd"
    ? generateBddStepDefinitions(testCase.variables, testCase.manualSteps)
    : generateCanonicalAutomationScript(platform, testCase.variables);

  return <div className="space-y-3">
    <div className="flex flex-wrap items-center justify-between gap-2 px-4 pt-3"><div className="flex items-center gap-2"><Braces className="size-4 text-primary" /><span className="text-sm font-medium">Registry-bound script generation</span><Badge variant="success"><CheckCircle2 className="size-3" /> {testCase.variables.length} immutable bindings</Badge></div><Button variant="ghost" size="sm" onClick={() => { navigator.clipboard?.writeText(content); toast({ title: "Canonical script copied", description: "Variable names and IDs were preserved.", variant: "success" }); }}><Copy className="size-3.5" /> Copy</Button></div>
    <div className="flex flex-wrap gap-1 border-y border-border bg-secondary/20 px-3 py-2">{platforms.map((item) => { const Icon = item.icon; return <button key={item.id} onClick={() => setPlatform(item.id)} className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium ${platform === item.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground"}`}><Icon className="size-3.5" />{item.label}</button>; })}</div>
    <CodeEditor value={content} language={current.language} />
    <div className="flex flex-wrap gap-1.5 px-4 pb-4">{testCase.variables.map((variable) => <Badge key={variable.variableId} variant="secondary"><code>{variable.variableId}</code> → {variable.name}</Badge>)}</div>
  </div>;
}
