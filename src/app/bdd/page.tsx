"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Braces, CheckCircle2, ChevronDown, CircleAlert, Code2, FileCheck2, FlaskConical,
  Plus, Play, Save, Sparkles, Trash2, Upload, WandSparkles,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { testCases } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

type Keyword = "Given" | "When" | "Then" | "And" | "But";
type ScenarioMode = "scenario" | "outline";
interface BddStep { id: number; keyword: Keyword; text: string; }
interface ExampleRow { id: number; username: string; password: string; product_name: string; }

const keywordColors: Record<Keyword, string> = {
  Given: "text-sky-400", When: "text-primary", Then: "text-success", And: "text-fuchsia-400", But: "text-warning",
};

const initialSteps: BddStep[] = [
  { id: 1, keyword: "Given", text: "I navigate to {{base_url}}" },
  { id: 2, keyword: "When", text: "I enter {{username}}" },
  { id: 3, keyword: "And", text: "I enter {{password}}" },
  { id: 4, keyword: "And", text: "I click Login" },
  { id: 5, keyword: "Then", text: "I search for {{product_name}}" },
];

export default function BddBuilderPage() {
  const router = useRouter();
  const { toast } = useToast();
  const sourceCase = testCases[0];
  const [featureName, setFeatureName] = useState("User authentication and product search");
  const [scenarioName, setScenarioName] = useState("Login successfully and search for a product");
  const [requirement, setRequirement] = useState(sourceCase.requirement);
  const [environment, setEnvironment] = useState("QA");
  const [mode, setMode] = useState<ScenarioMode>("scenario");
  const [tags, setTags] = useState(["smoke", "authentication", "TC-001"]);
  const [tagInput, setTagInput] = useState("");
  const [backgroundEnabled, setBackgroundEnabled] = useState(true);
  const [backgroundSteps, setBackgroundSteps] = useState<BddStep[]>([{ id: 101, keyword: "Given", text: "the QA environment is available" }]);
  const [steps, setSteps] = useState<BddStep[]>(initialSteps);
  const [selectedStep, setSelectedStep] = useState(0);
  const [examples, setExamples] = useState<ExampleRow[]>([
    { id: 1, username: "qa_user_01", password: "••••••••", product_name: "Wireless Headphones" },
    { id: 2, username: "qa_user_02", password: "••••••••", product_name: "USB-C Hub" },
  ]);

  const variableNames = sourceCase.variables.map((variable) => variable.name);
  const invalidReferences = useMemo(() => {
    const references = steps.flatMap((step) => Array.from(step.text.matchAll(/{{\s*([\w_]+)\s*}}/g)).map((match) => match[1]));
    return references.filter((reference) => !variableNames.includes(reference));
  }, [steps, variableNames]);
  const issues = [
    !featureName.trim() ? "Feature name is required." : "",
    !scenarioName.trim() ? "Scenario name is required." : "",
    steps.some((step) => !step.text.trim()) ? "Every scenario step needs text." : "",
    invalidReferences.length ? `Undefined canonical variable(s): ${Array.from(new Set(invalidReferences)).join(", ")}.` : "",
    mode === "outline" && !examples.length ? "Scenario Outline requires at least one examples row." : "",
  ].filter(Boolean);

  const feature = buildFeature({ featureName, scenarioName, requirement, environment, mode, tags, backgroundEnabled, backgroundSteps, steps, examples });

  const addTag = () => {
    const tag = tagInput.trim().replace(/^@/, "").replace(/\s+/g, "_");
    if (tag && !tags.includes(tag)) setTags((current) => [...current, tag]);
    setTagInput("");
  };
  const updateStep = (id: number, patch: Partial<BddStep>, background = false) => {
    const setter = background ? setBackgroundSteps : setSteps;
    setter((current) => current.map((step) => step.id === id ? { ...step, ...patch } : step));
  };
  const removeStep = (id: number, background = false) => {
    const setter = background ? setBackgroundSteps : setSteps;
    setter((current) => current.filter((step) => step.id !== id));
  };
  const addStep = (background = false) => {
    const setter = background ? setBackgroundSteps : setSteps;
    setter((current) => [...current, { id: Date.now(), keyword: background || !current.length ? "Given" : "And", text: "" }]);
  };
  const insertVariable = (name: string) => {
    const current = steps[selectedStep];
    if (!current) return;
    updateStep(current.id, { text: `${current.text}${current.text ? " " : ""}{{${name}}}` });
  };
  const validate = () => {
    if (issues.length) toast({ title: "BDD validation failed", description: issues[0], variant: "error" });
    else toast({ title: "BDD scenario valid", description: "Canonical variables, tags and scenario structure are ready.", variant: "success" });
  };

  return <div className="space-y-6">
    <PageHeader title="BDD Scenario Builder" description="Create Gherkin scenarios from canonical variables without renaming or duplicating test data." icon={<FileCheck2 className="size-5" />} actions={<><Button variant="secondary" onClick={() => toast({ title: "Imported TC-001", description: "Canonical variables and manual steps loaded.", variant: "info" })}><Upload className="size-4" /> Import Test Case</Button><Button variant="gradient" onClick={() => toast({ title: "BDD scenario saved", description: `${scenarioName} saved as a draft.`, variant: "success" })}><Save className="size-4" /> Save Scenario</Button></>} />

    <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
      <div className="space-y-6">
        <Card><CardHeader><CardTitle className="flex items-center gap-2 text-base"><FlaskConical className="size-4 text-primary" /> Feature & Scenario Details</CardTitle><CardDescription>Set feature-level metadata before authoring Gherkin steps.</CardDescription></CardHeader><CardContent className="grid gap-4 md:grid-cols-2"><Field label="Feature name" value={featureName} onChange={setFeatureName} placeholder="Feature name" /><Field label="Scenario name" value={scenarioName} onChange={setScenarioName} placeholder="Scenario name" /><SelectField label="Requirement" value={requirement} onChange={setRequirement} options={["JIRA-1245", "REQ-103", "JIRA-1251", "CONF-08"]} /><SelectField label="Environment" value={environment} onChange={setEnvironment} options={["QA", "UAT", "Staging", "Local"]} />
          <div className="md:col-span-2"><p className="mb-2 text-sm font-medium">Scenario type</p><div className="flex rounded-lg bg-secondary/60 p-1"><ModeButton active={mode === "scenario"} onClick={() => setMode("scenario")} label="Scenario" description="Single executable path" /><ModeButton active={mode === "outline"} onClick={() => setMode("outline")} label="Scenario Outline" description="Data-driven examples" /></div></div>
        </CardContent></Card>

        <Card><CardHeader className="flex-row items-center justify-between"><div><CardTitle className="text-base">Tags</CardTitle><CardDescription>Use tags for suites, ownership, risk, and execution filters.</CardDescription></div><Badge variant="secondary">{tags.length} tags</Badge></CardHeader><CardContent><div className="flex flex-wrap gap-2">{tags.map((tag) => <button key={tag} onClick={() => setTags((current) => current.filter((item) => item !== tag))} className="rounded-full bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-danger/10 hover:text-danger">@{tag} ×</button>)}<div className="flex min-w-52 flex-1 gap-2"><input value={tagInput} onChange={(event) => setTagInput(event.target.value)} onKeyDown={(event) => event.key === "Enter" && addTag()} placeholder="Add tag, e.g. regression" className="h-8 flex-1 rounded-md border border-border bg-background px-2 text-xs outline-none focus:ring-2 focus:ring-ring" /><Button size="sm" variant="outline" onClick={addTag}><Plus className="size-3.5" /> Add</Button></div></div></CardContent></Card>

        <StepSection title="Background" description="Optional preconditions that run before every scenario." enabled={backgroundEnabled} onToggle={() => setBackgroundEnabled((value) => !value)} steps={backgroundSteps} onUpdate={(id, patch) => updateStep(id, patch, true)} onRemove={(id) => removeStep(id, true)} onAdd={() => addStep(true)} />
        <StepSection title="Scenario Steps" description="Use Given, When, Then, And, and But. Insert canonical variables from the registry." steps={steps} onUpdate={(id, patch) => updateStep(id, patch)} onRemove={(id) => removeStep(id)} onAdd={() => addStep()} selectedStep={selectedStep} onSelectStep={setSelectedStep} />

        {mode === "outline" && <Card><CardHeader className="flex-row items-center justify-between"><div><CardTitle className="text-base">Examples</CardTitle><CardDescription>Data sets for this Scenario Outline. Headers use canonical names.</CardDescription></div><Button size="sm" variant="outline" onClick={() => setExamples((current) => [...current, { id: Date.now(), username: "", password: "••••••••", product_name: "" }])}><Plus className="size-3.5" /> Add row</Button></CardHeader><CardContent><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-border text-left text-xs uppercase text-muted-foreground"><th className="py-2 font-medium">username</th><th className="py-2 font-medium">password</th><th className="py-2 font-medium">product_name</th><th /></tr></thead><tbody>{examples.map((row) => <tr key={row.id} className="border-b border-border/60"><ExampleInput value={row.username} onChange={(value) => setExamples((current) => current.map((item) => item.id === row.id ? { ...item, username: value } : item))} /><ExampleInput value={row.password} onChange={(value) => setExamples((current) => current.map((item) => item.id === row.id ? { ...item, password: value } : item))} masked /><ExampleInput value={row.product_name} onChange={(value) => setExamples((current) => current.map((item) => item.id === row.id ? { ...item, product_name: value } : item))} /><td className="py-2 text-right"><button onClick={() => setExamples((current) => current.filter((item) => item.id !== row.id))} className="rounded p-1 text-muted-foreground hover:bg-danger/10 hover:text-danger"><Trash2 className="size-4" /></button></td></tr>)}</tbody></table></div></CardContent></Card>}
      </div>

      <aside className="space-y-6">
        <Card className="border-primary/25 bg-primary/5"><CardHeader><CardTitle className="flex items-center gap-2 text-base"><Braces className="size-4 text-primary" /> Canonical Variable Registry</CardTitle><CardDescription>Click a variable to insert it into the selected scenario step.</CardDescription></CardHeader><CardContent className="space-y-2">{sourceCase.variables.map((variable) => <button key={variable.variableId} onClick={() => insertVariable(variable.name)} className="w-full rounded-lg border border-border bg-card p-3 text-left hover:border-primary/50 hover:bg-primary/5"><div className="flex items-center justify-between gap-2"><span className="font-mono text-xs text-primary">{variable.variableId}</span><Badge variant={variable.mask ? "warning" : "secondary"}>{variable.type}</Badge></div><p className="mt-1 text-sm font-semibold">&#123;&#123;{variable.name}&#125;&#125;</p><p className="mt-0.5 text-xs text-muted-foreground">{variable.source}</p></button>)}<div className="rounded-lg border border-success/30 bg-success/5 p-3 text-xs text-success"><CheckCircle2 className="mr-1 inline size-3.5" /> Registry names are immutable; the builder never creates aliases.</div></CardContent></Card>
        <Card><CardHeader className="flex-row items-center justify-between"><CardTitle className="text-base">Validation</CardTitle><Badge variant={issues.length ? "danger" : "success"}>{issues.length ? `${issues.length} issue${issues.length === 1 ? "" : "s"}` : "Ready"}</Badge></CardHeader><CardContent className="space-y-2">{issues.length ? issues.map((issue) => <div key={issue} className="flex gap-2 rounded-lg border border-danger/30 bg-danger/5 p-3 text-xs text-danger"><CircleAlert className="size-4 shrink-0" />{issue}</div>) : <div className="flex gap-2 rounded-lg border border-success/30 bg-success/5 p-3 text-xs text-success"><CheckCircle2 className="size-4 shrink-0" />Feature, steps, examples and canonical references are valid.</div>}<Button className="w-full" variant="secondary" onClick={validate}><WandSparkles className="size-4" /> Validate BDD Scenario</Button></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-base">Actions</CardTitle></CardHeader><CardContent className="grid gap-2"><Button variant="gradient" disabled={issues.length > 0} onClick={() => router.push(`/automation?testCase=${sourceCase.id}&dataSet=${sourceCase.testDataSetIds[0]}`)}><Code2 className="size-4" /> Generate Cucumber Automation</Button><Button variant="secondary" disabled={issues.length > 0} onClick={() => toast({ title: "BDD execution started", description: `${environment} · ${scenarioName}`, variant: "success" })}><Play className="size-4" /> Run Scenario</Button><Button variant="outline" onClick={() => { setSteps(initialSteps); setExamples([]); toast({ title: "Builder reset", variant: "info" }); }}><Trash2 className="size-4" /> Reset Draft</Button></CardContent></Card>
      </aside>
    </div>

    <Card><CardHeader className="flex-row items-center justify-between"><div><CardTitle className="flex items-center gap-2 text-base"><FileCheck2 className="size-4 text-primary" /> Live Gherkin Preview</CardTitle><CardDescription>Generated from the current builder form. Only canonical variables are rendered.</CardDescription></div><Badge variant="secondary">{mode === "outline" ? "Scenario Outline" : "Scenario"}</Badge></CardHeader><CardContent><pre className="max-h-[520px] overflow-auto rounded-xl border border-border bg-secondary/20 p-5 font-mono text-xs leading-6 text-foreground scrollbar-thin">{feature}</pre></CardContent></Card>
  </div>;
}

function StepSection({ title, description, enabled = true, onToggle, steps, onUpdate, onRemove, onAdd, selectedStep, onSelectStep }: { title: string; description: string; enabled?: boolean; onToggle?: () => void; steps: BddStep[]; onUpdate: (id: number, patch: Partial<BddStep>) => void; onRemove: (id: number) => void; onAdd: () => void; selectedStep?: number; onSelectStep?: (index: number) => void; }) {
  return <Card><CardHeader className="flex-row items-center justify-between"><div><CardTitle className="text-base">{title}</CardTitle><CardDescription>{description}</CardDescription></div>{onToggle ? <Toggle on={enabled} onToggle={onToggle} /> : <Button size="sm" variant="outline" onClick={onAdd}><Plus className="size-3.5" /> Add Step</Button>}</CardHeader>{enabled && <CardContent className="space-y-2">{steps.map((step, index) => <div key={step.id} onClick={() => onSelectStep?.(index)} className={cn("flex items-center gap-2 rounded-lg border p-2 transition-colors", selectedStep === index ? "border-primary bg-primary/5" : "border-border bg-secondary/20")}><select value={step.keyword} onChange={(event) => onUpdate(step.id, { keyword: event.target.value as Keyword })} className={cn("w-20 bg-transparent text-xs font-semibold outline-none", keywordColors[step.keyword])}>{(["Given", "When", "Then", "And", "But"] as Keyword[]).map((keyword) => <option key={keyword} value={keyword}>{keyword}</option>)}</select><input value={step.text} onChange={(event) => onUpdate(step.id, { text: event.target.value })} placeholder="Describe the behavior..." className="h-8 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" /><button onClick={(event) => { event.stopPropagation(); onRemove(step.id); }} className="rounded p-1 text-muted-foreground hover:bg-danger/10 hover:text-danger"><Trash2 className="size-4" /></button></div>)}<Button size="sm" variant="outline" className="mt-1" onClick={onAdd}><Plus className="size-3.5" /> Add Step</Button></CardContent>}</Card>;
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder: string }) { return <label><span className="mb-1.5 block text-sm font-medium">{label}</span><input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="h-10 w-full rounded-lg border border-border bg-secondary/20 px-3 text-sm outline-none focus:ring-2 focus:ring-ring" /></label>; }
function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: string[] }) { return <label><span className="mb-1.5 block text-sm font-medium">{label}</span><div className="relative"><select value={value} onChange={(event) => onChange(event.target.value)} className="h-10 w-full appearance-none rounded-lg border border-border bg-secondary/20 px-3 text-sm outline-none focus:ring-2 focus:ring-ring">{options.map((option) => <option key={option}>{option}</option>)}</select><ChevronDown className="pointer-events-none absolute right-3 top-3 size-4 text-muted-foreground" /></div></label>; }
function ModeButton({ active, onClick, label, description }: { active: boolean; onClick: () => void; label: string; description: string }) { return <button onClick={onClick} className={cn("flex-1 rounded-md px-3 py-2 text-left", active ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground")}><p className="text-sm font-medium">{label}</p><p className="text-[11px] text-muted-foreground">{description}</p></button>; }
function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) { return <button onClick={onToggle} className={cn("relative h-6 w-11 rounded-full transition-colors", on ? "bg-primary" : "bg-secondary")}><span className={cn("absolute top-0.5 size-5 rounded-full bg-white transition-transform", on ? "translate-x-5" : "translate-x-0.5")} /></button>; }
function ExampleInput({ value, onChange, masked }: { value: string; onChange: (value: string) => void; masked?: boolean }) { return <td className="py-2 pr-2"><input value={value} type={masked ? "password" : "text"} onChange={(event) => onChange(event.target.value)} className="h-8 w-full rounded border border-border bg-secondary/20 px-2 text-xs outline-none focus:ring-2 focus:ring-ring" /></td>; }

function buildFeature({ featureName, scenarioName, requirement, environment, mode, tags, backgroundEnabled, backgroundSteps, steps, examples }: { featureName: string; scenarioName: string; requirement: string; environment: string; mode: ScenarioMode; tags: string[]; backgroundEnabled: boolean; backgroundSteps: BddStep[]; steps: BddStep[]; examples: ExampleRow[]; }) {
  const tagsLine = [...tags, requirement, environment].map((tag) => `@${tag.replace(/[^\w-]/g, "_")}`).join(" ");
  const renderSteps = (items: BddStep[]) => items.map((step) => `    ${step.keyword} ${mode === "outline" ? step.text.replace(/{{\s*([\w_]+)\s*}}/g, "<$1>") : step.text}`).join("\n");
  const background = backgroundEnabled && backgroundSteps.length ? `\n  Background:\n${renderSteps(backgroundSteps)}\n` : "";
  const examplesBlock = mode === "outline" ? `\n\n    Examples:\n      | username | password | product_name |\n${examples.map((row) => `      | ${row.username} | ${row.password} | ${row.product_name} |`).join("\n")}` : "";
  return `${tagsLine}\nFeature: ${featureName}\n  # Requirement: ${requirement} · Environment: ${environment}${background}\n  ${mode === "outline" ? "Scenario Outline" : "Scenario"}: ${scenarioName}\n${renderSteps(steps)}${examplesBlock}`;
}
