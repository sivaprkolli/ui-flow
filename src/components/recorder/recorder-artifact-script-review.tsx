"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Braces, CheckCircle2, Code2, Download, FileJson2, FileVideo2, Image,
  MonitorPlay, Network, Play, ShieldCheck, TerminalSquare, X, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CodeEditor } from "@/components/automation/code-editor";
import { useToast } from "@/components/ui/toast";
import { generateBddStepDefinitions, generateCanonicalAutomationScript } from "@/lib/canonical-variables";
import type { AutomationPlatform } from "@/lib/canonical-variables";
import type { TestCase } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

type ReviewTab = "artifacts" | "script";
type ArtifactFilter = "all" | "screenshot" | "video" | "trace" | "network" | "console" | "dom";
type ScriptTarget = AutomationPlatform | "bdd";

const artifactTypes: Array<{ id: ArtifactFilter; label: string; icon: typeof Image }> = [
  { id: "all", label: "All", icon: Image }, { id: "screenshot", label: "Screenshots", icon: Image },
  { id: "video", label: "Video", icon: FileVideo2 }, { id: "trace", label: "Trace", icon: MonitorPlay },
  { id: "network", label: "Network", icon: Network }, { id: "console", label: "Console", icon: TerminalSquare },
  { id: "dom", label: "DOM", icon: FileJson2 },
];

const capturedArtifacts = [
  { id: "ART-001", type: "screenshot", step: "Step 1 · Opened QA application", name: "01-login-page.png", detail: "1440 × 900 · 182 KB", icon: Image, tone: "text-sky-400" },
  { id: "ART-002", type: "dom", step: "Step 1 · Opened QA application", name: "01-login-page.dom.json", detail: "Accessible DOM snapshot · 14 KB", icon: FileJson2, tone: "text-violet-400" },
  { id: "ART-003", type: "screenshot", step: "Step 2 · Entered username", name: "02-username-entered.png", detail: "Value masked · 191 KB", icon: Image, tone: "text-sky-400" },
  { id: "ART-004", type: "network", step: "Step 4 · Clicked Login", name: "auth-login.har", detail: "POST /auth/login · 201 Created", icon: Network, tone: "text-emerald-400" },
  { id: "ART-005", type: "trace", step: "Full session", name: "trace.zip", detail: "Action, DOM and timing trace · 1.8 MB", icon: MonitorPlay, tone: "text-primary" },
  { id: "ART-006", type: "video", step: "Full session", name: "rec-001.webm", detail: "00:42 replay · 3.4 MB", icon: FileVideo2, tone: "text-fuchsia-400" },
  { id: "ART-007", type: "console", step: "Full session", name: "console.log", detail: "0 errors · 2 warnings", icon: TerminalSquare, tone: "text-warning" },
];

const scriptTargets: Array<{ id: ScriptTarget; label: string; language: string }> = [
  { id: "web", label: "Web · Playwright", language: "typescript" },
  { id: "bdd", label: "BDD · Cucumber", language: "typescript" },
  { id: "api", label: "API", language: "python" },
  { id: "performance", label: "Performance", language: "javascript" },
];

export function RecorderArtifactScriptReview({ testCase, open, onClose, source, initialTab = "artifacts", onConfirmScript }: { testCase: TestCase | null; open: boolean; onClose: () => void; source: "Automatic Recorder" | "Manual Recorder"; initialTab?: ReviewTab; onConfirmScript?: () => void; }) {
  const { toast } = useToast();
  const [tab, setTab] = useState<ReviewTab>(initialTab);
  const [filter, setFilter] = useState<ArtifactFilter>("all");
  const [selectedId, setSelectedId] = useState("ART-001");
  const [scriptTarget, setScriptTarget] = useState<ScriptTarget>("web");
  const [scriptStatus, setScriptStatus] = useState<"idle" | "running" | "passed" | "confirmed">("idle");

  useEffect(() => {
    if (open) { setTab(initialTab); setScriptStatus("idle"); }
  }, [open, initialTab]);
  const filtered = useMemo(() => filter === "all" ? capturedArtifacts : capturedArtifacts.filter((artifact) => artifact.type === filter), [filter]);
  const selectedArtifact = capturedArtifacts.find((artifact) => artifact.id === selectedId) ?? capturedArtifacts[0];
  const script = !testCase ? "" : scriptTarget === "bdd" ? generateBddStepDefinitions(testCase.variables, testCase.manualSteps) : generateCanonicalAutomationScript(scriptTarget, testCase.variables);
  const scriptInfo = scriptTargets.find((item) => item.id === scriptTarget)!;
  const executeScript = () => {
    setScriptStatus("running");
    window.setTimeout(() => {
      setScriptStatus("passed");
      toast({ title: "Script execution passed", description: `${scriptInfo.label} ran with recorder artifacts and canonical variables.`, variant: "success" });
    }, 1000);
  };
  const confirmScript = () => {
    setScriptStatus("confirmed");
    toast({ title: "Script confirmed", description: `${scriptInfo.label} is approved for the automation repository.`, variant: "success" });
    onConfirmScript?.();
  };

  if (!open || !testCase) return null;
  const ArtifactIcon = selectedArtifact.icon;

  return <div className="fixed inset-0 z-[110] flex justify-end bg-black/55 backdrop-blur-sm animate-fade-in">
    <section className="flex h-full w-full max-w-6xl flex-col border-l border-border bg-card shadow-2xl animate-slide-in">
      <header className="flex items-center justify-between border-b border-border bg-gradient-to-r from-primary/10 via-card to-fuchsia-500/10 px-5 py-4"><div className="flex items-center gap-3"><div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-fuchsia-500 text-white"><MonitorPlay className="size-5" /></div><div><p className="text-sm font-semibold">Artifact & Script Review</p><p className="text-xs text-muted-foreground">{source} · {testCase.id} · {testCase.title} · 14 captured artifacts</p></div></div><div className="flex items-center gap-2"><Badge variant="success"><ShieldCheck className="size-3" /> Evidence ready</Badge><button onClick={onClose} className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground"><X className="size-5" /></button></div></header>
      <div className="flex gap-1 border-b border-border bg-secondary/20 px-5 pt-3"><ReviewTabButton active={tab === "artifacts"} onClick={() => setTab("artifacts")} icon={Image} label="Artifacts" /><ReviewTabButton active={tab === "script"} onClick={() => setTab("script")} icon={Code2} label="Script View" /></div>
      {tab === "artifacts" ? <div className="grid min-h-0 flex-1 lg:grid-cols-[260px_1fr_330px]">
        <aside className="border-b border-border p-4 lg:border-b-0 lg:border-r"><p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Artifact types</p><div className="space-y-1">{artifactTypes.map((item) => { const Icon = item.icon; const count = item.id === "all" ? capturedArtifacts.length : capturedArtifacts.filter((artifact) => artifact.type === item.id).length; return <button key={item.id} onClick={() => setFilter(item.id)} className={cn("flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm", filter === item.id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent hover:text-foreground")}><Icon className="size-4" />{item.label}<span className="ml-auto text-xs">{count}</span></button>; })}</div><div className="mt-6 rounded-lg border border-success/25 bg-success/5 p-3 text-xs text-success"><ShieldCheck className="mr-1 inline size-3.5" />Secrets and canonical variables remain masked in every artifact.</div></aside>
        <main className="min-h-0 overflow-y-auto scrollbar-thin p-5"><div className="flex items-center justify-between"><div><p className="text-sm font-semibold">Captured evidence</p><p className="text-xs text-muted-foreground">Select an artifact to inspect it in context.</p></div><Button size="sm" variant="outline"><Download className="size-3.5" /> Download bundle</Button></div><div className="mt-4 grid gap-3 sm:grid-cols-2">{filtered.map((artifact) => { const Icon = artifact.icon; const active = artifact.id === selectedId; return <button key={artifact.id} onClick={() => setSelectedId(artifact.id)} className={cn("group overflow-hidden rounded-xl border text-left transition-all", active ? "border-primary ring-1 ring-primary/30" : "border-border hover:-translate-y-0.5 hover:shadow-md")}><div className="flex h-28 items-center justify-center bg-gradient-to-br from-secondary to-card"><Icon className={cn("size-9", artifact.tone)} /></div><div className="p-3"><p className="font-mono text-[11px] text-primary">{artifact.id}</p><p className="mt-1 truncate text-sm font-medium">{artifact.name}</p><p className="mt-1 truncate text-xs text-muted-foreground">{artifact.step}</p></div></button>; })}</div></main>
        <aside className="border-t border-border bg-secondary/20 p-5 lg:border-l lg:border-t-0"><div className="flex items-center gap-2"><span className={cn("flex size-9 items-center justify-center rounded-lg bg-card", selectedArtifact.tone)}><ArtifactIcon className="size-4" /></span><div><p className="text-sm font-medium">{selectedArtifact.name}</p><p className="text-xs text-muted-foreground">{selectedArtifact.detail}</p></div></div><div className="mt-5 rounded-xl border border-border bg-[#101520] p-4"><div className="flex h-44 items-center justify-center text-center"><div><ArtifactIcon className={cn("mx-auto size-10", selectedArtifact.tone)} /><p className="mt-3 text-xs text-slate-300">Artifact preview</p><p className="mt-1 text-[11px] text-slate-500">Recorded evidence is linked to the selected step.</p></div></div></div><div className="mt-5 space-y-3"><Evidence label="Step" value={selectedArtifact.step} /><Evidence label="Retention" value="30 days" /><Evidence label="Data handling" value="Masked variables" /></div><Button variant="secondary" className="mt-5 w-full"><Play className="size-4" /> Open full viewer</Button></aside>
      </div> : <div className="flex min-h-0 flex-1 flex-col"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-secondary/20 px-5 py-3"><div className="flex flex-wrap gap-1">{scriptTargets.map((target) => <button key={target.id} onClick={() => setScriptTarget(target.id)} className={cn("rounded-md px-3 py-1.5 text-xs font-medium", scriptTarget === target.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground")}>{target.label}</button>)}</div><Badge variant="success"><Braces className="size-3" /> {testCase.variables.length} canonical bindings</Badge></div><div className="grid min-h-0 flex-1 lg:grid-cols-[1fr_290px]"><div className="min-h-0"><CodeEditor value={script} language={scriptInfo.language} /></div><aside className="border-t border-border bg-secondary/20 p-5 lg:border-l lg:border-t-0"><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Script provenance</p><p className="mt-2 text-sm font-medium">Generated from recorder actions</p><p className="mt-1 text-xs text-muted-foreground">Stable selectors and canonical data bindings are assembled from the captured session evidence.</p><div className="mt-5 space-y-2">{testCase.variables.map((variable) => <div key={variable.variableId} className="rounded-lg border border-border bg-card p-2.5"><p className="font-mono text-[11px] text-primary">{variable.variableId} → {variable.name}</p><p className="mt-0.5 text-xs text-muted-foreground">{variable.source}{variable.mask ? " · masked" : ""}</p></div>)}</div><div className="mt-5 space-y-2"><Button variant="gradient" className="w-full" disabled={scriptStatus === "running" || scriptStatus === "confirmed"} onClick={executeScript}>{scriptStatus === "running" ? <Loader2 className="size-4 animate-spin" /> : <Play className="size-4" />}{scriptStatus === "passed" ? "Run again" : scriptStatus === "confirmed" ? "Script confirmed" : "Execute Script"}</Button><Button variant={scriptStatus === "confirmed" ? "success" : "secondary"} className="w-full" disabled={scriptStatus !== "passed"} onClick={confirmScript}><CheckCircle2 className="size-4" /> Confirm Script</Button>{scriptStatus === "idle" && <p className="text-center text-[11px] text-muted-foreground">Execute the draft before confirming it.</p>}{scriptStatus === "passed" && <p className="text-center text-[11px] text-success">Execution passed. Ready for confirmation.</p>}</div></aside></div></div>}
      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-secondary/20 px-5 py-4"><p className="text-xs text-muted-foreground">Artifacts and generated code remain linked to this recorder session.</p><div className="flex gap-2"><Button variant="secondary" onClick={() => setTab("artifacts")}><Image className="size-4" /> Review evidence</Button><Button variant="gradient" onClick={() => setTab("script")}><Code2 className="size-4" /> View script</Button></div></footer>
    </section>
  </div>;
}

function ReviewTabButton({ active, onClick, icon: Icon, label }: { active: boolean; onClick: () => void; icon: typeof Image; label: string }) { return <button onClick={onClick} className={cn("flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium", active ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground")}><Icon className="size-4" />{label}</button>; }
function Evidence({ label, value }: { label: string; value: string }) { return <div className="flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2"><span className="text-xs text-muted-foreground">{label}</span><span className="text-xs font-medium">{value}</span></div>; }
