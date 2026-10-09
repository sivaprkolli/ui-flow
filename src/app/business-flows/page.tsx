"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2, CircleStop, Clock3, FileVideo2, GitBranch, Globe2, Image,
  Layers3, ListPlus, MonitorPlay, Network, Pause, Play, Plus, Save, ShieldCheck,
  Sparkles, TerminalSquare, WandSparkles,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusPill } from "@/components/ui/status-pill";
import { useToast } from "@/components/ui/toast";
import { CapturedInteractionsToTestSteps } from "@/components/recorder/captured-interactions-to-test-steps";
import { saveRecordedStepDrafts, type RecordedInteraction } from "@/lib/recorded-step-drafts";
import { businessFlows, requirements, scenarios, testCases, type BusinessFlowRecord } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

type MappingType = "requirement" | "scenario";

const standardArtifacts = [
  { icon: Image, label: "Screenshots", value: "8 captures", tone: "text-sky-400" },
  { icon: FileVideo2, label: "Session video", value: "1 recording", tone: "text-fuchsia-400" },
  { icon: MonitorPlay, label: "Trace", value: "1 trace.zip", tone: "text-primary" },
  { icon: Network, label: "Network", value: "24 requests", tone: "text-emerald-400" },
  { icon: TerminalSquare, label: "Console", value: "0 errors", tone: "text-warning" },
];

const starterMilestones = [
  { id: 1, time: "00:00", title: "Journey started", detail: "QA application opened" },
  { id: 2, time: "00:08", title: "Authentication complete", detail: "User session established" },
  { id: 3, time: "00:16", title: "Product discovery", detail: "Search result selected" },
  { id: 4, time: "00:22", title: "Business outcome reached", detail: "Product details visible" },
];

const initialInteractions: RecordedInteraction[] = [
  { id: 1, time: "00:00", action: "Navigate", target: "Customer entry page", selector: "page.goto(base_url)", testStep: "Navigate to {{base_url}}", artifacts: 3 },
  { id: 2, time: "00:08", action: "Authenticate", target: "Customer login", selector: "getByRole('button', { name: 'Login' })", testStep: "Authenticate with canonical customer credentials", artifacts: 4 },
  { id: 3, time: "00:16", action: "Search", target: "Product discovery", selector: "getByPlaceholder('Search')", testStep: "Search for {{product_name}}", artifacts: 3 },
  { id: 4, time: "00:22", action: "Verify", target: "Product details", selector: "getByText('Product details')", testStep: "Verify product details are displayed", artifacts: 4 },
];

export default function BusinessFlowsPage() {
  const { toast } = useToast();
  const [flowName, setFlowName] = useState("Customer Login and Product Discovery");
  const [description, setDescription] = useState("A customer signs in and discovers a product through search.");
  const [mappingType, setMappingType] = useState<MappingType>("requirement");
  const [mappingId, setMappingId] = useState("JIRA-1245");
  const [environment, setEnvironment] = useState<BusinessFlowRecord["environment"]>("QA");
  const [recording, setRecording] = useState(false);
  const [paused, setPaused] = useState(false);
  const [elapsed, setElapsed] = useState(22);
  const [milestones, setMilestones] = useState(starterMilestones);
  const [interactions, setInteractions] = useState<RecordedInteraction[]>(initialInteractions);
  const [flows, setFlows] = useState(businessFlows);

  useEffect(() => {
    if (!recording || paused) return;
    const timer = window.setInterval(() => setElapsed((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, [recording, paused]);

  const options = mappingType === "requirement" ? requirements : scenarios;
  const mappedEntity = options.find((item) => item.id === mappingId) ?? options[0];
  const targetTestCase = testCases.find((testCase) => mappingType === "scenario" ? testCase.scenario === mappingId : testCase.requirement === mappingId) ?? testCases[0];
  const formatted = `${String(Math.floor(elapsed / 60)).padStart(2, "0")}:${String(elapsed % 60).padStart(2, "0")}`;
  const validation = [!flowName.trim() ? "Business flow name is required." : "", !mappingId ? "Map the flow to a requirement/Jira ID or test scenario." : ""].filter(Boolean);

  const setType = (type: MappingType) => {
    setMappingType(type);
    setMappingId(type === "requirement" ? "JIRA-1245" : "TS-001");
  };
  const start = () => {
    if (validation.length) { toast({ title: "Cannot start recording", description: validation[0], variant: "error" }); return; }
    setRecording(true); setPaused(false); setElapsed(0);
    toast({ title: "Business flow recording started", description: `${flowName} is linked to ${mappingId}.`, variant: "info" });
  };
  const addMilestone = () => {
    const id = Date.now();
    setMilestones((current) => [...current, { id, time: formatted, title: `Business milestone ${current.length + 1}`, detail: "User-marked flow checkpoint" }]);
    setInteractions((current) => [...current, { id, time: formatted, action: "Milestone", target: `Business outcome ${current.length + 1}`, selector: "businessFlow.markMilestone()", testStep: "Verify the recorded business outcome", artifacts: 3 }]);
    toast({ title: "Business milestone added", description: "A recorder marker and supporting artifacts were captured.", variant: "success" });
  };
  const stop = () => {
    setRecording(false); setPaused(false);
    toast({ title: "Business flow capture completed", description: `${milestones.length} milestones and ${standardArtifacts.length} artifact categories are ready for review.`, variant: "success" });
  };
  const save = () => {
    if (validation.length) { toast({ title: "Cannot save business flow", description: validation[0], variant: "error" }); return; }
    const flow: BusinessFlowRecord = { id: `FLOW-${String(flows.length + 1).padStart(3, "0")}`, name: flowName, description, mappingType, mappingId, mappingTitle: mappedEntity.title, environment, status: recording ? "Draft" : "Recorded", steps: milestones.length, artifacts: 14, updatedAt: "Just now" };
    setFlows((current) => [flow, ...current]);
    toast({ title: "Business flow saved", description: `${flow.id} is mapped to ${flow.mappingId}.`, variant: "success" });
  };

  return <div className="space-y-6">
    <PageHeader title="Business Flow Recorder" description="Capture reusable business journeys and map each flow to a Jira requirement or approved test scenario." icon={<GitBranch className="size-5" />} actions={<><Button variant="secondary" onClick={() => toast({ title: "Business flow library", description: `${flows.length} saved flows available.`, variant: "info" })}><Layers3 className="size-4" /> Flow Library</Button><Button variant="gradient" onClick={save}><Save className="size-4" /> Save Business Flow</Button></>} />

    <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
      <div className="space-y-6">
        <Card className="border-primary/25 bg-gradient-to-r from-primary/8 via-card to-fuchsia-500/5"><CardHeader><CardTitle className="flex items-center gap-2 text-base"><GitBranch className="size-4 text-primary" /> Business Flow Definition</CardTitle><CardDescription>Name the user journey, describe the business outcome, and map it before capture.</CardDescription></CardHeader><CardContent className="grid gap-4 md:grid-cols-2"><Field label="Business flow name" value={flowName} onChange={setFlowName} placeholder="e.g. Customer Login and Product Discovery" /><SelectBox label="Environment" value={environment} onChange={(value) => setEnvironment(value as BusinessFlowRecord["environment"])} options={["QA", "UAT", "Staging", "Local"]} /><label className="md:col-span-2"><span className="mb-1.5 block text-sm font-medium">Business outcome</span><textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={2} className="w-full resize-none rounded-lg border border-border bg-secondary/20 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" /></label></CardContent></Card>

        <Card><CardHeader><CardTitle className="flex items-center gap-2 text-base"><Layers3 className="size-4 text-primary" /> Mapping</CardTitle><CardDescription>Each saved business flow must link to one requirement/Jira ID or test scenario.</CardDescription></CardHeader><CardContent><div className="flex rounded-lg bg-secondary/60 p-1"><MappingButton active={mappingType === "requirement"} onClick={() => setType("requirement")} label="Requirement / Jira ID" detail="Business need or Jira story" /><MappingButton active={mappingType === "scenario"} onClick={() => setType("scenario")} label="Test Scenario" detail="Approved test journey" /></div><div className="mt-4 grid gap-4 md:grid-cols-[1fr_auto]"><SelectBox label={mappingType === "requirement" ? "Jira requirement" : "Test scenario"} value={mappingId} onChange={setMappingId} options={options.map((item) => item.id)} /><div className="rounded-lg border border-border bg-secondary/20 p-3"><p className="text-xs text-muted-foreground">Mapped item</p><p className="mt-1 font-mono text-xs text-primary">{mappedEntity.id}</p><p className="mt-0.5 text-sm font-medium">{mappedEntity.title}</p></div></div><div className="mt-4 flex items-center gap-2 rounded-lg border border-success/25 bg-success/5 p-3 text-sm text-success"><CheckCircle2 className="size-4" /> Flow mapping is required for traceability and coverage reporting.</div></CardContent></Card>

        <Card className={cn("overflow-hidden border", recording ? "border-danger/40" : "border-primary/25")}><div className="flex flex-wrap items-center justify-between gap-4 bg-gradient-to-r from-primary/10 via-card to-fuchsia-500/5 p-5"><div className="flex items-center gap-3"><div className={cn("relative flex size-12 items-center justify-center rounded-xl text-white", recording ? "bg-danger" : "bg-gradient-to-br from-primary to-fuchsia-500")}><GitBranch className="size-6" />{recording && <span className="absolute -right-1 -top-1 flex size-3"><span className="absolute inline-flex size-full animate-ping rounded-full bg-danger" /><span className="relative inline-flex size-3 rounded-full bg-danger ring-2 ring-card" /></span>}</div><div><p className="text-sm font-semibold">{recording ? paused ? "Business flow recording paused" : "Business flow recording active" : "Ready to capture business journey"}</p><p className="text-xs text-muted-foreground">{environment} · {mappingId} · {formatted}</p></div></div><div className="flex flex-wrap gap-2">{recording ? <><Button variant="secondary" onClick={() => setPaused((value) => !value)}>{paused ? <Play className="size-4" /> : <Pause className="size-4" />}{paused ? "Resume" : "Pause"}</Button><Button variant="secondary" onClick={addMilestone}><ListPlus className="size-4" /> Mark Milestone</Button><Button variant="danger" onClick={stop}><CircleStop className="size-4" /> Stop Capture</Button></> : <Button variant="gradient" onClick={start}><Play className="size-4" /> Start Business Flow</Button>}</div></div>
          <CardContent className="p-0"><div className="grid lg:grid-cols-[1fr_270px]"><div className="p-5"><div className="flex items-center justify-between"><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Journey capture</p><Badge variant={recording ? "danger" : "secondary"}>{recording ? "Live" : "Draft"}</Badge></div><div className="mt-3 flex min-h-64 items-center justify-center rounded-xl border border-border bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 p-8 text-center"><div><div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-primary/20 text-primary"><WandSparkles className="size-6" /></div><p className="mt-3 text-sm font-semibold text-white">{flowName || "Unnamed business flow"}</p><p className="mt-1 text-xs text-slate-400">{recording ? "Capturing user actions as business milestones…" : "Start recording to capture a reusable business journey."}</p><div className="mt-5 flex flex-wrap justify-center gap-1.5"><Badge variant="secondary">{mappingId}</Badge><Badge variant="secondary">{milestones.length} milestones</Badge><Badge variant="secondary">14 artifacts</Badge></div></div></div></div><div className="border-t border-border bg-secondary/20 p-5 lg:border-l lg:border-t-0"><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Automatic evidence</p><div className="mt-3 space-y-2">{standardArtifacts.slice(0, 3).map((artifact) => <div key={artifact.label} className="flex items-center gap-2 rounded-lg border border-border bg-card p-2.5"><artifact.icon className={cn("size-4", artifact.tone)} /><div><p className="text-xs font-medium">{artifact.label}</p><p className="text-[11px] text-muted-foreground">{artifact.value}</p></div></div>)}</div><div className="mt-4 rounded-lg border border-success/25 bg-success/5 p-3 text-xs text-success"><ShieldCheck className="mr-1 inline size-3.5" /> Business-flow evidence is stored with its mapping.</div></div></div></CardContent></Card>

        <Card><CardHeader className="flex-row items-center justify-between"><div><CardTitle className="text-base">Business Milestones</CardTitle><CardDescription>Record meaningful user outcomes instead of low-level test actions.</CardDescription></div><Badge variant="secondary">{milestones.length} milestones</Badge></CardHeader><CardContent><div className="space-y-2">{milestones.map((milestone, index) => <div key={milestone.id} className="flex items-start gap-3 rounded-xl border border-border bg-secondary/20 p-3"><span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">{index + 1}</span><div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-2"><p className="text-sm font-medium">{milestone.title}</p><span className="font-mono text-[11px] text-muted-foreground">{milestone.time}</span></div><p className="mt-0.5 text-xs text-muted-foreground">{milestone.detail}</p></div><Badge variant="success"><CheckCircle2 className="size-3" /> Captured</Badge></div>)}</div></CardContent></Card>
        <CapturedInteractionsToTestSteps interactions={interactions} targetLabel={targetTestCase.id} targetDescription={`${targetTestCase.title} · mapped from ${mappingId}`} onFeed={(selected) => { saveRecordedStepDrafts(targetTestCase.id, "business_flow", selected); toast({ title: "Business flow steps drafted", description: `${selected.length} interactions were sent to ${targetTestCase.id}.`, variant: "success" }); }} />
      </div>

      <aside className="space-y-6"><Card><CardHeader><CardTitle className="flex items-center gap-2 text-base"><ShieldCheck className="size-4 text-primary" /> Flow Review</CardTitle><CardDescription>Save only when the journey has a clear business outcome and mapping.</CardDescription></CardHeader><CardContent className="space-y-3"><Review label="Flow name" value={flowName || "Missing"} good={!!flowName.trim()} /><Review label="Mapping" value={`${mappingId} · ${mappedEntity.title}`} good={!!mappingId} /><Review label="Environment" value={environment} good /><Review label="Milestones" value={`${milestones.length} captured`} good={milestones.length > 0} />{validation.length ? <div className="rounded-lg border border-danger/30 bg-danger/5 p-3 text-xs text-danger">{validation[0]}</div> : <div className="rounded-lg border border-success/25 bg-success/5 p-3 text-xs text-success"><CheckCircle2 className="mr-1 inline size-3.5" /> Ready to save as a mapped business flow.</div>}<Button variant="gradient" className="w-full" onClick={save}><Save className="size-4" /> Save Business Flow</Button></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-base">Captured Artifacts</CardTitle></CardHeader><CardContent className="space-y-2">{standardArtifacts.map((artifact) => <div key={artifact.label} className="flex items-center justify-between rounded-lg border border-border bg-secondary/20 px-3 py-2"><span className="flex items-center gap-2 text-sm"><artifact.icon className={cn("size-4", artifact.tone)} />{artifact.label}</span><span className="text-xs text-muted-foreground">{artifact.value}</span></div>)}</CardContent></Card>
        <Card><CardHeader><CardTitle className="text-base">Saved Business Flows</CardTitle><CardDescription>Reusable journeys with traceable links.</CardDescription></CardHeader><CardContent className="space-y-2">{flows.slice(0, 4).map((flow) => <button key={flow.id} onClick={() => { setFlowName(flow.name); setDescription(flow.description); setMappingType(flow.mappingType); setMappingId(flow.mappingId); setEnvironment(flow.environment); }} className="flex w-full items-center justify-between rounded-lg border border-border bg-secondary/20 p-3 text-left hover:bg-accent"><div><p className="font-mono text-[11px] text-primary">{flow.id} · {flow.mappingId}</p><p className="mt-0.5 text-sm font-medium">{flow.name}</p><p className="text-xs text-muted-foreground">{flow.steps} milestones · {flow.artifacts} artifacts</p></div><StatusPill status={flow.status} /></button>)}</CardContent></Card></aside>
    </div>
  </div>;
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder: string }) { return <label><span className="mb-1.5 block text-sm font-medium">{label}</span><input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="h-10 w-full rounded-lg border border-border bg-secondary/20 px-3 text-sm outline-none focus:ring-2 focus:ring-ring" /></label>; }
function SelectBox({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: string[] }) { return <label><span className="mb-1.5 block text-sm font-medium">{label}</span><select value={value} onChange={(event) => onChange(event.target.value)} className="h-10 w-full rounded-lg border border-border bg-secondary/20 px-3 text-sm outline-none focus:ring-2 focus:ring-ring">{options.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>; }
function MappingButton({ active, onClick, label, detail }: { active: boolean; onClick: () => void; label: string; detail: string }) { return <button onClick={onClick} className={cn("flex-1 rounded-md px-3 py-2 text-left", active ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground")}><p className="text-sm font-medium">{label}</p><p className="text-[11px] text-muted-foreground">{detail}</p></button>; }
function Review({ label, value, good }: { label: string; value: string; good: boolean }) { return <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-secondary/20 px-3 py-2"><div><p className="text-xs text-muted-foreground">{label}</p><p className="max-w-[180px] truncate text-sm font-medium">{value}</p></div>{good ? <CheckCircle2 className="size-4 shrink-0 text-success" /> : <span className="size-2 rounded-full bg-danger" />}</div>; }
