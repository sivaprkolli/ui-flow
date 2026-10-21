"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bot, Camera, CheckCircle2, ChevronDown, CircleStop, Clock3, Code2,
  FileJson2, FileVideo2, Fingerprint, Layers3, ListPlus, MonitorSmartphone,
  Pause, Play, Plus, RefreshCw, ShieldCheck, Smartphone, Sparkles,
  WandSparkles, X, Zap,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/toast";
import { MobileArtifactScriptReview } from "@/components/recorder/mobile-artifact-script-review";
import { CapturedInteractionsToTestSteps } from "@/components/recorder/captured-interactions-to-test-steps";
import { saveRecordedStepDrafts, type RecordedInteraction } from "@/lib/recorded-step-drafts";
import { mobileDevices, testCases } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

type RecorderMode = "auto" | "manual";
type AutoPhase = "configure" | "recording" | "complete";

const mobileArtifacts = [
  { id: "screenshot", label: "Screenshot", icon: Camera, color: "text-sky-400", detail: "PNG at each step" },
  { id: "screen_record", label: "Screen recording", icon: FileVideo2, color: "text-fuchsia-400", detail: "Full session video" },
  { id: "device_log", label: "Device log", icon: FileJson2, color: "text-emerald-400", detail: "Logcat / syslog output" },
  { id: "hierarchy", label: "UI hierarchy", icon: Layers3, color: "text-violet-400", detail: "XML accessibility tree" },
  { id: "crash_log", label: "Crash log", icon: Fingerprint, color: "text-danger", detail: "Crash reports and traces" },
];

const autoActions = [
  { label: "Launch application", selector: "driver.activate_app(bundle_id)" },
  { label: "Tap username field", selector: "AppiumBy.ACCESSIBILITY_ID, 'username'" },
  { label: "Type {{username}}", selector: "send_keys(data['username'])" },
  { label: "Tap password field", selector: "AppiumBy.ACCESSIBILITY_ID, 'password'" },
  { label: "Type {{password}}", selector: "send_keys(data['password'])" },
  { label: "Tap Login button", selector: "AppiumBy.ACCESSIBILITY_ID, 'btn_login'" },
  { label: "Verify home screen", selector: "AppiumBy.ACCESSIBILITY_ID, 'home_title'" },
];

const manualInitialInteractions: RecordedInteraction[] = [
  { id: 1, time: "00:00", action: "Launch", target: "Application start", selector: "driver.activate_app(bundle_id)", testStep: "Launch the mobile application", artifacts: 3 },
  { id: 2, time: "00:05", action: "Tap", target: "Username field", selector: "AppiumBy.ACCESSIBILITY_ID, 'username'", testStep: "Tap the username input", artifacts: 2 },
  { id: 3, time: "00:08", action: "Type", target: "Username input", selector: "send_keys(data['username'])", testStep: "Enter {{username}}", artifacts: 2 },
  { id: 4, time: "00:11", action: "Tap", target: "Login button", selector: "AppiumBy.ACCESSIBILITY_ID, 'btn_login'", testStep: "Tap Login", artifacts: 4 },
];

const manualInitialEvents = [
  { id: 1, time: "00:00", label: "Application launched", detail: "bundle_id · com.qa.example" },
  { id: 2, time: "00:05", label: "Tapped username field", detail: "AppiumBy.ACCESSIBILITY_ID · username" },
  { id: 3, time: "00:08", label: "Entered {{username}}", detail: "masked · canonical variable" },
  { id: 4, time: "00:11", label: "Tapped Login", detail: "AppiumBy.ACCESSIBILITY_ID · btn_login" },
];

export default function MobileRecorderPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [mode, setMode] = useState<RecorderMode>("manual");

  /* ── Auto recorder state ── */
  const [autoPhase, setAutoPhase] = useState<AutoPhase>("configure");
  const [autoCaptured, setAutoCaptured] = useState(0);
  const [selectedDevice, setSelectedDevice] = useState(mobileDevices[0]?.id ?? "");
  const [reviewTarget, setReviewTarget] = useState<"artifacts" | "script">("artifacts");
  const [reviewMenuOpen, setReviewMenuOpen] = useState(false);
  const [autoReviewOpen, setAutoReviewOpen] = useState(false);

  /* ── Manual recorder state ── */
  const [recording, setRecording] = useState(false);
  const [paused, setPaused] = useState(false);
  const [elapsed, setElapsed] = useState(11);
  const [events, setEvents] = useState(manualInitialEvents);
  const [interactions, setInteractions] = useState<RecordedInteraction[]>(manualInitialInteractions);
  const [artifacts, setArtifacts] = useState(mobileArtifacts.map((a) => a.id));
  const [selectedCase, setSelectedCase] = useState("TC-001");
  const [manualReviewOpen, setManualReviewOpen] = useState(false);

  const activeTestCase = testCases.find((tc) => tc.id === selectedCase) ?? testCases[0];
  const activeDevice = mobileDevices.find((d) => d.id === selectedDevice) ?? mobileDevices[0];
  const availableDevices = mobileDevices.filter((d) => d.status !== "Offline");
  const formatted = `${String(Math.floor(elapsed / 60)).padStart(2, "0")}:${String(elapsed % 60).padStart(2, "0")}`;
  const autoProgress = Math.round((autoCaptured / autoActions.length) * 100);

  useEffect(() => {
    if (autoPhase !== "recording") return;
    const timer = window.setInterval(() => setAutoCaptured((n) => {
      if (n >= autoActions.length) { window.clearInterval(timer); setAutoPhase("complete"); return n; }
      return n + 1;
    }), 750);
    return () => window.clearInterval(timer);
  }, [autoPhase]);

  useEffect(() => {
    if (!recording || paused) return;
    const timer = window.setInterval(() => setElapsed((v) => v + 1), 1000);
    return () => window.clearInterval(timer);
  }, [recording, paused]);

  const startAuto = () => { setAutoCaptured(0); setAutoPhase("recording"); toast({ title: "Automatic mobile recorder started", description: `${activeDevice?.name} · ${activeTestCase.id}`, variant: "info" }); };
  const openReview = (target: "artifacts" | "script") => { setReviewTarget(target); setReviewMenuOpen(false); setAutoReviewOpen(true); };
  const startManual = () => { setRecording(true); setPaused(false); setElapsed(0); toast({ title: "Manual mobile recording started", description: `Capturing gestures and artifacts on ${activeDevice?.name}.`, variant: "info" }); };
  const addMarker = () => {
    const id = Date.now();
    setEvents((ev) => [...ev, { id, time: formatted, label: `Checkpoint ${ev.length + 1}`, detail: "User-marked validation step" }]);
    setInteractions((it) => [...it, { id, time: formatted, action: "Checkpoint", target: `Validation step ${it.length + 1}`, selector: "driver.mark_step()", testStep: "Verify the expected mobile outcome", artifacts: 2 }]);
    toast({ title: "Mobile checkpoint captured", description: "Screenshot, hierarchy dump and device log saved.", variant: "success" });
  };
  const stopManual = () => { setRecording(false); setPaused(false); setManualReviewOpen(true); toast({ title: "Mobile recording complete", description: `${events.length} steps · ${artifacts.length} artifact types.`, variant: "success" }); };
  const toggleArtifact = (id: string) => setArtifacts((a) => a.includes(id) ? a.filter((x) => x !== id) : [...a, id]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mobile Recorder"
        description="Record Appium interactions on real devices and simulators — automatically or with guided manual capture."
        icon={<MonitorSmartphone className="size-5" />}
        actions={<>
          <Button variant="secondary" onClick={() => router.push("/mobile-automation")}><Smartphone className="size-4" /> Device Manager</Button>
          <Button variant="gradient" onClick={() => router.push(`/mobile-automation?testCase=${selectedCase}`)}><Bot className="size-4" /> Generate Automation</Button>
        </>}
      />

      {/* Mode toggle */}
      <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card p-3">
        <div className="flex rounded-lg bg-secondary/60 p-1">
          <button onClick={() => setMode("auto")} className={cn("flex items-center gap-2 rounded-md px-5 py-2.5 text-sm font-semibold transition-colors", mode === "auto" ? "bg-gradient-to-r from-primary to-fuchsia-500 text-white shadow" : "text-muted-foreground hover:text-foreground")}>
            <WandSparkles className="size-4" /> Automatic Recorder
          </button>
          <button onClick={() => setMode("manual")} className={cn("flex items-center gap-2 rounded-md px-5 py-2.5 text-sm font-semibold transition-colors", mode === "manual" ? "bg-gradient-to-r from-primary to-fuchsia-500 text-white shadow" : "text-muted-foreground hover:text-foreground")}>
            <Camera className="size-4" /> Manual Recorder
          </button>
        </div>
        <p className="text-xs text-muted-foreground">
          {mode === "auto" ? "AI drives the session and captures evidence automatically. Review artifacts and Appium script after completion." : "You control the session. Mark steps and capture artifacts at any point."}
        </p>
      </div>

      {/* ─────────────────── AUTOMATIC RECORDER ─────────────────── */}
      {mode === "auto" && (
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          {/* Left – configuration */}
          <div className="space-y-5">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base"><Smartphone className="size-4 text-primary" /> Device & App Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs text-muted-foreground">Target device</label>
                  <select value={selectedDevice} onChange={(e) => setSelectedDevice(e.target.value)} className="h-10 w-full rounded-lg border border-border bg-secondary/20 px-3 text-sm outline-none focus:ring-2 focus:ring-ring">
                    {availableDevices.map((d) => <option key={d.id} value={d.id}>{d.platform === "iOS" ? "🍎" : "🤖"} {d.name} · {d.platform} {d.os} · {d.type}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs text-muted-foreground">Test case</label>
                  <select value={selectedCase} onChange={(e) => setSelectedCase(e.target.value)} className="h-10 w-full rounded-lg border border-border bg-secondary/20 px-3 text-sm outline-none focus:ring-2 focus:ring-ring">
                    {testCases.slice(0, 6).map((tc) => <option key={tc.id} value={tc.id}>{tc.id} · {tc.title}</option>)}
                  </select>
                </div>
                <section>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Automatic evidence capture</p>
                  <div className="space-y-2">
                    {[
                      { icon: Camera, label: "Screenshots", value: "At every captured step" },
                      { icon: FileVideo2, label: "Screen recording", value: "Full session replay" },
                      { icon: FileJson2, label: "Device log", value: "Logcat / syslog output" },
                      { icon: Layers3, label: "UI hierarchy", value: "XML accessibility tree" },
                    ].map((item) => <div key={item.label} className="flex items-center gap-3 rounded-lg border border-border bg-secondary/20 p-3">
                      <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary"><item.icon className="size-4" /></span>
                      <div><p className="text-sm font-medium">{item.label}</p><p className="text-xs text-muted-foreground">{item.value}</p></div>
                      <CheckCircle2 className="ml-auto size-4 text-success" />
                    </div>)}
                  </div>
                </section>
                <div className="rounded-xl border border-success/25 bg-success/5 p-3">
                  <div className="flex gap-2"><ShieldCheck className="mt-0.5 size-4 shrink-0 text-success" /><div><p className="text-sm font-medium">Mobile automation guardrails</p><p className="mt-1 text-xs text-muted-foreground">Canonical variables, masked test-data, accessibility-first locators, and Appium 2.x selector fallback enforced.</p></div></div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right – recorder activity */}
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">Recorder Activity</CardTitle>
                <CardDescription>{autoPhase === "configure" ? "Ready to inspect the test case" : autoPhase === "recording" ? "Capturing gestures and evidence" : "Capture complete — review artifacts and script"}</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                {autoPhase === "recording" && <Badge variant="danger"><span className="size-1.5 animate-pulse rounded-full bg-danger" /> Recording</Badge>}
                {autoPhase === "complete" && (
                  <div className="relative">
                    <Button variant="secondary" size="sm" onClick={() => setReviewMenuOpen((v) => !v)}>
                      <Layers3 className="size-3.5" /> Review <ChevronDown className="size-3.5" />
                    </Button>
                    {reviewMenuOpen && (
                      <div className="absolute right-0 top-10 z-20 w-52 overflow-hidden rounded-xl border border-border bg-popover p-1 shadow-xl animate-fade-in">
                        <button onClick={() => openReview("artifacts")} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-accent"><Camera className="size-4 text-primary" /> Review Artifacts</button>
                        <button onClick={() => openReview("script")} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-accent"><Code2 className="size-4 text-primary" /> Review Appium Script</button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              {autoPhase !== "configure" && <Progress value={autoProgress} indicatorClassName="bg-gradient-to-r from-primary to-fuchsia-500" />}

              {/* Phone mockup */}
              <div className="overflow-hidden rounded-xl border border-border bg-[#0a1020]">
                <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Smartphone className="size-4 text-sky-300" />
                    <span className="text-xs font-medium text-white">{activeDevice?.name} · {activeDevice?.platform}</span>
                  </div>
                  <div className="flex gap-1.5">
                    <span className="size-2 rounded-full bg-danger" /><span className="size-2 rounded-full bg-warning" /><span className="size-2 rounded-full bg-success" />
                  </div>
                </div>
                <div className="flex justify-center bg-gradient-to-b from-slate-800 to-slate-950 py-6">
                  <div className="relative w-36 rounded-3xl border-4 border-slate-600 bg-slate-900 p-2 shadow-2xl">
                    <div className="mb-2 h-2.5 w-16 rounded-full bg-slate-700 mx-auto" />
                    <div className="h-52 rounded-2xl bg-slate-800 p-3">
                      {autoPhase === "recording" ? (
                        <div className="space-y-2">
                          <div className="h-8 w-full animate-pulse rounded-lg bg-primary/30" />
                          <div className="h-8 w-full animate-pulse rounded-lg bg-primary/20" />
                          <div className="mt-3 h-10 w-full rounded-lg bg-primary/60" />
                          <div className="mt-2 flex justify-center"><div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>
                        </div>
                      ) : autoPhase === "complete" ? (
                        <div className="flex h-full flex-col items-center justify-center gap-2">
                          <CheckCircle2 className="size-8 text-success" />
                          <p className="text-center text-[10px] text-slate-300">Capture complete</p>
                        </div>
                      ) : (
                        <div className="flex h-full flex-col items-center justify-center gap-2">
                          <WandSparkles className="size-7 text-primary/60" />
                          <p className="text-center text-[10px] text-slate-500">Launch to begin</p>
                        </div>
                      )}
                    </div>
                    <div className="mt-2 h-1 w-12 rounded-full bg-slate-700 mx-auto" />
                  </div>
                </div>
              </div>

              {/* Captured action list */}
              <div className="space-y-2">
                {autoActions.map((action, index) => {
                  const done = index < autoCaptured;
                  const active = autoPhase === "recording" && index === autoCaptured;
                  return (
                    <div key={action.label} className={cn("flex items-center gap-3 rounded-lg border p-3 transition-all", done ? "border-success/25 bg-success/5" : active ? "border-primary/35 bg-primary/5" : "border-border bg-secondary/20 opacity-50")}>
                      <span className={cn("flex size-7 items-center justify-center rounded-full text-xs", done ? "bg-success/15 text-success" : active ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground")}>
                        {done ? <CheckCircle2 className="size-4" /> : active ? <span className="size-2 animate-pulse rounded-full bg-primary" /> : index + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">{action.label}</p>
                        <code className="block truncate text-[11px] text-muted-foreground">{action.selector}</code>
                      </div>
                      {done && <Badge variant="success">Captured</Badge>}
                      {active && <Badge variant="default">Inspecting</Badge>}
                    </div>
                  );
                })}
              </div>

              {/* Completion summary */}
              {autoPhase === "complete" && (
                <div className="grid grid-cols-3 gap-2">
                  <SummaryTile icon={Camera} label={`${autoActions.length} actions`} tone="text-primary" />
                  <SummaryTile icon={FileVideo2} label="8 screenshots" tone="text-fuchsia-400" />
                  <SummaryTile icon={FileJson2} label="Device logs" tone="text-emerald-400" />
                </div>
              )}

              {/* Footer CTA */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
                <button onClick={() => setMode("manual")} className="text-sm font-medium text-primary hover:underline">Prefer guided capture? Open Manual Recorder</button>
                <div className="flex gap-2">
                  {autoPhase === "recording" ? (
                    <Button variant="danger" onClick={() => { setAutoPhase("configure"); setAutoCaptured(0); }}><CircleStop className="size-4" /> Stop recording</Button>
                  ) : autoPhase === "complete" ? (
                    <>
                      <Button variant="secondary" onClick={() => { setAutoPhase("configure"); setAutoCaptured(0); }}>Record again</Button>
                      <Button variant="gradient" onClick={() => openReview("script")}><Code2 className="size-4" /> Execute & Confirm Script</Button>
                    </>
                  ) : (
                    <Button variant="gradient" onClick={startAuto}><Play className="size-4" /> Launch Automatic Recorder</Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ─────────────────── MANUAL RECORDER ─────────────────── */}
      {mode === "manual" && (
        <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            {/* Main capture card */}
            <Card className={cn("overflow-hidden border", recording ? "border-danger/40" : "border-primary/25")}>
              <div className={cn("flex flex-wrap items-center justify-between gap-4 p-5", recording ? "bg-gradient-to-r from-danger/10 via-card to-card" : "bg-gradient-to-r from-primary/10 via-card to-fuchsia-500/5")}>
                <div className="flex items-center gap-3">
                  <div className={cn("relative flex size-12 items-center justify-center rounded-xl text-white", recording ? "bg-danger" : "bg-gradient-to-br from-primary to-fuchsia-500")}>
                    <Camera className="size-6" />
                    {recording && <span className="absolute -right-1 -top-1 flex size-3"><span className="absolute inline-flex size-full animate-ping rounded-full bg-danger" /><span className="relative inline-flex size-3 rounded-full bg-danger ring-2 ring-card" /></span>}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{recording ? paused ? "Recording paused" : "Mobile session in progress" : "Ready to record a manual flow"}</p>
                    <p className="text-xs text-muted-foreground">{activeDevice?.platform} · {activeDevice?.name} · {selectedCase} · {formatted}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recording ? (
                    <>
                      <Button variant="secondary" onClick={() => setPaused((v) => !v)}>{paused ? <Play className="size-4" /> : <Pause className="size-4" />}{paused ? "Resume" : "Pause"}</Button>
                      <Button variant="secondary" onClick={addMarker}><ListPlus className="size-4" /> Mark Step</Button>
                      <Button variant="danger" onClick={stopManual}><CircleStop className="size-4" /> Stop & Save</Button>
                    </>
                  ) : (
                    <Button variant="gradient" onClick={startManual}><Play className="size-4" /> Start Recording</Button>
                  )}
                </div>
              </div>
              <CardContent className="p-0">
                <div className="grid lg:grid-cols-[1fr_260px]">
                  {/* Phone + capture area */}
                  <div className="p-5">
                    <div className="flex items-center justify-between"><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Device capture</p><Badge variant={recording ? "danger" : "secondary"}>{recording ? "Live" : "Preview"}</Badge></div>
                    <div className="mt-3 flex justify-center overflow-hidden rounded-xl border border-border bg-[#0a1020]">
                      <div className="py-8">
                        <div className="relative mx-auto w-44 rounded-3xl border-4 border-slate-600 bg-slate-900 p-2 shadow-2xl">
                          <div className="mb-2 h-3 w-20 rounded-full bg-slate-700 mx-auto" />
                          <div className="h-64 rounded-2xl bg-slate-800 p-3">
                            {recording ? (
                              <div className="space-y-2">
                                <div className="h-6 w-full rounded bg-slate-700" />
                                <div className="h-9 w-full animate-pulse rounded-lg bg-primary/30" />
                                <div className="h-9 w-full rounded-lg bg-slate-700" />
                                <div className="mt-3 h-11 w-full rounded-lg bg-primary/60" />
                                <p className="mt-4 text-center text-[10px] text-slate-400">Capturing gestures…</p>
                              </div>
                            ) : (
                              <div className="flex h-full flex-col items-center justify-center gap-3">
                                <Smartphone className="size-8 text-slate-600" />
                                <p className="text-center text-[10px] text-slate-500">Start recording to<br />capture mobile evidence</p>
                              </div>
                            )}
                          </div>
                          <div className="mt-2 h-1 w-14 rounded-full bg-slate-700 mx-auto" />
                        </div>
                        <p className="mt-3 text-center font-mono text-[11px] text-slate-500">{activeDevice?.name} · {activeDevice?.os}</p>
                      </div>
                    </div>
                  </div>

                  {/* Session setup */}
                  <div className="border-t border-border bg-secondary/20 p-5 lg:border-l lg:border-t-0">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Session setup</p>
                    <label className="mt-3 block">
                      <span className="text-xs text-muted-foreground">Device</span>
                      <select value={selectedDevice} onChange={(e) => setSelectedDevice(e.target.value)} className="mt-1 h-9 w-full rounded-lg border border-border bg-card px-2 text-sm outline-none">
                        {availableDevices.map((d) => <option key={d.id} value={d.id}>{d.platform === "iOS" ? "🍎" : "🤖"} {d.name}</option>)}
                      </select>
                    </label>
                    <label className="mt-3 block">
                      <span className="text-xs text-muted-foreground">Test case</span>
                      <select value={selectedCase} onChange={(e) => setSelectedCase(e.target.value)} className="mt-1 h-9 w-full rounded-lg border border-border bg-card px-2 text-sm outline-none">
                        {testCases.slice(0, 6).map((tc) => <option key={tc.id} value={tc.id}>{tc.id} · {tc.title}</option>)}
                      </select>
                    </label>
                    <div className="mt-4 rounded-lg border border-border bg-card p-3">
                      <p className="flex items-center gap-2 text-sm font-medium"><Layers3 className="size-4 text-primary" /> Canonical variables</p>
                      <p className="mt-1 text-xs text-muted-foreground">Masked data bindings used during capture.</p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {activeTestCase.variables.slice(0, 4).map((v) => <Badge key={v.variableId} variant="secondary">&#123;&#123;{v.name}&#125;&#125;</Badge>)}
                      </div>
                    </div>
                    <div className="mt-3 rounded-lg border border-success/25 bg-success/5 p-3 text-xs text-success"><ShieldCheck className="mr-1 inline size-3.5" /> Credentials are masked in all captured evidence.</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Captured steps */}
            <Card>
              <CardHeader className="flex-row items-center justify-between">
                <div><CardTitle className="text-base">Captured Mobile Steps</CardTitle><CardDescription>Gestures and interactions become Appium automation candidates.</CardDescription></div>
                <Badge variant="secondary">{events.length} steps</Badge>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {events.map((event, index) => (
                    <div key={event.id} className="flex items-start gap-3 rounded-xl border border-border bg-secondary/20 p-3">
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">{index + 1}</span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2"><p className="text-sm font-medium">{event.label}</p><span className="font-mono text-[11px] text-muted-foreground">{event.time}</span></div>
                        <p className="mt-0.5 font-mono text-xs text-muted-foreground">{event.detail}</p>
                      </div>
                      <Badge variant="success"><CheckCircle2 className="size-3" /> Captured</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Captured interactions → test steps */}
            <CapturedInteractionsToTestSteps
              interactions={interactions}
              targetLabel={selectedCase}
              targetDescription={activeTestCase.title}
              onFeed={(selected) => {
                saveRecordedStepDrafts(selectedCase, "manual_recorder", selected);
                toast({ title: "Mobile steps drafted", description: `${selected.length} interactions sent to ${selectedCase}.`, variant: "success" });
                router.push(`/test-cases?testCase=${selectedCase}&source=mobile-recorder`);
              }}
            />
          </div>

          {/* Right sidebar */}
          <aside className="space-y-6">
            {/* Artifact capture */}
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Zap className="size-4 text-primary" /> Artifact Capture</CardTitle><CardDescription>Choose evidence types for this recording.</CardDescription></CardHeader>
              <CardContent className="space-y-2">
                {mobileArtifacts.map((item) => {
                  const Icon = item.icon;
                  const active = artifacts.includes(item.id);
                  return (
                    <button key={item.id} onClick={() => !recording && toggleArtifact(item.id)} className={cn("flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors", active ? "border-primary/35 bg-primary/5" : "border-border bg-secondary/20", recording && "cursor-default opacity-70")}>
                      <span className={cn("flex size-8 items-center justify-center rounded-lg bg-secondary", item.color)}><Icon className="size-4" /></span>
                      <span className="flex-1"><span className="block text-sm font-medium">{item.label}</span><span className="block text-xs text-muted-foreground">{item.detail}</span></span>
                      <span className={cn("size-4 rounded border", active ? "border-primary bg-primary" : "border-muted-foreground/40")}>{active && <CheckCircle2 className="size-3.5 text-primary-foreground" />}</span>
                    </button>
                  );
                })}
              </CardContent>
            </Card>

            {/* Artifact summary */}
            <Card className="border-success/25 bg-success/5">
              <CardHeader><CardTitle className="text-base">Artifact Summary</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                <ArtifactRow icon={Camera} label="Screenshots" value="6 captures" />
                <ArtifactRow icon={FileVideo2} label="Screen recording" value="1 recording" />
                <ArtifactRow icon={FileJson2} label="Device log" value="1 logcat.txt" />
                <ArtifactRow icon={Layers3} label="UI hierarchy" value="4 snapshots" />
                <Button variant="secondary" className="mt-2 w-full" onClick={() => setManualReviewOpen(true)}><Camera className="size-4" /> Review Artifacts & Script</Button>
              </CardContent>
            </Card>

            {/* Recent sessions */}
            <Card>
              <CardHeader><CardTitle className="text-base">Recent Sessions</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {[{ name: "iOS Login flow", time: "Today, 10:14", artifacts: 12, platform: "iOS" }, { name: "Android Checkout", time: "Yesterday", artifacts: 16, platform: "Android" }, { name: "iOS Password reset", time: "May 14", artifacts: 9, platform: "iOS" }].map((session) => (
                  <button key={session.name} className="flex w-full items-center justify-between rounded-lg border border-border bg-secondary/20 p-3 text-left hover:bg-accent">
                    <div>
                      <p className="flex items-center gap-1.5 text-sm font-medium">{session.platform === "iOS" ? "🍎" : "🤖"} {session.name}</p>
                      <p className="text-xs text-muted-foreground">{session.time}</p>
                    </div>
                    <Badge variant="secondary">{session.artifacts} files</Badge>
                  </button>
                ))}
              </CardContent>
            </Card>
          </aside>
        </div>
      )}

      {/* Artifact & Script Review overlays */}
      <MobileArtifactScriptReview testCase={activeTestCase} open={autoReviewOpen} onClose={() => setAutoReviewOpen(false)} source="Automatic Recorder" initialTab={reviewTarget} onConfirmScript={() => toast({ title: "Mobile Appium script confirmed", description: `${activeTestCase.id} is ready for mobile execution.`, variant: "success" })} />
      <MobileArtifactScriptReview testCase={activeTestCase} open={manualReviewOpen} onClose={() => setManualReviewOpen(false)} source="Manual Recorder" initialTab="artifacts" onConfirmScript={() => toast({ title: "Mobile script confirmed", description: `${activeTestCase.id} approved for automation.`, variant: "success" })} />
    </div>
  );
}

function SummaryTile({ icon: Icon, label, tone }: { icon: typeof Camera; label: string; tone: string }) {
  return <div className="rounded-lg border border-border bg-secondary/30 p-3 text-center"><Icon className={cn("mx-auto size-4", tone)} /><p className="mt-1 text-xs font-medium">{label}</p></div>;
}
function ArtifactRow({ icon: Icon, label, value }: { icon: typeof Camera; label: string; value: string }) {
  return <div className="flex items-center justify-between rounded-lg border border-success/20 bg-card/60 px-3 py-2"><span className="flex items-center gap-2 text-sm"><Icon className="size-4 text-success" />{label}</span><span className="text-xs font-medium">{value}</span></div>;
}
