"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bot, Camera, CheckCircle2, CircleStop, Clock3, Code2, FileJson2, FileVideo2,
  Globe2, Image, Layers3, ListPlus, MonitorPlay, Network, Pause, Play,
  ShieldCheck, TerminalSquare, Trash2, WandSparkles,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { testCases } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const captureTypes = [
  { id: "screenshot", label: "Screenshot", icon: Image, color: "text-sky-400", detail: "PNG at each marked step" },
  { id: "video", label: "Video", icon: FileVideo2, color: "text-fuchsia-400", detail: "Full session replay" },
  { id: "trace", label: "Trace", icon: MonitorPlay, color: "text-primary", detail: "Interaction and timing trace" },
  { id: "network", label: "Network", icon: Network, color: "text-emerald-400", detail: "HAR requests and responses" },
  { id: "console", label: "Console", icon: TerminalSquare, color: "text-warning", detail: "Browser warnings and errors" },
  { id: "dom", label: "DOM Snapshot", icon: FileJson2, color: "text-violet-400", detail: "Accessible DOM state" },
];

const initialEvents = [
  { id: 1, time: "00:00", label: "Opened QA application", detail: "https://qa.example.test/login" },
  { id: 2, time: "00:06", label: "Entered username", detail: "{{username}} · masked" },
  { id: 3, time: "00:09", label: "Entered password", detail: "{{password}} · masked" },
  { id: 4, time: "00:11", label: "Clicked Login", detail: "role=button · name=Login" },
];

export default function RecorderPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [recording, setRecording] = useState(false);
  const [paused, setPaused] = useState(false);
  const [elapsed, setElapsed] = useState(14);
  const [events, setEvents] = useState(initialEvents);
  const [artifacts, setArtifacts] = useState(captureTypes.map((capture) => capture.id));
  const [selectedCase, setSelectedCase] = useState("TC-001");

  useEffect(() => {
    if (!recording || paused) return;
    const timer = window.setInterval(() => setElapsed((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, [recording, paused]);

  const formatted = `${String(Math.floor(elapsed / 60)).padStart(2, "0")}:${String(elapsed % 60).padStart(2, "0")}`;
  const toggleArtifact = (id: string) => setArtifacts((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  const addMarker = () => {
    setEvents((current) => [...current, { id: Date.now(), time: formatted, label: `Manual checkpoint ${current.length + 1}`, detail: "User-marked validation step" }]);
    toast({ title: "Checkpoint captured", description: "Screenshot, DOM snapshot and trace marker added.", variant: "success" });
  };
  const start = () => {
    setRecording(true);
    setPaused(false);
    setElapsed(0);
    toast({ title: "Manual recording started", description: "Capture actions and artifacts as you work.", variant: "info" });
  };
  const stop = () => {
    setRecording(false);
    setPaused(false);
    toast({ title: "Recording finalized", description: `${events.length} steps and ${artifacts.length} artifact types captured.`, variant: "success" });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manual Recorder"
        description="Guide the browser flow yourself and capture rich evidence for test creation, debugging, and automation."
        icon={<Camera className="size-5" />}
        actions={<><Button variant="secondary" onClick={() => toast({ title: "Previous session loaded", variant: "info" })}><Clock3 className="size-4" /> Session History</Button><Button variant="gradient" onClick={() => router.push(`/automation?testCase=${selectedCase}`)}><Bot className="size-4" /> Generate Automation</Button></>}
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_370px]">
        <div className="space-y-6">
          <Card className={cn("overflow-hidden border", recording ? "border-danger/40" : "border-primary/25")}>
            <div className="flex flex-wrap items-center justify-between gap-4 bg-gradient-to-r from-primary/10 via-card to-fuchsia-500/5 p-5">
              <div className="flex items-center gap-3">
                <div className={cn("relative flex size-12 items-center justify-center rounded-xl text-white", recording ? "bg-danger" : "bg-gradient-to-br from-primary to-fuchsia-500")}>
                  <Camera className="size-6" />
                  {recording && <span className="absolute -right-1 -top-1 flex size-3"><span className="absolute inline-flex size-full animate-ping rounded-full bg-danger" /><span className="relative inline-flex size-3 rounded-full bg-danger ring-2 ring-card" /></span>}
                </div>
                <div><p className="text-sm font-semibold">{recording ? paused ? "Recording paused" : "Recording in progress" : "Ready to record a manual flow"}</p><p className="text-xs text-muted-foreground">QA · Chromium · {selectedCase} · {formatted}</p></div>
              </div>
              <div className="flex flex-wrap gap-2">
                {recording ? <><Button variant="secondary" onClick={() => setPaused((value) => !value)}>{paused ? <Play className="size-4" /> : <Pause className="size-4" />}{paused ? "Resume" : "Pause"}</Button><Button variant="secondary" onClick={addMarker}><ListPlus className="size-4" /> Mark Step</Button><Button variant="danger" onClick={stop}><CircleStop className="size-4" /> Stop & Save</Button></> : <Button variant="gradient" onClick={start}><Play className="size-4" /> Start Recording</Button>}
              </div>
            </div>
            <CardContent className="p-0">
              <div className="grid lg:grid-cols-[1fr_270px]">
                <div className="p-5">
                  <div className="flex items-center justify-between"><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Browser capture</p><Badge variant={recording ? "danger" : "secondary"}>{recording ? "Live" : "Preview"}</Badge></div>
                  <div className="mt-3 overflow-hidden rounded-xl border border-border bg-[#101520] shadow-inner">
                    <div className="flex items-center gap-2 border-b border-white/10 px-3 py-2"><div className="flex gap-1.5"><span className="size-2 rounded-full bg-danger" /><span className="size-2 rounded-full bg-warning" /><span className="size-2 rounded-full bg-success" /></div><div className="ml-2 flex-1 rounded bg-white/5 px-3 py-1 text-[11px] text-slate-400">https://qa.example.test/login</div></div>
                    <div className="flex min-h-72 items-center justify-center bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 p-8">
                      <div className="w-full max-w-sm rounded-xl border border-white/10 bg-slate-900/70 p-5"><div className="mx-auto flex size-10 items-center justify-center rounded-lg bg-primary/20 text-primary"><ShieldCheck className="size-5" /></div><p className="mt-3 text-center text-sm font-semibold text-white">QA Application Login</p><div className="mt-5 space-y-2"><div className="h-9 rounded bg-white/10" /><div className="h-9 rounded bg-white/10" /><div className="h-9 rounded bg-primary/70" /></div><p className="mt-4 text-center text-[11px] text-slate-400">{recording ? "Capturing selector candidates and snapshots…" : "Start recording to capture browser evidence."}</p></div>
                    </div>
                  </div>
                </div>
                <div className="border-t border-border bg-secondary/20 p-5 lg:border-l lg:border-t-0">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Session setup</p>
                  <label className="mt-3 block"><span className="text-xs text-muted-foreground">Test case</span><select value={selectedCase} onChange={(event) => setSelectedCase(event.target.value)} className="mt-1 h-9 w-full rounded-lg border border-border bg-card px-2 text-sm outline-none">{testCases.slice(0, 6).map((testCase) => <option key={testCase.id} value={testCase.id}>{testCase.id} · {testCase.title}</option>)}</select></label>
                  <div className="mt-4 rounded-lg border border-border bg-card p-3"><p className="flex items-center gap-2 text-sm font-medium"><Globe2 className="size-4 text-primary" /> Target URL</p><p className="mt-1 truncate text-xs text-muted-foreground">https://qa.example.test</p></div>
                  <div className="mt-3 rounded-lg border border-border bg-card p-3"><p className="flex items-center gap-2 text-sm font-medium"><Layers3 className="size-4 text-primary" /> Canonical variables</p><p className="mt-1 text-xs text-muted-foreground">Masked data bindings are used during capture.</p><div className="mt-2 flex flex-wrap gap-1">{["base_url", "username", "password", "product_name"].map((variable) => <Badge key={variable} variant="secondary">&#123;&#123;{variable}&#125;&#125;</Badge>)}</div></div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card><CardHeader className="flex-row items-center justify-between"><div><CardTitle className="text-base">Captured Steps</CardTitle><CardDescription>Actions become automation candidates with stable selectors and attached evidence.</CardDescription></div><Badge variant="secondary">{events.length} steps</Badge></CardHeader><CardContent><div className="space-y-2">{events.map((event, index) => <div key={event.id} className="flex items-start gap-3 rounded-xl border border-border bg-secondary/20 p-3"><span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">{index + 1}</span><div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-2"><p className="text-sm font-medium">{event.label}</p><span className="font-mono text-[11px] text-muted-foreground">{event.time}</span></div><p className="mt-0.5 font-mono text-xs text-muted-foreground">{event.detail}</p></div><Badge variant="success"><CheckCircle2 className="size-3" /> Captured</Badge></div>)}</div></CardContent></Card>
        </div>

        <aside className="space-y-6">
          <Card><CardHeader><CardTitle className="flex items-center gap-2 text-base"><WandSparkles className="size-4 text-primary" /> Artifact Capture</CardTitle><CardDescription>Choose evidence to collect during this recording.</CardDescription></CardHeader><CardContent className="space-y-2">{captureTypes.map((capture) => { const Icon = capture.icon; const active = artifacts.includes(capture.id); return <button key={capture.id} onClick={() => !recording && toggleArtifact(capture.id)} className={cn("flex w-full items-center gap-3 rounded-lg border p-3 text-left", active ? "border-primary/35 bg-primary/5" : "border-border bg-secondary/20", recording && "cursor-default opacity-70")}><span className={cn("flex size-8 items-center justify-center rounded-lg bg-secondary", capture.color)}><Icon className="size-4" /></span><span className="flex-1"><span className="block text-sm font-medium">{capture.label}</span><span className="block text-xs text-muted-foreground">{capture.detail}</span></span><span className={cn("size-4 rounded border", active ? "border-primary bg-primary" : "border-muted-foreground/40")}>{active && <CheckCircle2 className="size-3.5 text-primary-foreground" />}</span></button>; })}</CardContent></Card>
          <Card className="border-success/25 bg-success/5"><CardHeader><CardTitle className="text-base">Artifact Summary</CardTitle></CardHeader><CardContent className="space-y-3"><Artifact label="Screenshots" value="8" icon={Image} /><Artifact label="Video" value="1 recording" icon={FileVideo2} /><Artifact label="Trace" value="1 trace.zip" icon={MonitorPlay} /><Artifact label="Network" value="24 requests" icon={Network} /><Artifact label="Console" value="0 errors" icon={TerminalSquare} /><Button variant="gradient" className="mt-2 w-full" onClick={() => router.push(`/automation?testCase=${selectedCase}`)}><Code2 className="size-4" /> Generate Automation</Button></CardContent></Card>
          <Card><CardHeader><CardTitle className="text-base">Recent Sessions</CardTitle></CardHeader><CardContent className="space-y-2">{[{ name: "Checkout guest flow", time: "Today, 09:32", artifacts: 14 }, { name: "Search relevance", time: "Yesterday", artifacts: 11 }, { name: "Password reset", time: "May 12", artifacts: 9 }].map((session) => <button key={session.name} className="flex w-full items-center justify-between rounded-lg border border-border bg-secondary/20 p-3 text-left hover:bg-accent"><div><p className="text-sm font-medium">{session.name}</p><p className="text-xs text-muted-foreground">{session.time}</p></div><Badge variant="secondary">{session.artifacts} files</Badge></button>)}</CardContent></Card>
        </aside>
      </div>
    </div>
  );
}

function Artifact({ label, value, icon: Icon }: { label: string; value: string; icon: typeof Image }) { return <div className="flex items-center justify-between rounded-lg border border-success/20 bg-card/60 px-3 py-2"><span className="flex items-center gap-2 text-sm"><Icon className="size-4 text-success" />{label}</span><span className="text-xs font-medium">{value}</span></div>; }
