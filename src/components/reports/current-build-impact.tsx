"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import {
  AlertTriangle, Bug, Check, ChevronRight, CircleDot, ExternalLink,
  FileCode2, Filter, GitBranch, Plus, ShieldAlert, Sparkles, X,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/status-pill";
import { useToast } from "@/components/ui/toast";
import { defects, executionTestCatalog, failureAnalysisRecords, failureExecutionHistory } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export function CurrentBuildImpact() {
  const { toast } = useToast();
  const [cause, setCause] = useState("All");

  /* local bug-id overrides keyed by failure.id */
  const [bugIdMap, setBugIdMap] = useState<Record<string, string>>(() =>
    Object.fromEntries(failureAnalysisRecords.filter((f) => f.bugId).map((f) => [f.id, f.bugId!]))
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftBugId, setDraftBugId] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const causes = ["All", ...Array.from(new Set(failureAnalysisRecords.map((f) => f.category)))];
  const failures = useMemo(
    () => cause === "All" ? failureAnalysisRecords : failureAnalysisRecords.filter((f) => f.category === cause),
    [cause]
  );
  const openBugs = defects.filter((d) => d.status === "Open");
  const impactedScripts = openBugs.reduce((s, b) => s + b.relatedTests, 0);

  const startEdit = (failureId: string) => {
    setEditingId(failureId);
    setDraftBugId(bugIdMap[failureId] ?? "");
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const saveBugId = (failureId: string) => {
    const trimmed = draftBugId.trim().toUpperCase();
    if (!trimmed) { setEditingId(null); return; }
    setBugIdMap((prev) => ({ ...prev, [failureId]: trimmed }));
    setEditingId(null);
    toast({ title: "Bug ID linked", description: `${trimmed} is now associated with this failure.`, variant: "success" });
  };

  const clearBugId = (failureId: string) => {
    setBugIdMap((prev) => { const next = { ...prev }; delete next[failureId]; return next; });
    toast({ title: "Bug ID removed", description: "The failure no longer has a linked bug.", variant: "info" });
  };

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-semibold"><ShieldAlert className="size-5 text-danger" /> Current Build Impact</h2>
          <p className="mt-1 text-sm text-muted-foreground">Failed tests and defects currently affecting automation scripts in build #482.</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="danger">{failureAnalysisRecords.length} failed tests</Badge>
          <Badge variant="warning">{openBugs.length} open bugs</Badge>
          <Badge variant="secondary">{impactedScripts} scripts impacted</Badge>
        </div>
      </div>

      {/* Root-cause filter */}
      <Card className="border-primary/25 bg-primary/5">
        <CardContent className="flex flex-wrap items-center gap-3 p-4">
          <div className="flex items-center gap-2"><Filter className="size-4 text-primary" /><span className="text-sm font-medium">Filter failures by root cause</span></div>
          <div className="flex flex-wrap gap-2">
            {causes.map((item) => {
              const count = item === "All" ? failureAnalysisRecords.length : failureAnalysisRecords.filter((f) => f.category === item).length;
              return (
                <button key={item} onClick={() => setCause(item)} className={cn("rounded-full border px-3 py-1.5 text-xs font-medium", cause === item ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground hover:bg-accent hover:text-foreground")}>
                  {item} <span className={cn("ml-1 rounded-full px-1.5 py-0.5 text-[10px]", cause === item ? "bg-white/20" : "bg-secondary")}>{count}</span>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        {/* ── Failed tests table ── */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><CircleDot className="size-4 text-danger" /> List of Failed Tests</CardTitle>
            <CardDescription>{failures.length} failure{failures.length === 1 ? "" : "s"} · Bug IDs shown where linked. Link a bug for any untracked failure.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-secondary/20 text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="px-4 py-3 font-medium">Test</th>
                    <th className="px-4 py-3 font-medium">Root Cause</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Bug ID</th>
                    <th className="px-4 py-3 font-medium">History</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {failures.map((failure) => {
                    const catalog = executionTestCatalog.find((t) => t.id === failure.testId);
                    const history = failure.testId === "TC-045" ? [...failureExecutionHistory].reverse() : [];
                    const previousFails = history.filter((r) => r.status === "Failed" && r.runId !== "#482");
                    const linkedBugId = bugIdMap[failure.id];
                    const linkedDefect = defects.find((d) => d.id === linkedBugId);
                    const isEditing = editingId === failure.id;

                    return (
                      <tr key={failure.id} className="border-b border-border/60 last:border-0 hover:bg-accent/40">
                        {/* Test */}
                        <td className="px-4 py-3">
                          <p className="font-mono text-xs text-primary">{failure.testId}</p>
                          <p className="mt-0.5 font-medium">{failure.test}</p>
                          <p className="text-xs text-muted-foreground">{catalog ? `${catalog.module} · ${catalog.feature}` : `${failure.occurredAt} · ${failure.duration}`}</p>
                        </td>
                        {/* Root cause */}
                        <td className="px-4 py-3">
                          <Badge variant="secondary">{failure.category}</Badge>
                          <p className="mt-1 max-w-[190px] text-xs text-muted-foreground">{failure.rootCause}</p>
                        </td>
                        {/* Status */}
                        <td className="px-4 py-3"><StatusPill status={failure.status} /></td>

                        {/* ── Bug ID cell ── */}
                        <td className="px-4 py-3">
                          {linkedBugId ? (
                            <div className="flex items-center gap-1.5">
                              {/* Linked badge */}
                              <a href="#" className="inline-flex items-center gap-1.5 rounded-lg border border-danger/35 bg-danger/8 px-2 py-1 text-xs font-semibold text-danger hover:bg-danger/15 transition-colors">
                                <Bug className="size-3" /> {linkedBugId}
                              </a>
                              {/* Tooltip-style description */}
                              {linkedDefect && (
                                <span className="hidden max-w-[130px] truncate text-[11px] text-muted-foreground lg:block" title={linkedDefect.title}>{linkedDefect.title}</span>
                              )}
                              {/* Edit & remove controls */}
                              <button title="Change bug ID" onClick={() => startEdit(failure.id)} className="rounded p-0.5 text-muted-foreground hover:bg-accent hover:text-foreground">
                                <AlertTriangle className="size-3" />
                              </button>
                              <button title="Remove link" onClick={() => clearBugId(failure.id)} className="rounded p-0.5 text-muted-foreground hover:bg-danger/10 hover:text-danger">
                                <X className="size-3" />
                              </button>
                            </div>
                          ) : isEditing ? (
                            /* Inline input */
                            <div className="flex items-center gap-1.5">
                              <input
                                ref={inputRef}
                                value={draftBugId}
                                onChange={(e) => setDraftBugId(e.target.value)}
                                onKeyDown={(e) => { if (e.key === "Enter") saveBugId(failure.id); if (e.key === "Escape") setEditingId(null); }}
                                placeholder="e.g. BUG-105"
                                className="h-7 w-28 rounded-md border border-border bg-secondary/30 px-2 font-mono text-xs outline-none focus:ring-2 focus:ring-ring"
                              />
                              <button title="Save" onClick={() => saveBugId(failure.id)} className="rounded p-1 text-success hover:bg-success/10"><Check className="size-3.5" /></button>
                              <button title="Cancel" onClick={() => setEditingId(null)} className="rounded p-1 text-muted-foreground hover:bg-accent"><X className="size-3.5" /></button>
                            </div>
                          ) : (
                            /* No bug yet — prompt to link */
                            <button
                              onClick={() => startEdit(failure.id)}
                              className="flex items-center gap-1 rounded-lg border border-dashed border-border px-2 py-1 text-xs text-muted-foreground hover:border-primary hover:bg-primary/5 hover:text-primary transition-colors"
                            >
                              <Plus className="size-3" /> Link Bug ID
                            </button>
                          )}
                        </td>

                        {/* History */}
                        <td className="px-4 py-3">
                          {history.length ? (
                            <div>
                              <div className="flex gap-1">
                                {history.map((run) => (
                                  <span key={run.runId} title={`${run.runId} · ${run.status} · ${(run.durationMs / 1000).toFixed(1)}s`} className={cn("size-2.5 rounded-sm", run.status === "Failed" ? "bg-danger" : "bg-success")} />
                                ))}
                              </div>
                              <p className="mt-1 text-xs text-danger">{previousFails.length ? `since ${previousFails[0].runId}` : "new"}</p>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">No prior history</span>
                          )}
                        </td>

                        {/* Analyse link */}
                        <td className="px-4 py-3 text-right">
                          <Button size="sm" variant="ghost" asChild>
                            <Link href="/failure-analysis">Analyze <ChevronRight className="size-3.5" /></Link>
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* ── Bugs impacting scripts ── */}
        <Card className="border-danger/25">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><Bug className="size-4 text-danger" /> Bugs Impacting Scripts</CardTitle>
            <CardDescription>Open defects linked to automation scripts in the current build.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {openBugs.map((bug) => (
              <div key={bug.id} className="rounded-xl border border-border bg-secondary/20 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div><p className="font-mono text-xs text-primary">{bug.id}</p><p className="mt-0.5 text-sm font-semibold">{bug.title}</p></div>
                  <StatusPill status={bug.severity} />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">{bug.rootCause}</p>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <Impact label="Linked test" value={bug.test} />
                  <Impact label="Scripts impacted" value={bug.relatedTests.toString()} />
                  <Impact label="Requirement" value={bug.requirement} />
                  <Impact label="Build state" value="Open" />
                </div>
                <div className="mt-3 rounded-lg border border-danger/20 bg-danger/5 p-2 text-xs text-muted-foreground"><FileCode2 className="mr-1 inline size-3.5 text-danger" /> {bug.suggestedFix}</div>
                <Button size="sm" variant="outline" className="mt-3 w-full"><ExternalLink className="size-3.5" /> Open defect context</Button>
              </div>
            ))}
            {!openBugs.length && (
              <div className="rounded-lg border border-success/25 bg-success/5 p-3 text-sm text-success"><Sparkles className="mr-1 inline size-4" /> No open defects are impacting scripts in this build.</div>
            )}
            <div className="rounded-xl border border-primary/25 bg-primary/5 p-3">
              <p className="flex items-center gap-2 text-sm font-medium"><GitBranch className="size-4 text-primary" /> Build impact summary</p>
              <p className="mt-1 text-xs text-muted-foreground">{impactedScripts} script references are affected by {openBugs.length} open defects. Prioritize critical UI and API regressions before approving release.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

function Impact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-2">
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 truncate font-mono text-xs font-semibold">{value}</p>
    </div>
  );
}
