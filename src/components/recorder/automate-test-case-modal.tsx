"use client";

import { useEffect, useState } from "react";
import {
  Bot, CheckCircle2, ChevronDown, CircleStop, Code2, FileVideo2, Globe2,
  Image, Laptop, ListChecks, MonitorPlay, Network, Play, ShieldCheck, Sparkles,
  TerminalSquare, WandSparkles, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/toast";
import type { TestCase } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

type RecorderPhase = "configure" | "recording" | "complete";

const captureOptions = [
  { id: "screenshots", label: "Screenshots", icon: Image, description: "Before and after each action" },
  { id: "video", label: "Video", icon: FileVideo2, description: "Replayable run recording" },
  { id: "trace", label: "Trace", icon: MonitorPlay, description: "DOM, action and timing trace" },
  { id: "network", label: "Network", icon: Network, description: "Requests and API responses" },
  { id: "console", label: "Console", icon: TerminalSquare, description: "Browser warnings and errors" },
];

const generatedActions = [
  { label: "Navigate to login", selector: "page.goto(base_url)", status: "captured" },
  { label: "Enter username", selector: "getByLabel('Username')", status: "captured" },
  { label: "Enter password", selector: "getByLabel('Password')", status: "captured" },
  { label: "Click Login", selector: "getByRole('button', { name: 'Login' })", status: "captured" },
  { label: "Search product", selector: "getByPlaceholder('Search')", status: "queued" },
];

export function AutomateTestCaseModal({ testCase, open, onClose, onOpenManual }: { testCase: TestCase | null; open: boolean; onClose: () => void; onOpenManual: () => void; }) {
  const { toast } = useToast();
  const [phase, setPhase] = useState<RecorderPhase>("configure");
  const [captured, setCaptured] = useState(0);
  const [browser, setBrowser] = useState("Chromium");
  const [artifacts, setArtifacts] = useState<string[]>(["screenshots", "video", "trace", "network", "console"]);

  useEffect(() => {
    if (phase !== "recording") return;
    const timer = window.setInterval(() => {
      setCaptured((count) => {
        if (count >= generatedActions.length) {
          window.clearInterval(timer);
          setPhase("complete");
          return count;
        }
        return count + 1;
      });
    }, 700);
    return () => window.clearInterval(timer);
  }, [phase]);

  useEffect(() => {
    if (!open) { setPhase("configure"); setCaptured(0); }
  }, [open]);

  if (!open || !testCase) return null;
  const progress = Math.round((captured / generatedActions.length) * 100);
  const toggleArtifact = (id: string) => setArtifacts((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  const start = () => {
    setCaptured(0);
    setPhase("recording");
    toast({ title: "Automatic recorder started", description: `${testCase.id} is running in ${browser}.`, variant: "info" });
  };

  return <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 sm:p-8">
    <div className="absolute inset-0 bg-black/65 backdrop-blur-sm" onClick={onClose} />
    <div className="relative flex max-h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl animate-fade-in">
      <div className="flex items-center justify-between border-b border-border bg-gradient-to-r from-primary/12 via-card to-fuchsia-500/10 px-5 py-4">
        <div className="flex items-center gap-3"><div className="relative flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-fuchsia-500 text-white"><Bot className="size-5" />{phase === "recording" && <span className="absolute -right-1 -top-1 flex size-3"><span className="absolute inline-flex size-full animate-ping rounded-full bg-danger" /><span className="relative inline-flex size-3 rounded-full bg-danger ring-2 ring-card" /></span>}</div><div><p className="text-sm font-semibold">Automate Test Case</p><p className="text-xs text-muted-foreground">Automatic Recorder · {testCase.id} · {testCase.title}</p></div></div>
        <div className="flex items-center gap-2">{phase === "recording" ? <Badge variant="danger"><span className="size-1.5 animate-pulse rounded-full bg-danger" /> Recording</Badge> : phase === "complete" ? <Badge variant="success"><CheckCircle2 className="size-3" /> Capture complete</Badge> : <Badge variant="default"><Sparkles className="size-3" /> AI ready</Badge>}<button onClick={onClose} className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground"><X className="size-5" /></button></div>
      </div>

      <div className="grid flex-1 overflow-y-auto scrollbar-thin lg:grid-cols-[0.95fr_1.35fr]">
        <div className="space-y-5 border-b border-border p-5 lg:border-b-0 lg:border-r">
          <div><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Recording target</p><div className="mt-2 rounded-xl border border-border bg-secondary/30 p-3"><div className="flex items-center gap-2"><Globe2 className="size-4 text-primary" /><div className="min-w-0"><p className="truncate text-sm font-medium">https://qa.example.test</p><p className="text-xs text-muted-foreground">QA environment · authenticated session</p></div></div></div></div>
          <div className="grid grid-cols-2 gap-3"><SelectBox label="Browser" value={browser} onChange={setBrowser} options={["Chromium", "Firefox", "WebKit"]} /><SelectBox label="Viewport" value="1440 × 900" onChange={() => {}} options={["1440 × 900", "1280 × 720", "390 × 844"]} disabled /></div>
          <div><div className="flex items-center justify-between"><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Artifacts to capture</p><span className="text-xs text-primary">{artifacts.length} selected</span></div><div className="mt-2 space-y-1.5">{captureOptions.map((option) => { const Icon = option.icon; const active = artifacts.includes(option.id); return <button key={option.id} onClick={() => phase === "configure" && toggleArtifact(option.id)} className={cn("flex w-full items-center gap-3 rounded-lg border p-2.5 text-left transition-colors", active ? "border-primary/40 bg-primary/5" : "border-border bg-secondary/20", phase !== "configure" && "cursor-default opacity-70")}><span className={cn("flex size-8 items-center justify-center rounded-lg", active ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground")}><Icon className="size-4" /></span><span className="flex-1"><span className="block text-sm font-medium">{option.label}</span><span className="block text-xs text-muted-foreground">{option.description}</span></span><span className={cn("size-4 rounded border", active ? "border-primary bg-primary" : "border-muted-foreground/40")}>{active && <CheckCircle2 className="size-3.5 text-primary-foreground" />}</span></button>; })}</div></div>
          <div className="rounded-xl border border-success/25 bg-success/5 p-3"><div className="flex gap-2"><ShieldCheck className="mt-0.5 size-4 shrink-0 text-success" /><div><p className="text-sm font-medium">Safe automation guardrails</p><p className="mt-1 text-xs text-muted-foreground">Canonical variables, test-data leases, masking, and selector fallback are enforced during recording.</p></div></div></div>
        </div>

        <div className="p-5"><div className="flex items-center justify-between"><div><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Recorder activity</p><p className="mt-1 text-sm font-medium">{phase === "configure" ? "Ready to inspect the test case" : phase === "recording" ? "Capturing actions and artifacts" : "Automation draft generated"}</p></div>{phase !== "configure" && <span className="text-2xl font-semibold text-primary">{progress}%</span>}</div>{phase !== "configure" && <Progress value={progress} className="mt-3" indicatorClassName="bg-gradient-to-r from-primary to-fuchsia-500" />}
          <div className="mt-5 rounded-xl border border-border bg-[#101520] p-4 shadow-inner"><div className="flex items-center justify-between border-b border-white/10 pb-3"><div className="flex items-center gap-2"><Laptop className="size-4 text-sky-300" /><span className="text-xs font-medium text-white">Chromium · QA session</span></div><div className="flex gap-1.5"><span className="size-2 rounded-full bg-danger" /><span className="size-2 rounded-full bg-warning" /><span className="size-2 rounded-full bg-success" /></div></div><div className="flex min-h-40 items-center justify-center bg-gradient-to-br from-slate-800 to-slate-950 p-6 text-center"><div><div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-primary/20 text-primary"><WandSparkles className="size-6" /></div><p className="mt-3 text-sm font-medium text-white">{phase === "recording" ? "Observing user flow…" : phase === "complete" ? "Automation draft ready" : "Automatic browser session"}</p><p className="mt-1 text-xs text-slate-400">{phase === "recording" ? "AI is detecting stable locators and checkpoints." : "Launch to generate Playwright actions from the selected test case."}</p></div></div></div>
          <div className="mt-5 space-y-2">{generatedActions.map((action, index) => { const done = index < captured; const active = phase === "recording" && index === captured; return <div key={action.label} className={cn("flex items-center gap-3 rounded-lg border p-3 transition-all", done ? "border-success/25 bg-success/5" : active ? "border-primary/35 bg-primary/5" : "border-border bg-secondary/20 opacity-55")}><span className={cn("flex size-7 items-center justify-center rounded-full", done ? "bg-success/15 text-success" : active ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground")}>{done ? <CheckCircle2 className="size-4" /> : active ? <span className="size-2 animate-pulse rounded-full bg-primary" /> : <span className="text-xs">{index + 1}</span>}</span><div className="min-w-0 flex-1"><p className="text-sm font-medium">{action.label}</p><code className="block truncate text-[11px] text-muted-foreground">{action.selector}</code></div>{done && <Badge variant="success">Captured</Badge>}{active && <Badge variant="default">Inspecting</Badge>}</div>; })}</div>
          {phase === "complete" && <div className="mt-5 grid grid-cols-3 gap-2">{[{ icon: Code2, label: "5 actions" }, { icon: Image, label: "8 screenshots" }, { icon: FileVideo2, label: "1 video" }].map((item) => <div key={item.label} className="rounded-lg border border-border bg-secondary/30 p-3 text-center"><item.icon className="mx-auto size-4 text-primary" /><p className="mt-1 text-xs font-medium">{item.label}</p></div>)}</div>}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-secondary/20 px-5 py-4"><button onClick={onOpenManual} className="text-sm font-medium text-primary hover:underline">Prefer guided capture? Open Manual Recorder</button><div className="flex gap-2">{phase === "recording" ? <Button variant="danger" onClick={() => { setPhase("configure"); setCaptured(0); }}><CircleStop className="size-4" /> Stop recording</Button> : phase === "complete" ? <><Button variant="secondary" onClick={() => { setPhase("configure"); setCaptured(0); }}>Record again</Button><Button variant="gradient" onClick={() => { toast({ title: "Automation draft created", description: `${testCase.id} now includes recorder-generated actions and artifacts.`, variant: "success" }); onClose(); }}><Code2 className="size-4" /> Review Automation</Button></> : <Button variant="gradient" onClick={start}><Play className="size-4" /> Launch Automatic Recorder</Button>}</div></div>
    </div>
  </div>;
}

function SelectBox({ label, value, onChange, options, disabled }: { label: string; value: string; onChange: (value: string) => void; options: string[]; disabled?: boolean }) { return <label><span className="mb-1 block text-xs text-muted-foreground">{label}</span><div className="relative"><select value={value} onChange={(event) => onChange(event.target.value)} disabled={disabled} className="h-9 w-full appearance-none rounded-lg border border-border bg-secondary/30 px-3 text-sm outline-none disabled:opacity-70">{options.map((option) => <option key={option}>{option}</option>)}</select><ChevronDown className="pointer-events-none absolute right-2 top-2.5 size-4 text-muted-foreground" /></div></label>; }
