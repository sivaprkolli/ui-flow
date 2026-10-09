"use client";

import { useEffect, useState } from "react";
import {
  Bot, CheckCircle2, ChevronDown, CircleStop, Code2, FileVideo2, Globe2,
  Image, Laptop, ListChecks, MonitorPlay, Play, ShieldCheck, Sparkles,
  WandSparkles, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/toast";
import { RecorderArtifactScriptReview } from "@/components/recorder/recorder-artifact-script-review";
import type { TestCase } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

type RecorderPhase = "configure" | "recording" | "complete";
type ReviewTarget = "artifacts" | "script";

const generatedActions = [
  { label: "Navigate to login", selector: "page.goto(base_url)" },
  { label: "Enter username", selector: "getByLabel('Username')" },
  { label: "Enter password", selector: "getByLabel('Password')" },
  { label: "Click Login", selector: "getByRole('button', { name: 'Login' })" },
  { label: "Search product", selector: "getByPlaceholder('Search')" },
];

const autoEvidence = [
  { icon: Image, label: "Screenshots", value: "8 step-linked captures" },
  { icon: FileVideo2, label: "Session video", value: "1 replayable recording" },
  { icon: MonitorPlay, label: "Trace & DOM", value: "Action, timing and DOM evidence" },
  { icon: ListChecks, label: "Network & console", value: "Requests, responses and browser diagnostics" },
];

export function AutomateTestCaseModal({ testCase, open, onClose, onOpenManual }: { testCase: TestCase | null; open: boolean; onClose: () => void; onOpenManual: () => void; }) {
  const { toast } = useToast();
  const [phase, setPhase] = useState<RecorderPhase>("configure");
  const [captured, setCaptured] = useState(0);
  const [browser, setBrowser] = useState("Chromium");
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewTarget, setReviewTarget] = useState<ReviewTarget>("artifacts");
  const [reviewMenuOpen, setReviewMenuOpen] = useState(false);

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
    if (!open) {
      setPhase("configure");
      setCaptured(0);
      setReviewOpen(false);
      setReviewMenuOpen(false);
    }
  }, [open]);

  if (!open || !testCase) return null;
  const progress = Math.round((captured / generatedActions.length) * 100);
  const start = () => {
    setCaptured(0);
    setPhase("recording");
    toast({ title: "Automatic recorder started", description: `${testCase.id} is running in ${browser}. Standard evidence capture is enabled.`, variant: "info" });
  };
  const openReview = (target: ReviewTarget) => {
    setReviewTarget(target);
    setReviewMenuOpen(false);
    setReviewOpen(true);
  };

  return <><div className="fixed inset-0 z-[80] flex items-center justify-center p-4 sm:p-8"><div className="absolute inset-0 bg-black/65 backdrop-blur-sm" onClick={onClose} />
    <div className="relative flex max-h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl animate-fade-in">
      <header className="flex items-center justify-between border-b border-border bg-gradient-to-r from-primary/12 via-card to-fuchsia-500/10 px-5 py-4"><div className="flex items-center gap-3"><div className="relative flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-fuchsia-500 text-white"><Bot className="size-5" />{phase === "recording" && <span className="absolute -right-1 -top-1 flex size-3"><span className="absolute inline-flex size-full animate-ping rounded-full bg-danger" /><span className="relative inline-flex size-3 rounded-full bg-danger ring-2 ring-card" /></span>}</div><div><p className="text-sm font-semibold">Automate Test Case</p><p className="text-xs text-muted-foreground">Automatic Recorder · {testCase.id} · {testCase.title}</p></div></div><div className="flex items-center gap-2">{phase === "recording" ? <Badge variant="danger"><span className="size-1.5 animate-pulse rounded-full bg-danger" /> Recording</Badge> : phase === "complete" ? <Badge variant="success"><CheckCircle2 className="size-3" /> Capture complete</Badge> : <Badge variant="default"><Sparkles className="size-3" /> AI ready</Badge>}{phase === "complete" && <div className="relative"><Button variant="secondary" size="sm" onClick={() => setReviewMenuOpen((value) => !value)}><ListChecks className="size-3.5" /> Review <ChevronDown className="size-3.5" /></Button>{reviewMenuOpen && <div className="absolute right-0 top-10 z-10 w-52 overflow-hidden rounded-xl border border-border bg-popover p-1 shadow-xl animate-fade-in"><button onClick={() => openReview("artifacts")} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-accent"><Image className="size-4 text-primary" /> Review Artifacts</button><button onClick={() => openReview("script")} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-accent"><Code2 className="size-4 text-primary" /> Review Generated Script</button></div>}</div>}<button onClick={onClose} className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground"><X className="size-5" /></button></div></header>

      <div className="grid flex-1 overflow-y-auto scrollbar-thin lg:grid-cols-[0.95fr_1.35fr]">
        <div className="space-y-5 border-b border-border p-5 lg:border-b-0 lg:border-r"><section><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Recording target</p><div className="mt-2 rounded-xl border border-border bg-secondary/30 p-3"><div className="flex items-center gap-2"><Globe2 className="size-4 text-primary" /><div className="min-w-0"><p className="truncate text-sm font-medium">https://qa.example.test</p><p className="text-xs text-muted-foreground">QA environment · authenticated session</p></div></div></div></section><SelectBox label="Browser" value={browser} onChange={setBrowser} options={["Chromium", "Firefox", "WebKit"]} />
          <section><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Automatic evidence capture</p><p className="mt-1 text-xs text-muted-foreground">Standard QA evidence is captured automatically. Review it after the recorder completes.</p><div className="mt-3 space-y-2">{autoEvidence.map((item) => <div key={item.label} className="flex items-center gap-3 rounded-lg border border-border bg-secondary/20 p-3"><span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary"><item.icon className="size-4" /></span><div><p className="text-sm font-medium">{item.label}</p><p className="text-xs text-muted-foreground">{item.value}</p></div><CheckCircle2 className="ml-auto size-4 text-success" /></div>)}</div></section><div className="rounded-xl border border-success/25 bg-success/5 p-3"><div className="flex gap-2"><ShieldCheck className="mt-0.5 size-4 shrink-0 text-success" /><div><p className="text-sm font-medium">Safe automation guardrails</p><p className="mt-1 text-xs text-muted-foreground">Canonical variables, test-data leases, masking, and selector fallback are enforced during recording.</p></div></div></div>
        </div>

        <div className="p-5"><div className="flex items-center justify-between"><div><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Recorder activity</p><p className="mt-1 text-sm font-medium">{phase === "configure" ? "Ready to inspect the test case" : phase === "recording" ? "Capturing actions and evidence" : "Evidence and script draft ready for review"}</p></div>{phase !== "configure" && <span className="text-2xl font-semibold text-primary">{progress}%</span>}</div>{phase !== "configure" && <Progress value={progress} className="mt-3" indicatorClassName="bg-gradient-to-r from-primary to-fuchsia-500" />}
          <div className="mt-5 rounded-xl border border-border bg-[#101520] p-4 shadow-inner"><div className="flex items-center justify-between border-b border-white/10 pb-3"><div className="flex items-center gap-2"><Laptop className="size-4 text-sky-300" /><span className="text-xs font-medium text-white">{browser} · QA session</span></div><div className="flex gap-1.5"><span className="size-2 rounded-full bg-danger" /><span className="size-2 rounded-full bg-warning" /><span className="size-2 rounded-full bg-success" /></div></div><div className="flex min-h-40 items-center justify-center bg-gradient-to-br from-slate-800 to-slate-950 p-6 text-center"><div><div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-primary/20 text-primary"><WandSparkles className="size-6" /></div><p className="mt-3 text-sm font-medium text-white">{phase === "recording" ? "Observing user flow…" : phase === "complete" ? "Ready for artifact and script review" : "Automatic browser session"}</p><p className="mt-1 text-xs text-slate-400">{phase === "recording" ? "AI is detecting stable locators and checkpoints." : "Launch to generate actions, evidence, and a script draft."}</p></div></div></div>
          <div className="mt-5 space-y-2">{generatedActions.map((action, index) => { const done = index < captured; const active = phase === "recording" && index === captured; return <div key={action.label} className={cn("flex items-center gap-3 rounded-lg border p-3 transition-all", done ? "border-success/25 bg-success/5" : active ? "border-primary/35 bg-primary/5" : "border-border bg-secondary/20 opacity-55")}><span className={cn("flex size-7 items-center justify-center rounded-full", done ? "bg-success/15 text-success" : active ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground")}>{done ? <CheckCircle2 className="size-4" /> : active ? <span className="size-2 animate-pulse rounded-full bg-primary" /> : <span className="text-xs">{index + 1}</span>}</span><div className="min-w-0 flex-1"><p className="text-sm font-medium">{action.label}</p><code className="block truncate text-[11px] text-muted-foreground">{action.selector}</code></div>{done && <Badge variant="success">Captured</Badge>}{active && <Badge variant="default">Inspecting</Badge>}</div>; })}</div>
          {phase === "complete" && <div className="mt-5 grid grid-cols-3 gap-2"><button onClick={() => openReview("artifacts")} className="rounded-lg border border-border bg-secondary/30 p-3 text-center hover:bg-accent"><Image className="mx-auto size-4 text-primary" /><p className="mt-1 text-xs font-medium">Review artifacts</p></button><button onClick={() => openReview("script")} className="rounded-lg border border-border bg-secondary/30 p-3 text-center hover:bg-accent"><Code2 className="mx-auto size-4 text-primary" /><p className="mt-1 text-xs font-medium">Review script</p></button><div className="rounded-lg border border-success/25 bg-success/5 p-3 text-center"><CheckCircle2 className="mx-auto size-4 text-success" /><p className="mt-1 text-xs font-medium text-success">Ready to execute</p></div></div>}
        </div>
      </div>

      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-secondary/20 px-5 py-4"><button onClick={onOpenManual} className="text-sm font-medium text-primary hover:underline">Prefer guided capture? Open Manual Recorder</button><div className="flex gap-2">{phase === "recording" ? <Button variant="danger" onClick={() => { setPhase("configure"); setCaptured(0); }}><CircleStop className="size-4" /> Stop recording</Button> : phase === "complete" ? <><Button variant="secondary" onClick={() => { setPhase("configure"); setCaptured(0); }}>Record again</Button><Button variant="gradient" onClick={() => openReview("script")}><Code2 className="size-4" /> Execute & Confirm Script</Button></> : <Button variant="gradient" onClick={start}><Play className="size-4" /> Launch Automatic Recorder</Button>}</div></footer>
    </div>
  </div><RecorderArtifactScriptReview testCase={testCase} open={reviewOpen} onClose={() => setReviewOpen(false)} source="Automatic Recorder" initialTab={reviewTarget} onConfirmScript={() => toast({ title: "Automatic recorder script confirmed", description: `${testCase.id} is ready to commit or execute in the automation workspace.`, variant: "success" })} /></>;
}

function SelectBox({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: string[] }) { return <label><span className="mb-1 block text-xs text-muted-foreground">{label}</span><div className="relative"><select value={value} onChange={(event) => onChange(event.target.value)} className="h-9 w-full appearance-none rounded-lg border border-border bg-secondary/30 px-3 text-sm outline-none">{options.map((option) => <option key={option}>{option}</option>)}</select><ChevronDown className="pointer-events-none absolute right-2 top-2.5 size-4 text-muted-foreground" /></div></label>; }
