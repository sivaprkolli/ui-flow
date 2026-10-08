"use client";

import Link from "next/link";
import {
  ClipboardList, FileText, Bot, Activity, HeartPulse, Bug,
  Sparkles, ArrowRight, Upload, Play, MessageSquare,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/dashboard/stat-card";
import { QualityDonut } from "@/components/dashboard/quality-donut";
import { AIQualityScore } from "@/components/dashboard/ai-quality-score";
import { AIActivity } from "@/components/dashboard/ai-activity";
import { WorkflowViz } from "@/components/dashboard/workflow-viz";
import { summaryStats } from "@/lib/mock-data";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/10 via-card to-fuchsia-500/5 p-6 lg:p-8">
        <div className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 right-40 size-56 rounded-full bg-fuchsia-500/10 blur-3xl" />
        <div className="relative">
          <Badge variant="default" className="mb-3">
            <Sparkles className="size-3" /> Your AI QA Engineer
          </Badge>
          <h1 className="text-3xl font-semibold tracking-tight lg:text-4xl">
            Good morning, Siva 👋
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Your AI QA Agent is ready to validate the next release. From requirements to release confidence.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-2 text-sm">
            {["Requirements", "Tests", "Automation", "Execution", "Self-Healing", "Quality"].map((s, i, arr) => (
              <span key={s} className="flex items-center gap-2">
                <span className="rounded-full border border-border bg-card/60 px-3 py-1 font-medium backdrop-blur">
                  {s}
                </span>
                {i !== arr.length - 1 && <ArrowRight className="size-3.5 text-muted-foreground" />}
              </span>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <Button variant="gradient" size="lg" asChild>
              <Link href="/requirements">
                <Sparkles className="size-4" /> Start New QA Workflow
              </Link>
            </Button>
            <Button variant="secondary" asChild>
              <Link href="/requirements">
                <Upload className="size-4" /> Import Requirement
              </Link>
            </Button>
            <Button variant="secondary" asChild>
              <Link href="/execution">
                <Play className="size-4" /> Run Regression
              </Link>
            </Button>
            <Button variant="outline">
              <MessageSquare className="size-4" /> Ask QA Agent
            </Button>
          </div>
        </div>
      </section>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Requirements" value={summaryStats.requirements} sub="Analyzed" icon={ClipboardList} accent="text-primary" trend={{ value: "+4", up: true }} />
        <StatCard label="Test Cases" value={summaryStats.testCases} sub="Generated" icon={FileText} accent="text-sky-400" trend={{ value: "+28", up: true }} />
        <StatCard label="Automation" value={summaryStats.automation} sub="Automated" icon={Bot} accent="text-fuchsia-400" trend={{ value: "+19", up: true }} />
        <StatCard label="Execution" value={`${summaryStats.passRate}%`} sub="Pass Rate" icon={Activity} accent="text-success" trend={{ value: "+1.4%", up: true }} />
        <StatCard label="Self-Healed" value={summaryStats.selfHealed} sub="Locators Fixed" icon={HeartPulse} accent="text-emerald-400" trend={{ value: "+3", up: true }} />
        <StatCard label="Defects" value={summaryStats.defects} sub="Open" icon={Bug} accent="text-danger" trend={{ value: "-2", up: false }} />
      </div>

      {/* Quality overview + AI score */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Quality Overview</CardTitle>
            <CardDescription>Execution results across the latest build #482</CardDescription>
          </CardHeader>
          <CardContent>
            <QualityDonut />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="size-4 text-primary" /> AI Quality Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AIQualityScore />
          </CardContent>
        </Card>
      </div>

      {/* Workflow visualization */}
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle>AI Agent Workflow</CardTitle>
            <CardDescription>The complete testing lifecycle, driven end-to-end by the agent</CardDescription>
          </div>
          <Badge variant="warning">
            <span className="size-1.5 rounded-full bg-warning" /> Processing
          </Badge>
        </CardHeader>
        <CardContent className="overflow-x-auto scrollbar-thin pb-4">
          <WorkflowViz />
        </CardContent>
      </Card>

      {/* AI Activity */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-primary" />
              <CardTitle>AI Agent Activity</CardTitle>
            </div>
            <Badge variant="success">
              <span className="size-1.5 animate-pulse rounded-full bg-success" /> Live
            </Badge>
          </CardHeader>
          <CardContent>
            <AIActivity />
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Release Confidence</CardTitle>
            <CardDescription>AI summary for build #482</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col">
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-semibold text-gradient">92</span>
              <span className="text-muted-foreground">/ 100</span>
            </div>
            <Badge variant="success" className="mt-2 w-fit">Release Confidence: HIGH</Badge>
            <p className="mt-4 flex-1 text-sm text-muted-foreground">
              The current build is stable. 92% of tests passed and 94% of critical requirements are covered.
              Three failures were automatically healed. Two high-priority defects require attention before release.
            </p>
            <Button variant="outline" className="mt-4" asChild>
              <Link href="/reports">View Quality Report <ArrowRight className="size-4" /></Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
