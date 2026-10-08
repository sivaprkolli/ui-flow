"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bot, Sparkles, Play, CheckCircle2, FileCode2, FolderTree, GitCommit, GitPullRequest, Database, ShieldCheck,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CrossPlatformScriptPanel } from "@/components/automation/cross-platform-script-panel";
import { GithubIntegration } from "@/components/automation/github-integration";
import { TestDataBinding } from "@/components/automation/test-data-binding";
import { validateCanonicalVariables } from "@/lib/canonical-variables";
import { useToast } from "@/components/ui/toast";
import { testCases, testDataGovernance, testDataSets } from "@/lib/mock-data";

const baseConfig = [
  { label: "Framework", value: "Playwright" },
  { label: "Language", value: "TypeScript" },
  { label: "Browser", value: "Chromium" },
  { label: "Environment", value: "QA" },
];
const insights = ["Stable locators", "Accessibility-based selectors", "No hard waits", "Typed data fixture", "Guaranteed cleanup", "Assertion coverage: 100%"];
const locatorStrategy = ["Role", "Label", "Test ID", "Text", "CSS fallback"];
const tree = [
  { name: "automation/", depth: 0, dir: true }, { name: "tests/", depth: 1, dir: true, count: "12 specs" },
  { name: "pages/", depth: 1, dir: true, count: "6 objects" }, { name: "fixtures/", depth: 1, dir: true },
  { name: "data/", depth: 1, dir: true }, { name: "utils/", depth: 1, dir: true }, { name: "playwright.config.ts", depth: 1, dir: false },
];

function buildSampleCode(dataSetId: string, schemaVersion: string) {
  return `import { test as base, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { reserveTestData, type TestDataLease } from '../fixtures/test-data';

type AuthData = { username: string; password: string };

const test = base.extend<{ testData: TestDataLease<AuthData> }>({
  testData: async ({}, use, testInfo) => {
    const lease = await reserveTestData<AuthData>({
      dataSetId: '${dataSetId}',
      schemaVersion: '${schemaVersion}',
      executionId: testInfo.testId,
      validateSchema: true,
      maskLogs: true,
    });

    try {
      await use(lease); // isolated data for this worker only
    } finally {
      await lease.cleanup({ resetState: true, audit: 'masked' });
    }
  },
});

test('Valid Login', async ({ page, testData }) => {
  const login = new LoginPage(page);
  await page.goto('/login');

  await page.getByLabel('Username').fill(testData.values.username);
  await page.getByLabel('Password').fill(testData.values.password);
  await page.getByRole('button', { name: 'Login' }).click();

  await expect(page.getByText('Dashboard')).toBeVisible();
});`;
}

export default function AutomationPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [routeContext, setRouteContext] = useState<{ testCase: string | null; dataSet: string | null }>({ testCase: null, dataSet: null });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setRouteContext({ testCase: params.get("testCase"), dataSet: params.get("dataSet") });
  }, []);

  const activeTestCase = testCases.find((test) => test.id === routeContext.testCase) ?? testCases[0];
  const activeDataSet = testDataSets.find((dataSet) => dataSet.id === routeContext.dataSet)
    ?? testDataSets.find((dataSet) => activeTestCase.testDataSetIds.includes(dataSet.id))
    ?? testDataSets[0];
  const governance = testDataGovernance.find((policy) => policy.dataSetId === activeDataSet.id) ?? testDataGovernance[0];
  const variableErrors = validateCanonicalVariables(activeTestCase.id, activeTestCase.variables, activeTestCase.manualSteps).filter((issue) => issue.severity === "error");
  const config = [...baseConfig, { label: "Test Data", value: activeDataSet.id }, { label: "Variables", value: `${activeTestCase.variables.length} locked` }];
  const guardedRun = () => {
    if (variableErrors.length) {
      toast({ title: "Automation blocked", description: "Resolve canonical variable validation errors before execution.", variant: "error" });
      return;
    }
    toast({ title: "Guarded execution started", description: `${activeDataSet.id} reserved for ${activeTestCase.id}; ${activeTestCase.variables.length} canonical variables resolved.`, variant: "success" });
    setTimeout(() => router.push("/execution"), 650);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="AI Automation Engineer" description="Generating resilient Playwright automation with governed, deterministic test data." icon={<Bot className="size-5" />} actions={<Badge variant="success"><Sparkles className="size-3" /> Code Generated</Badge>} />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
        {config.map((item) => <Card key={item.label}><CardContent className="p-4"><p className="text-xs text-muted-foreground">{item.label}</p><p className="mt-1 truncate font-semibold">{item.value}</p></CardContent></Card>)}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="overflow-hidden lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between border-b border-border">
            <CardTitle className="flex items-center gap-2 text-sm"><FileCode2 className="size-4 text-primary" /> tests/auth/{activeTestCase.id.toLowerCase()}.spec.ts</CardTitle>
            <Button size="sm" variant="gradient" disabled={variableErrors.length > 0} onClick={guardedRun}><Play className="size-3.5" /> Run guarded test</Button>
          </CardHeader>
          <CardContent className="p-0"><CrossPlatformScriptPanel testCase={activeTestCase} /></CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-primary/25 bg-primary/5"><CardHeader><CardTitle className="flex items-center gap-2 text-base"><Database className="size-4 text-primary" /> Test Data Context</CardTitle></CardHeader><CardContent>
            <p className="text-sm font-medium">{activeDataSet.name}</p><p className="mt-1 text-xs text-muted-foreground">{activeDataSet.id} · {activeDataSet.source} · {activeDataSet.environment}</p>
            <div className="mt-3 flex flex-wrap gap-1.5"><Badge variant="secondary">{activeDataSet.sourceType}</Badge><Badge variant="secondary">{activeDataSet.records.toLocaleString()} records</Badge><Badge variant="success"><ShieldCheck className="size-3" /> {activeDataSet.classification}</Badge></div>
            <p className="mt-3 text-xs text-muted-foreground">The fixture only receives a short-lived, masked data lease; raw credentials never enter Git, traces, or reports.</p>
          </CardContent></Card>
          <TestDataBinding dataSet={activeDataSet} governance={governance} onRun={guardedRun} />
          <Card><CardHeader><CardTitle className="flex items-center gap-2 text-base"><Sparkles className="size-4 text-primary" /> AI Code Insights</CardTitle></CardHeader><CardContent className="space-y-2">{insights.map((insight) => <div key={insight} className="flex items-center gap-2 text-sm"><CheckCircle2 className="size-4 text-success" /> {insight}</div>)}</CardContent></Card>
          <Card><CardHeader><CardTitle className="text-base">Locator Strategy</CardTitle></CardHeader><CardContent className="space-y-2">{locatorStrategy.map((locator, index) => <div key={locator} className="flex items-center gap-3 text-sm"><span className="flex size-5 items-center justify-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary">{index + 1}</span>{locator}</div>)}</CardContent></Card>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2"><CardHeader className="flex-row items-center justify-between"><CardTitle className="flex items-center gap-2 text-base"><FolderTree className="size-4 text-primary" /> Automation Repository</CardTitle><div className="flex gap-2"><Button size="sm" variant="secondary" onClick={() => toast({ title: "Committed 12 files", variant: "success" })}><GitCommit className="size-3.5" /> Commit</Button><Button size="sm" variant="gradient" onClick={() => toast({ title: "Pull request opened", description: "PR #128 created.", variant: "success" })}><GitPullRequest className="size-3.5" /> Create PR</Button></div></CardHeader><CardContent><div className="rounded-lg border border-border bg-secondary/30 p-3 font-mono text-sm">{tree.map((item) => <div key={item.name} className="flex items-center justify-between py-0.5" style={{ paddingLeft: `${item.depth * 20}px` }}><span className={item.dir ? "text-primary" : "text-foreground"}>{item.dir ? "📁" : "📄"} {item.name}</span>{item.count && <span className="text-xs text-muted-foreground">{item.count}</span>}</div>)}</div></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-base">Git Status</CardTitle></CardHeader><CardContent className="space-y-3"><StatusRow label="Files changed" value="12" accent="text-warning" /><StatusRow label="Tests added" value="3" accent="text-success" /><StatusRow label="Data fixtures updated" value="2" accent="text-primary" /><div className="rounded-lg border border-border bg-secondary/30 p-3"><p className="text-xs text-muted-foreground">Sections</p><div className="mt-2 flex flex-wrap gap-1.5">{["Tests", "Page Objects", "Fixtures", "Test Data", "Utilities", "Config", "API Clients"].map((section) => <Badge key={section} variant="secondary">{section}</Badge>)}</div></div></CardContent></Card>
      </div>
      <GithubIntegration />
    </div>
  );
}

function StatusRow({ label, value, accent }: { label: string; value: string; accent: string }) { return <div className="flex items-center justify-between rounded-lg border border-border bg-secondary/30 px-3 py-2"><span className="text-sm text-muted-foreground">{label}</span><span className={`font-semibold ${accent}`}>{value}</span></div>; }
