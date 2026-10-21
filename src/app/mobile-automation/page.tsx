"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle, Bot, CheckCircle2, ChevronRight, CircleDot, Code2, Copy, Download,
  FileJson2, FileVideo2, Image, Layers3, MonitorSmartphone, Play, Plus,
  RefreshCw, Smartphone, Sparkles, Square, Tag, Wifi, WifiOff, Zap,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { StatusPill } from "@/components/ui/status-pill";
import { CodeEditor } from "@/components/automation/code-editor";
import { useToast } from "@/components/ui/toast";
import { mobileDevices, mobileTestRuns, testCases, type MobileDevice } from "@/lib/mock-data";
import { generateCanonicalAutomationScript } from "@/lib/canonical-variables";
import { cn } from "@/lib/utils";

type Tab = "devices" | "scripts" | "execution" | "results";

const iosPlatform = "#007aff";
const androidPlatform = "#3ddc84";

const statusDot: Record<MobileDevice["status"], string> = {
  Available: "bg-success", Busy: "bg-warning", Offline: "bg-muted-foreground",
};

const runStatusStyle: Record<string, string> = {
  Passed: "text-success", Failed: "text-danger", Running: "text-warning", Skipped: "text-muted-foreground",
};

export default function MobileAutomationPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [tab, setTab] = useState<Tab>("devices");
  const [selectedDevices, setSelectedDevices] = useState<string[]>(["DEV-001", "DEV-005"]);
  const [selectedCase, setSelectedCase] = useState("TC-001");
  const [platform, setPlatform] = useState<"iOS" | "Android" | "Both">("Both");
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [scriptLang, setScriptLang] = useState<"python" | "java" | "typescript">("python");

  const activeTestCase = testCases.find((t) => t.id === selectedCase) ?? testCases[0];
  const filteredDevices = mobileDevices.filter((d) => platform === "Both" || d.platform === platform);
  const availableDevices = filteredDevices.filter((d) => d.status === "Available");
  const selectedRuns = mobileTestRuns.filter((r) => r.testCaseId === selectedCase);

  const toggleDevice = (id: string) => setSelectedDevices((current) => current.includes(id) ? current.filter((d) => d !== id) : [...current, id]);

  const startExecution = () => {
    setRunning(true);
    setProgress(0);
    setTab("execution");
    toast({ title: "Mobile execution started", description: `Running ${selectedCase} on ${selectedDevices.length} device${selectedDevices.length === 1 ? "" : "s"}.`, variant: "info" });
    const interval = window.setInterval(() => {
      setProgress((p) => {
        if (p >= 100) { window.clearInterval(interval); setRunning(false); toast({ title: "Execution complete", description: `${selectedDevices.length} device${selectedDevices.length === 1 ? "" : "s"} finished.`, variant: "success" }); return 100; }
        return p + 4;
      });
    }, 300);
  };

  const mobileScript = generateCanonicalAutomationScript("mobile", activeTestCase.variables);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mobile Automation"
        description="AI-generated Appium automation with device management, canonical variable bindings, and device-farm execution."
        icon={<MonitorSmartphone className="size-5" />}
        actions={<>
          <Badge variant="success"><Sparkles className="size-3" /> AI Ready</Badge>
          <Button variant="gradient" onClick={startExecution} disabled={!selectedDevices.length || running}>
            <Play className="size-4" /> Run on {selectedDevices.length} device{selectedDevices.length === 1 ? "" : "s"}
          </Button>
        </>}
      />

      {/* Tab bar */}
      <div className="flex flex-wrap gap-1 border-b border-border">
        {([["devices", "Device Manager"], ["scripts", "Script Generation"], ["execution", "Execution"], ["results", "Results"]] as [Tab, string][]).map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} className={cn("flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-medium transition-colors", tab === id ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground")}>
            {id === "devices" && <Smartphone className="size-4" />}
            {id === "scripts" && <Code2 className="size-4" />}
            {id === "execution" && <Play className="size-4" />}
            {id === "results" && <Layers3 className="size-4" />}
            {label}
            {id === "devices" && <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px]">{mobileDevices.length}</span>}
            {id === "execution" && running && <span className="size-1.5 animate-pulse rounded-full bg-warning" />}
          </button>
        ))}
      </div>

      {/* ─── DEVICE MANAGER ─── */}
      {tab === "devices" && (
        <div className="space-y-6">
          {/* Summary KPIs */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <Kpi label="Total devices" value={mobileDevices.length.toString()} tone="text-primary" icon={Smartphone} />
            <Kpi label="Available" value={mobileDevices.filter((d) => d.status === "Available").length.toString()} tone="text-success" icon={Wifi} />
            <Kpi label="Busy" value={mobileDevices.filter((d) => d.status === "Busy").length.toString()} tone="text-warning" icon={CircleDot} />
            <Kpi label="Offline" value={mobileDevices.filter((d) => d.status === "Offline").length.toString()} tone="text-muted-foreground" icon={WifiOff} />
          </div>

          {/* Platform filter + device grid */}
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">Connected Devices</CardTitle>
                <CardDescription>Select devices to include in the next execution run.</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex rounded-lg bg-secondary/60 p-1">
                  {(["Both", "iOS", "Android"] as const).map((p) => (
                    <button key={p} onClick={() => setPlatform(p)} className={cn("rounded-md px-3 py-1.5 text-xs font-medium", platform === p ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>{p}</button>
                  ))}
                </div>
                <Button size="sm" variant="outline" onClick={() => toast({ title: "Refreshing device list", variant: "info" })}><RefreshCw className="size-3.5" /> Refresh</Button>
                <Button size="sm" variant="gradient" onClick={() => toast({ title: "Add device", description: "Scan for USB or configure Appium server.", variant: "info" })}><Plus className="size-3.5" /> Add Device</Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto scrollbar-thin">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground"><th className="px-5 py-3 font-medium">Select</th><th className="px-5 py-3 font-medium">Device</th><th className="px-5 py-3 font-medium">Platform</th><th className="px-5 py-3 font-medium">OS</th><th className="px-5 py-3 font-medium">Type</th><th className="px-5 py-3 font-medium">Resolution</th><th className="px-5 py-3 font-medium">Status</th></tr></thead>
                  <tbody>
                    {filteredDevices.map((device) => {
                      const checked = selectedDevices.includes(device.id);
                      return (
                        <tr key={device.id} onClick={() => device.status !== "Offline" && toggleDevice(device.id)} className={cn("border-b border-border/60 last:border-0 hover:bg-accent/40", device.status !== "Offline" ? "cursor-pointer" : "opacity-50")}>
                          <td className="px-5 py-3">
                            <span className={cn("flex size-5 items-center justify-center rounded border", checked ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/40")}>
                              {checked && <CheckCircle2 className="size-3.5" />}
                            </span>
                          </td>
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{device.platform === "iOS" ? "🍎" : "🤖"}</span>
                              <div><p className="font-medium">{device.name}</p><p className="font-mono text-xs text-muted-foreground">{device.udid.slice(0, 16)}…</p></div>
                            </div>
                          </td>
                          <td className="px-5 py-3"><Badge variant={device.platform === "iOS" ? "info" : "success"}>{device.platform}</Badge></td>
                          <td className="px-5 py-3 font-mono text-xs">{device.os}</td>
                          <td className="px-5 py-3"><Badge variant="secondary">{device.type}</Badge></td>
                          <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{device.resolution}</td>
                          <td className="px-5 py-3">
                            <span className="flex items-center gap-2 font-medium">
                              <span className={cn("size-2 rounded-full", statusDot[device.status])} />
                              {device.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Selected summary */}
          {selectedDevices.length > 0 && (
            <Card className="border-primary/25 bg-primary/5">
              <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <Smartphone className="size-5 text-primary" />
                  <p className="font-medium">{selectedDevices.length} device{selectedDevices.length === 1 ? "" : "s"} selected for next run</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedDevices.map((id) => {
                      const d = mobileDevices.find((device) => device.id === id);
                      return d ? <Badge key={id} variant="secondary">{d.name}</Badge> : null;
                    })}
                  </div>
                </div>
                <Button variant="gradient" onClick={() => setTab("scripts")}><Code2 className="size-4" /> Generate Scripts <ChevronRight className="size-4" /></Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* ─── SCRIPT GENERATION ─── */}
      {tab === "scripts" && (
        <div className="space-y-6">
          {/* Test case selector */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Script Configuration</CardTitle>
              <CardDescription>Select a test case to generate Appium scripts backed by the canonical variable registry.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Test case</label>
                  <select value={selectedCase} onChange={(e) => setSelectedCase(e.target.value)} className="h-10 w-full rounded-lg border border-border bg-secondary/20 px-3 text-sm outline-none focus:ring-2 focus:ring-ring">
                    {testCases.slice(0, 6).map((tc) => <option key={tc.id} value={tc.id}>{tc.id} · {tc.title}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Language</label>
                  <div className="flex rounded-lg bg-secondary/60 p-1">
                    {(["python", "java", "typescript"] as const).map((l) => (
                      <button key={l} onClick={() => setScriptLang(l)} className={cn("flex-1 rounded-md px-2 py-2 text-xs font-medium capitalize", scriptLang === l ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>{l}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Target platforms</label>
                  <div className="flex h-10 flex-wrap items-center gap-2">
                    <Badge variant="info">iOS · Appium 2.x</Badge>
                    <Badge variant="success">Android · Appium 2.x</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Script viewer: iOS + Android side-by-side */}
          <div className="grid gap-6 xl:grid-cols-2">
            <ScriptCard platform="iOS" testCase={activeTestCase} language={scriptLang} onCopy={() => toast({ title: "iOS script copied", description: "Canonical variable names preserved.", variant: "success" })} />
            <ScriptCard platform="Android" testCase={activeTestCase} language={scriptLang} onCopy={() => toast({ title: "Android script copied", description: "Canonical variable names preserved.", variant: "success" })} />
          </div>

          {/* Canonical variable binding proof */}
          <Card className="border-primary/25">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base"><Sparkles className="size-4 text-primary" /> Canonical Variable Registry — Cross-Platform Proof</CardTitle>
              <CardDescription>These exact names and IDs are used unchanged in every generated script target.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto scrollbar-thin">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground"><th className="px-4 py-2 font-medium">Variable ID</th><th className="px-4 py-2 font-medium">Canonical name</th><th className="px-4 py-2 font-medium">Type</th><th className="px-4 py-2 font-medium">iOS · Appium</th><th className="px-4 py-2 font-medium">Android · Appium</th><th className="px-4 py-2 font-medium">API</th><th className="px-4 py-2 font-medium">Performance</th></tr></thead>
                  <tbody>
                    {activeTestCase.variables.map((variable) => (
                      <tr key={variable.variableId} className="border-b border-border/60 last:border-0">
                        <td className="px-4 py-2 font-mono text-xs text-primary">{variable.variableId}</td>
                        <td className="px-4 py-2 font-mono text-xs font-semibold">{variable.name}</td>
                        <td className="px-4 py-2"><Badge variant="secondary">{variable.type}</Badge></td>
                        <td className="px-4 py-2 font-mono text-xs text-success">data["{variable.name}"]</td>
                        <td className="px-4 py-2 font-mono text-xs text-success">data["{variable.name}"]</td>
                        <td className="px-4 py-2 font-mono text-xs text-sky-400">data["{variable.name}"]</td>
                        <td className="px-4 py-2 font-mono text-xs text-fuchsia-400">{"${"}{variable.name}{"}"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card className="border-success/25 bg-success/5">
            <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
              <div className="flex items-center gap-2 text-success"><CheckCircle2 className="size-5" /><p className="font-medium">Scripts validated and ready for device execution</p></div>
              <Button variant="gradient" onClick={startExecution}><Play className="size-4" /> Run on {selectedDevices.length} device{selectedDevices.length === 1 ? "" : "s"}</Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ─── EXECUTION ─── */}
      {tab === "execution" && (
        <div className="space-y-6">
          {/* Progress */}
          <Card className={cn("border", running ? "border-warning/40" : "border-success/30")}>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="text-base">Mobile Execution Progress</CardTitle>
              <Badge variant={running ? "warning" : "success"}>
                <span className={cn("size-1.5 rounded-full", running ? "bg-warning animate-pulse" : "bg-success")} />
                {running ? "Running" : "Completed"}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="mb-2 flex items-baseline justify-between">
                <span className="text-2xl font-semibold tabular-nums">{selectedDevices.length} device{selectedDevices.length === 1 ? "" : "s"}</span>
                <span className="text-sm text-muted-foreground">{progress}%</span>
              </div>
              <Progress value={progress} indicatorClassName="bg-gradient-to-r from-primary to-fuchsia-500" />
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Stat dot="bg-success" label="Passed" value={progress === 100 ? selectedDevices.length - 1 : 0} />
                <Stat dot="bg-danger" label="Failed" value={progress === 100 ? 1 : 0} />
                <Stat dot="bg-warning animate-pulse" label="Running" value={running ? selectedDevices.length : 0} />
                <Stat dot="bg-muted-foreground" label="Queued" value={running ? 0 : 0} />
              </div>
            </CardContent>
          </Card>

          {/* Per-device live grid */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Live Device Grid</CardTitle>
              <CardDescription>Real-time execution status for each selected device.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto scrollbar-thin">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground"><th className="px-5 py-3 font-medium">Device</th><th className="px-5 py-3 font-medium">Platform</th><th className="px-5 py-3 font-medium">Test case</th><th className="px-5 py-3 font-medium">Status</th><th className="px-5 py-3 font-medium">Step</th></tr></thead>
                  <tbody>
                    {selectedDevices.map((deviceId, index) => {
                      const device = mobileDevices.find((d) => d.id === deviceId)!;
                      const stepProgress = Math.min(100, Math.round(progress - index * 12));
                      const isDone = stepProgress >= 100;
                      const isFailed = isDone && index === selectedDevices.length - 1;
                      return (
                        <tr key={deviceId} className="border-b border-border/60 last:border-0">
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{device.platform === "iOS" ? "🍎" : "🤖"}</span>
                              <div><p className="font-medium">{device.name}</p><p className="font-mono text-xs text-muted-foreground">{device.os}</p></div>
                            </div>
                          </td>
                          <td className="px-5 py-3"><Badge variant={device.platform === "iOS" ? "info" : "success"}>{device.platform}</Badge></td>
                          <td className="px-5 py-3 font-mono text-xs text-primary">{selectedCase}</td>
                          <td className="px-5 py-3">
                            <span className={cn("flex items-center gap-2 font-medium", isFailed ? "text-danger" : isDone ? "text-success" : "text-warning")}>
                              <span className={cn("size-2 rounded-full", isFailed ? "bg-danger" : isDone ? "bg-success" : "bg-warning animate-pulse")} />
                              {isFailed ? "Failed" : isDone ? "Passed" : "Running"}
                            </span>
                          </td>
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-2">
                              <Progress value={Math.max(0, stepProgress)} className="w-24" indicatorClassName={isFailed ? "bg-danger" : "bg-success"} />
                              <span className="text-xs text-muted-foreground">{Math.max(0, Math.min(100, stepProgress))}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Device preview grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {selectedDevices.slice(0, 4).map((deviceId, index) => {
              const device = mobileDevices.find((d) => d.id === deviceId)!;
              const isDone = progress >= 100;
              const isFailed = isDone && index === selectedDevices.length - 1;
              return (
                <Card key={deviceId} className={cn("overflow-hidden border", isFailed ? "border-danger/30" : isDone ? "border-success/25" : "border-primary/25")}>
                  <CardHeader className="p-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold">{device.name}</p>
                      <Badge variant={device.platform === "iOS" ? "info" : "success"} className="text-[10px]">{device.platform}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-3 pt-0">
                    <PhoneMockup platform={device.platform} running={running && !progress || progress < 90} failed={isFailed && progress >= 100} />
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Step 3 — Fill username</span>
                        {isFailed && progress >= 100 ? <span className="text-danger">Failed</span> : <span className="text-success">OK</span>}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {progress === 100 && (
            <Card className="border-primary/25 bg-primary/5">
              <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
                <p className="font-medium">Execution complete — view detailed results and artifacts</p>
                <Button variant="gradient" onClick={() => setTab("results")}><Layers3 className="size-4" /> View Results</Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* ─── RESULTS ─── */}
      {tab === "results" && (
        <div className="space-y-6">
          {/* Summary */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <Kpi label="Total runs" value={mobileTestRuns.length.toString()} tone="text-primary" icon={Smartphone} />
            <Kpi label="Passed" value={mobileTestRuns.filter((r) => r.status === "Passed").length.toString()} tone="text-success" icon={CheckCircle2} />
            <Kpi label="Failed" value={mobileTestRuns.filter((r) => r.status === "Failed").length.toString()} tone="text-danger" icon={AlertCircle} />
            <Kpi label="AI Healed" value={mobileTestRuns.filter((r) => r.selfHealed).length.toString()} tone="text-fuchsia-400" icon={Zap} />
          </div>

          {/* Results table */}
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">Mobile Test Results</CardTitle>
                <CardDescription>Results with device, platform, duration, self-healing, and captured artifacts.</CardDescription>
              </div>
              <Button size="sm" variant="outline" onClick={() => toast({ title: "Downloading mobile report", variant: "info" })}><Download className="size-3.5" /> Export</Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto scrollbar-thin">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground"><th className="px-5 py-3 font-medium">Test</th><th className="px-5 py-3 font-medium">Device</th><th className="px-5 py-3 font-medium">Platform</th><th className="px-5 py-3 font-medium">Status</th><th className="px-5 py-3 font-medium">Duration</th><th className="px-5 py-3 font-medium">AI Healing</th><th className="px-5 py-3 font-medium">Artifacts</th></tr></thead>
                  <tbody>
                    {mobileTestRuns.map((run) => (
                      <tr key={run.id} className="border-b border-border/60 last:border-0 hover:bg-accent/40">
                        <td className="px-5 py-3">
                          <p className="font-mono text-xs text-primary">{run.testCaseId}</p>
                          <p className="mt-0.5 font-medium">{run.testTitle}</p>
                        </td>
                        <td className="px-5 py-3">
                          <span className="mr-1">{run.platform === "iOS" ? "🍎" : "🤖"}</span>
                          {run.deviceName}
                        </td>
                        <td className="px-5 py-3"><Badge variant={run.platform === "iOS" ? "info" : "success"}>{run.platform}</Badge></td>
                        <td className="px-5 py-3"><StatusPill status={run.status} /></td>
                        <td className="px-5 py-3 font-mono text-xs">{run.duration}</td>
                        <td className="px-5 py-3">{run.selfHealed ? <Badge variant="success"><Zap className="size-3" /> Self-healed</Badge> : <span className="text-xs text-muted-foreground">—</span>}</td>
                        <td className="px-5 py-3">
                          <div className="flex gap-1.5">
                            {run.artifacts.includes("screenshot") && <span title="Screenshot"><Image className="size-4 text-sky-400" /></span>}
                            {run.artifacts.includes("video") && <span title="Video"><FileVideo2 className="size-4 text-fuchsia-400" /></span>}
                            {run.artifacts.includes("device_log") && <span title="Device log"><FileJson2 className="size-4 text-emerald-400" /></span>}
                            {run.artifacts.includes("crash_log") && <span title="Crash log"><AlertCircle className="size-4 text-danger" /></span>}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Platform split chart */}
          <div className="grid gap-6 md:grid-cols-2">
            <PlatformResultsCard platform="iOS" runs={mobileTestRuns.filter((r) => r.platform === "iOS")} />
            <PlatformResultsCard platform="Android" runs={mobileTestRuns.filter((r) => r.platform === "Android")} />
          </div>

          {/* Failed test detail */}
          {mobileTestRuns.filter((r) => r.status === "Failed").map((run) => (
            <Card key={run.id} className="border-danger/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base text-danger"><AlertCircle className="size-4" /> Failure Detail — {run.id}</CardTitle>
                <CardDescription>{run.testTitle} · {run.deviceName} · {run.platform}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-xl border border-danger/30 bg-danger/5 p-4">
                  <p className="text-sm font-medium text-danger">Element not found · Appium locator</p>
                  <code className="mt-2 block rounded bg-background p-2 font-mono text-xs">driver.find_element(AppiumBy.ACCESSIBILITY_ID, "checkout-button")</code>
                  <p className="mt-2 text-xs text-muted-foreground">The accessibility ID was removed during the iOS redesign. AI identified a role-based replacement with 97% confidence.</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <ArtifactCard icon={Image} label="Screenshot" value="checkout-failure.png" tone="text-sky-400" />
                  <ArtifactCard icon={FileVideo2} label="Screen recording" value="rec-ios-tc045.mp4" tone="text-fuchsia-400" />
                  <ArtifactCard icon={AlertCircle} label="Crash log" value="ios-crash.log" tone="text-danger" />
                </div>
                <div className="rounded-xl border border-success/25 bg-success/5 p-4">
                  <p className="flex items-center gap-2 text-sm font-medium text-success"><Zap className="size-4" /> AI Healing suggestion</p>
                  <code className="mt-2 block rounded bg-background p-2 font-mono text-xs">driver.find_element(AppiumBy.ACCESSIBILITY_ID, "btn_checkout")</code>
                  <p className="mt-2 text-xs text-muted-foreground">Confidence: 97% · Apply and re-run on {run.deviceName}</p>
                  <Button variant="success" size="sm" className="mt-3" onClick={() => toast({ title: "Healing applied", description: "AI locator fix applied to iOS scripts.", variant: "success" })}><Zap className="size-3.5" /> Apply fix & re-run</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Sub-components ── */

function ScriptCard({ platform, testCase, language, onCopy }: { platform: "iOS" | "Android"; testCase: ReturnType<typeof testCases[0]["variables"]["map"]> extends (infer T)[] ? { variables: T[]; id: string; title: string } : never; language: "python" | "java" | "typescript"; onCopy: () => void }) {
  const tc = testCase as { variables: { variableId: string; name: string; type: string; source: string }[]; id: string; title: string };
  const names = tc.variables.map((v) => v.name);
  const bindings = language === "java"
    ? names.map((n) => `String ${n} = (String) data.get("${n}");`).join("\n")
    : names.map((n) => `${n} = data["${n}"]`).join("\n");
  const actions = [
    "driver.find_element(AppiumBy.ACCESSIBILITY_ID, 'username').send_keys(" + names.includes("username") ? "username" : "''" + ")",
    names.includes("password") ? `driver.find_element(AppiumBy.ACCESSIBILITY_ID, 'password').send_keys(password)` : "",
    names.includes("product_name") ? `driver.find_element(AppiumBy.ACCESSIBILITY_ID, 'search').send_keys(product_name)` : "",
  ].filter(Boolean).join("\n");
  const platformCap = platform === "iOS"
    ? `capabilities = {\n  "platformName": "iOS",\n  "appium:deviceName": "iPhone 15 Pro",\n  "appium:platformVersion": "17.4",\n  "appium:automationName": "XCUITest",\n  "appium:app": "/path/to/app.ipa",\n}`
    : `capabilities = {\n  "platformName": "Android",\n  "appium:deviceName": "Samsung Galaxy S24 Ultra",\n  "appium:platformVersion": "14",\n  "appium:automationName": "UiAutomator2",\n  "appium:app": "/path/to/app.apk",\n}`;
  const code = `# Canonical variable registry: ${tc.variables.map((v) => `${v.variableId} → ${v.name}`).join(", ")}
# Generated by QA Agent · ${platform} · Appium 2.x

from appium import webdriver
from appium.webdriver.common.appiumby import AppiumBy
from test_data import reserve_test_data

${platformCap}

driver = webdriver.Remote("http://localhost:4723", capabilities)

with reserve_test_data("${tc.id}", mask_logs=True) as data:
${bindings.split("\n").map((l) => "    " + l).join("\n")}

    # ${tc.id}: ${tc.title}
${actions.split("\n").map((l) => "    " + l).join("\n")}

driver.quit()`;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex-row items-center justify-between border-b border-border p-4">
        <CardTitle className="flex items-center gap-2 text-sm">
          <span className="text-lg">{platform === "iOS" ? "🍎" : "🤖"}</span>
          {platform} · Appium 2.x
          <Badge variant={platform === "iOS" ? "info" : "success"}>Python</Badge>
        </CardTitle>
        <Button size="sm" variant="ghost" onClick={onCopy}><Copy className="size-3.5" /> Copy</Button>
      </CardHeader>
      <CodeEditor value={code} language="python" />
    </Card>
  );
}

function PhoneMockup({ platform, running, failed }: { platform: "iOS" | "Android"; running: boolean; failed: boolean }) {
  return (
    <div className={cn("mx-auto w-24 rounded-xl border-4 p-1.5", platform === "iOS" ? "border-slate-600 bg-slate-800" : "border-slate-500 bg-slate-700")}>
      <div className="h-36 rounded-lg bg-slate-900 p-2">
        <div className={cn("mb-2 h-4 w-12 rounded bg-slate-700 mx-auto")} />
        {failed ? (
          <div className="mt-4 text-center text-[10px] text-danger">❌ Failed</div>
        ) : running ? (
          <div className="space-y-1 mt-2">
            <div className="h-2 w-full animate-pulse rounded bg-primary/40" />
            <div className="h-2 w-3/4 animate-pulse rounded bg-primary/30" />
            <div className="h-2 w-2/4 animate-pulse rounded bg-primary/20" />
          </div>
        ) : (
          <div className="mt-4 text-center text-[10px] text-success">✓ Passed</div>
        )}
      </div>
    </div>
  );
}

function PlatformResultsCard({ platform, runs }: { platform: "iOS" | "Android"; runs: typeof mobileTestRuns }) {
  const passed = runs.filter((r) => r.status === "Passed").length;
  const total = runs.length;
  const pct = total ? Math.round((passed / total) * 100) : 0;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <span className="text-xl">{platform === "iOS" ? "🍎" : "🤖"}</span>
          {platform} Results
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-5">
          <div className="relative flex size-24 items-center justify-center rounded-full border-8" style={{ borderColor: pct === 100 ? "#22c55e" : "#ef4444" }}>
            <div className="text-center"><span className="text-xl font-bold">{pct}%</span><span className="block text-[10px] text-muted-foreground">pass rate</span></div>
          </div>
          <div className="space-y-2">
            {runs.map((run) => (
              <div key={run.id} className="flex items-center gap-2 text-sm">
                <span className={cn("size-2 rounded-full", run.status === "Passed" ? "bg-success" : run.status === "Failed" ? "bg-danger" : "bg-muted-foreground")} />
                <span className="font-mono text-xs">{run.testCaseId}</span>
                <span className="text-muted-foreground">{run.deviceName}</span>
                <span className="font-mono text-xs">{run.duration}</span>
                {run.selfHealed && <Zap className="size-3 text-fuchsia-400" />}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function Kpi({ label, value, tone, icon: Icon }: { label: string; value: string; tone: string; icon: typeof Smartphone }) {
  return <Card><CardContent className="p-5"><Icon className={cn("size-5", tone)} /><p className={cn("mt-2 text-3xl font-semibold", tone)}>{value}</p><p className="mt-1 text-sm text-muted-foreground">{label}</p></CardContent></Card>;
}

function Stat({ dot, label, value }: { dot: string; label: string; value: number }) {
  return <div className="flex items-center gap-2 rounded-lg border border-border bg-secondary/30 px-3 py-2"><span className={cn("size-2.5 rounded-full", dot)} /><div><p className="text-xs text-muted-foreground">{label}</p><p className="text-sm font-semibold tabular-nums">{value}</p></div></div>;
}

function ArtifactCard({ icon: Icon, label, value, tone }: { icon: typeof Image; label: string; value: string; tone: string }) {
  return <div className="flex items-center gap-3 rounded-xl border border-border bg-secondary/20 p-3"><Icon className={cn("size-5 shrink-0", tone)} /><div><p className="text-xs text-muted-foreground">{label}</p><p className="text-sm font-medium">{value}</p></div></div>;
}
