"use client";

import { BookOpen, Search, FileText, Sparkles, GitBranch } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const articles = [
  { title: "Locator Strategy Playbook", tag: "Automation", desc: "How the agent prioritises role, label, test-id and text selectors." },
  { title: "Self-Healing Confidence Model", tag: "Self-Healing", desc: "Scoring candidate locators from DOM and visual diffs." },
  { title: "Requirement Analysis Framework", tag: "Analysis", desc: "Extracting actors, preconditions and acceptance criteria." },
  { title: "Defect Root Cause Taxonomy", tag: "Defects", desc: "Classification model for UI, API, data and timing failures." },
  { title: "Release Quality Scoring", tag: "Reports", desc: "Composite score across coverage, stability and defect risk." },
  { title: "Playwright Best Practices", tag: "Automation", desc: "No hard waits, reusable page objects, assertion coverage." },
];

export default function KnowledgeBasePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Knowledge Base"
        description="The agent's living memory of testing patterns, playbooks and decisions."
        icon={<BookOpen className="size-5" />}
      />

      <div className="flex items-center gap-2 rounded-xl border border-border bg-secondary/40 px-4">
        <Search className="size-4 text-muted-foreground" />
        <input
          placeholder="Search playbooks, patterns and past decisions..."
          className="h-11 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((a) => (
          <Card key={a.title} className="group cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <FileText className="size-4" />
                </div>
                <Badge variant="secondary">{a.tag}</Badge>
              </div>
              <CardTitle className="mt-2 text-base">{a.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{a.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="flex items-start gap-3 p-5">
          <Sparkles className="mt-0.5 size-5 shrink-0 text-primary" />
          <div>
            <p className="text-sm font-medium">Agent memory grows with every run</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Each analysis, healing and defect enriches the knowledge base so future runs get smarter and faster.
            </p>
          </div>
          <GitBranch className="ml-auto size-5 text-muted-foreground" />
        </CardContent>
      </Card>
    </div>
  );
}
