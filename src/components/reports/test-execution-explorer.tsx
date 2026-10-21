"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle, CheckCircle2, ChevronDown, ChevronRight, CircleDot,
  Clock3, Code2, Copy, FileCode2, Folder, FolderOpen, Layers3, Search,
  SkipForward, Tag, XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { executionTestCatalog, type ExecutionTestCatalogItem } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

type GroupMode = "module" | "feature" | "tag" | "spec" | "folder" | "flat";

const STATUS_STYLE: Record<ExecutionTestCatalogItem["status"], { dot: string; bg: string; text: string; icon: typeof CheckCircle2 }> = {
  Passed:  { dot: "bg-success",  bg: "bg-success/10 border-success/30",  text: "text-success",  icon: CheckCircle2 },
  Failed:  { dot: "bg-danger",   bg: "bg-danger/10 border-danger/30",    text: "text-danger",   icon: XCircle },
  Flaky:   { dot: "bg-warning",  bg: "bg-warning/10 border-warning/30",  text: "text-warning",  icon: AlertTriangle },
  Skipped: { dot: "bg-muted-foreground", bg: "bg-secondary border-border", text: "text-muted-foreground", icon: SkipForward },
};

const GROUP_MODES: Array<{ id: GroupMode; label: string; icon: typeof Layers3 }> = [
  { id: "module",  label: "Modules",    icon: Layers3 },
  { id: "feature", label: "Features",   icon: FolderOpen },
  { id: "tag",     label: "Tags",       icon: Tag },
  { id: "spec",    label: "Spec files", icon: FileCode2 },
  { id: "folder",  label: "Folders",    icon: Folder },
  { id: "flat",    label: "All tests",  icon: CircleDot },
];

export function TestExecutionExplorer() {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("Any");
  const [projectFilter, setProjectFilter] = useState("All");
  const [mode, setMode] = useState<GroupMode>("module");
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    Authentication: true, API: true, Checkout: true, Catalog: true,
  });
  const [selectedId, setSelectedId] = useState<string | null>("SETUP-001");

  const selected = executionTestCatalog.find((t) => t.id === selectedId) ?? null;

  const filtered = useMemo(() => executionTestCatalog.filter((test) => {
    const hay = `${test.title} ${test.spec} ${test.module} ${test.feature} ${test.tags.join(" ")}`.toLowerCase();
    return (
      (!query || hay.includes(query.toLowerCase())) &&
      (statusFilter === "Any" || test.status === statusFilter) &&
      (projectFilter === "All" || test.project === projectFilter)
    );
  }), [query, statusFilter, projectFilter]);

  const groups = useMemo(() => {
    if (mode === "flat") return [{ key: "All tests", tests: filtered }];
    const map = new Map<string, ExecutionTestCatalogItem[]>();
    filtered.forEach((t) => {
      const keys = mode === "module" ? [t.module] : mode === "feature" ? [t.feature]
        : mode === "tag" ? t.tags : mode === "spec" ? [t.spec]
        : [t.spec.includes("/") ? t.spec.split("/").slice(0, -1).join("/") : "Root"];
      keys.forEach((k) => map.set(k, [...(map.get(k) ?? []), t]));
    });
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b)).map(([key, tests]) => ({ key, tests }));
  }, [filtered, mode]);

  /* summary counts */
  const counts = useMemo(() => ({
    passed:  executionTestCatalog.filter((t) => t.status === "Passed").length,
    failed:  executionTestCatalog.filter((t) => t.status === "Failed").length,
    flaky:   executionTestCatalog.filter((t) => t.status === "Flaky").length,
    skipped: executionTestCatalog.filter((t) => t.status === "Skipped").length,
  }), []);

  return (
    <div className="space-y-4">
      {/* ── Section header ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Test Execution Explorer</h2>
          <p className="mt-1 text-sm text-muted-foreground">Browse all executed tests by module, feature, tag, or spec. Select a test to inspect its step timeline.</p>
        </div>
      </div>

      {/* ── Status summary pills ── */}
      <div className="flex flex-wrap gap-2">
        {([["Any", counts.passed + counts.failed + counts.flaky + counts.skipped, "bg-secondary text-foreground border-border"],
           ["Passed",  counts.passed,  "bg-success/10 text-success border-success/30"],
           ["Failed",  counts.failed,  "bg-danger/10 text-danger border-danger/30"],
           ["Flaky",   counts.flaky,   "bg-warning/10 text-warning border-warning/30"],
           ["Skipped", counts.skipped, "bg-secondary text-muted-foreground border-border"],
        ] as [string, number, string][]).map(([label, count, style]) => (
          <button key={label} onClick={() => setStatusFilter(label)} className={cn("flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors", style, statusFilter === label ? "ring-2 ring-offset-1 ring-ring" : "opacity-70 hover:opacity-100")}>
            {label === "Passed" && <CheckCircle2 className="size-3.5" />}
            {label === "Failed"  && <XCircle className="size-3.5" />}
            {label === "Flaky"   && <AlertTriangle className="size-3.5" />}
            {label === "Skipped" && <SkipForward className="size-3.5" />}
            {label}&nbsp;<span className="font-mono font-bold">{count}</span>
          </button>
        ))}
      </div>

      {/* ── Group-mode menu + search bar ── */}
      <Card>
        <CardContent className="p-3">
          <div className="flex flex-wrap items-center gap-3">
            {/* Group mode pills */}
            <div className="flex flex-wrap gap-1">
              {GROUP_MODES.map(({ id, label, icon: Icon }) => (
                <button key={id} onClick={() => setMode(id)} className={cn("flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors", mode === id ? "border-primary bg-primary text-primary-foreground" : "border-border bg-secondary/40 text-muted-foreground hover:bg-accent hover:text-foreground")}>
                  <Icon className="size-3.5" />{label}
                </button>
              ))}
            </div>

            {/* Spacer */}
            <div className="flex flex-1 flex-wrap items-center justify-end gap-2">
              {/* Search */}
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-2.5 size-4 text-muted-foreground" />
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search tests, tags, files…" className="h-9 w-64 rounded-lg border border-border bg-secondary/40 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground" />
              </div>
              {/* Project */}
              <select value={projectFilter} onChange={(e) => setProjectFilter(e.target.value)} className="h-9 rounded-lg border border-border bg-secondary/40 px-2 text-sm outline-none focus:ring-2 focus:ring-ring">
                <option value="All">All projects</option>
                {Array.from(new Set(executionTestCatalog.map((t) => t.project))).map((p) => <option key={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">{filtered.length} test{filtered.length === 1 ? "" : "s"} matching current filters</p>
        </CardContent>
      </Card>

      {/* ── Main explorer body ── */}
      <div className={cn("grid gap-4", selected ? "xl:grid-cols-[1fr_460px]" : "xl:grid-cols-1")}>

        {/* Left — grouped test list */}
        <div className="space-y-3 min-h-0">
          {groups.length === 0 && (
            <div className="rounded-xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">No tests match the active filters.</div>
          )}
          {groups.map(({ key, tests }) => {
            const isOpen = mode === "flat" || (openGroups[key] !== false);
            const fail = tests.filter((t) => t.status === "Failed").length;
            const flaky = tests.filter((t) => t.status === "Flaky").length;

            return (
              <Card key={key} className={cn("overflow-hidden", fail && "border-danger/20")}>
                {/* Group header */}
                <button
                  className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-accent/40"
                  onClick={() => setOpenGroups((prev) => ({ ...prev, [key]: !isOpen }))}
                >
                  {isOpen ? <ChevronDown className="size-4 text-muted-foreground" /> : <ChevronRight className="size-4 text-muted-foreground" />}
                  {isOpen ? <FolderOpen className="size-4 text-primary" /> : <Folder className="size-4 text-muted-foreground" />}
                  <span className="flex-1 text-sm font-semibold">{key}</span>
                  <span className="font-mono text-xs text-muted-foreground">{tests.length}</span>
                  {fail > 0 && <Badge variant="danger">{fail} failed</Badge>}
                  {flaky > 0 && <Badge variant="warning">{flaky} flaky</Badge>}
                </button>

                {/* Test rows */}
                {isOpen && (
                  <div className="border-t border-border">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border bg-secondary/20 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                          <th className="px-4 py-2 font-medium">Test</th>
                          <th className="px-4 py-2 font-medium">Status</th>
                          <th className="px-4 py-2 font-medium">Duration</th>
                          <th className="px-4 py-2 font-medium">Tags</th>
                          <th className="px-4 py-2 font-medium">Project</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tests.map((test) => {
                          const s = STATUS_STYLE[test.status];
                          const StatusIcon = s.icon;
                          const isSelected = selectedId === test.id;
                          return (
                            <tr
                              key={test.id}
                              onClick={() => setSelectedId(isSelected ? null : test.id)}
                              className={cn("cursor-pointer border-b border-border/60 last:border-0 transition-colors", isSelected ? "bg-primary/8" : "hover:bg-accent/40")}
                            >
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <span className={cn("size-2 rounded-full flex-shrink-0", s.dot)} />
                                  <div>
                                    <p className={cn("font-medium", isSelected && "text-primary")}>{test.title}</p>
                                    <p className="font-mono text-[11px] text-muted-foreground">{test.spec}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <span className={cn("flex items-center gap-1.5 text-xs font-semibold", s.text)}>
                                  <StatusIcon className="size-3.5" />{test.status}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <span className="flex items-center gap-1 font-mono text-xs text-muted-foreground">
                                  <Clock3 className="size-3" />{(test.durationMs / 1000).toFixed(1)}s
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex flex-wrap gap-1">
                                  {test.tags.slice(0, 2).map((tag) => <Badge key={tag} variant="secondary" className="text-[10px]">{tag}</Badge>)}
                                  {test.tags.length > 2 && <span className="text-[10px] text-muted-foreground">+{test.tags.length - 2}</span>}
                                </div>
                              </td>
                              <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{test.project}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>
            );
          })}
        </div>

        {/* Right — detail panel (only when a test is selected) */}
        {selected && (
          <div className="space-y-4">
            <Card className="sticky top-4">
              {/* Detail header */}
              <CardHeader className="border-b border-border pb-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-[11px] text-primary">{selected.spec}</p>
                    <CardTitle className="mt-1 text-base leading-snug">{selected.title}</CardTitle>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      {(() => { const s = STATUS_STYLE[selected.status]; const Icon = s.icon; return <span className={cn("flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold", s.bg, s.text)}><Icon className="size-3.5" />{selected.status}</span>; })()}
                      <span className="font-mono text-xs text-muted-foreground">{(selected.durationMs / 1000).toFixed(1)}s</span>
                      <span className="text-xs text-muted-foreground">{selected.project}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Button size="sm" variant="outline" onClick={() => navigator.clipboard?.writeText(`${window.location.href}#${selected.id}`)}><Copy className="size-3.5" /></Button>
                    <Button size="sm" variant="outline"><FileCode2 className="size-3.5" /></Button>
                    <Button size="sm" variant="ghost" onClick={() => setSelectedId(null)} className="text-muted-foreground">✕</Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-5 pt-5">
                {/* Metadata grid */}
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {[["Module", selected.module], ["Feature", selected.feature], ["Project", selected.project]].map(([k, v]) => (
                    <div key={k} className="rounded-lg border border-border bg-secondary/20 p-2.5">
                      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{k}</p>
                      <p className="mt-1 font-medium">{v}</p>
                    </div>
                  ))}
                  <div className="rounded-lg border border-border bg-secondary/20 p-2.5">
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Tags</p>
                    <div className="mt-1 flex flex-wrap gap-1">{selected.tags.map((t) => <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>)}</div>
                  </div>
                </div>

                {/* Execution steps */}
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Execution steps</p>
                    <p className="text-xs text-muted-foreground">Bar = share of {(selected.durationMs / 1000).toFixed(1)}s</p>
                  </div>
                  <div className="space-y-1.5">
                    {selected.steps.map((step, index) => {
                      const pct = selected.durationMs ? Math.max(2, Math.round((step.durationMs / selected.durationMs) * 100)) : 0;
                      const s = STATUS_STYLE[step.status];
                      const StepIcon = s.icon;
                      return (
                        <div key={`${step.title}-${index}`} className={cn("flex items-center gap-3 rounded-lg border p-2.5 text-sm", step.status === "Failed" ? "border-danger/30 bg-danger/5" : "border-border bg-secondary/10")}>
                          <span className="w-14 flex-shrink-0 rounded bg-secondary px-1.5 py-0.5 text-center font-mono text-[10px] text-muted-foreground">{step.category}</span>
                          <StepIcon className={cn("size-4 flex-shrink-0", s.text)} />
                          <span className={cn("min-w-0 flex-1 truncate", step.status === "Failed" && "font-medium text-danger")}>{step.title}</span>
                          <div className="h-1.5 w-20 flex-shrink-0 overflow-hidden rounded-full bg-secondary">
                            <div className={cn("h-full rounded-full", step.status === "Failed" ? "bg-danger" : "bg-primary")} style={{ width: `${pct}%` }} />
                          </div>
                          <span className="w-12 flex-shrink-0 text-right font-mono text-xs text-muted-foreground">{step.durationMs < 1000 ? `${step.durationMs}ms` : `${(step.durationMs / 1000).toFixed(1)}s`}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <Button variant="secondary" className="w-full" onClick={() => setSelectedId(null)}>Close detail</Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
