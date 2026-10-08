"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ClipboardList, Plus, Download, FileUp, ClipboardPaste, Sparkles, ArrowRight,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusPill } from "@/components/ui/status-pill";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/toast";
import { requirements } from "@/lib/mock-data";

const sourceStyle: Record<string, string> = {
  Jira: "text-sky-400",
  Confluence: "text-fuchsia-400",
  Document: "text-emerald-400",
  ADO: "text-blue-400",
};

export default function RequirementsPage() {
  const { toast } = useToast();
  const [query, setQuery] = useState("");

  const filtered = requirements.filter(
    (r) => r.id.toLowerCase().includes(query.toLowerCase()) || r.title.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Requirements"
        description="Import, analyze and track requirement coverage across sources."
        icon={<ClipboardList className="size-5" />}
        actions={
          <>
            <Button variant="gradient" onClick={() => toast({ title: "New requirement", description: "Blank requirement created.", variant: "success" })}>
              <Plus className="size-4" /> Add Requirement
            </Button>
            <Button variant="secondary" onClick={() => toast({ title: "Connecting to Jira", description: "Fetching linked stories...", variant: "info" })}>
              <Download className="size-4" /> Import from Jira
            </Button>
            <Button variant="secondary" onClick={() => toast({ title: "Connecting to Confluence", variant: "info" })}>
              <Download className="size-4" /> Import from Confluence
            </Button>
            <Button variant="secondary" onClick={() => toast({ title: "Connecting to Azure DevOps", description: "Fetching work items...", variant: "info" })}>
              <Download className="size-4" /> Import from Azure DevOps
            </Button>
            <Button variant="outline" onClick={() => toast({ title: "Upload", description: "Select a document to parse.", variant: "info" })}>
              <FileUp className="size-4" /> Upload Document
            </Button>
            <Button variant="outline" onClick={() => toast({ title: "Paste requirement", variant: "info" })}>
              <ClipboardPaste className="size-4" /> Paste
            </Button>
          </>
        }
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter by ID or title..."
          className="h-9 w-72 rounded-lg border border-border bg-secondary/40 px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{filtered.length} requirements</span>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-5 py-3 font-medium">ID</th>
                  <th className="px-5 py-3 font-medium">Requirement</th>
                  <th className="px-5 py-3 font-medium">Source</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">AI Analysis</th>
                  <th className="px-5 py-3 font-medium">Coverage</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} className="group border-b border-border/60 last:border-0 hover:bg-accent/40">
                    <td className="px-5 py-3">
                      <span className="font-mono text-xs font-medium text-primary">{r.id}</span>
                    </td>
                    <td className="px-5 py-3 font-medium">{r.title}</td>
                    <td className="px-5 py-3">
                      <span className={sourceStyle[r.source] ?? ""}>{r.source}</span>
                    </td>
                    <td className="px-5 py-3"><StatusPill status={r.status} /></td>
                    <td className="px-5 py-3">
                      {r.analysis === "Running" ? (
                        <span className="flex items-center gap-1.5 text-xs text-warning">
                          <Sparkles className="size-3.5 animate-pulse" /> Running
                        </span>
                      ) : (
                        <StatusPill status={r.analysis} />
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <Progress value={r.coverage} className="w-24" />
                        <span className="text-xs font-medium tabular-nums">{r.coverage}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href="/analysis">
                          Analyze <ArrowRight className="size-3.5" />
                        </Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
