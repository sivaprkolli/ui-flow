"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { requirements, testCases, testDataSets, defects, executionRows } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

interface Result {
  id: string;
  label: string;
  type: string;
  href: string;
}

export function GlobalSearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const index = useMemo<Result[]>(
    () => [
      ...requirements.map((r) => ({ id: r.id, label: r.title, type: "Requirement", href: "/requirements" })),
      ...testCases.map((t) => ({ id: t.id, label: t.title, type: "Test Case", href: "/test-cases" })),
      ...testDataSets.map((data) => ({ id: data.id, label: data.name, type: `Test Data · ${data.sourceType}`, href: "/test-data" })),
      ...defects.map((d) => ({ id: d.id, label: d.title, type: "Defect", href: "/defects" })),
      ...executionRows.map((e) => ({ id: e.id, label: e.test, type: "Execution", href: "/execution" })),
    ],
    []
  );

  const results = useMemo(() => {
    if (!query.trim()) return index.slice(0, 6);
    const q = query.toLowerCase();
    return index.filter((r) => r.id.toLowerCase().includes(q) || r.label.toLowerCase().includes(q) || r.type.toLowerCase().includes(q)).slice(0, 8);
  }, [query, index]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex h-9 w-full max-w-md items-center gap-2 rounded-lg border border-border bg-secondary/50 px-3 text-sm text-muted-foreground transition-colors hover:bg-secondary"
      >
        <Search className="size-4" />
        <span className="flex-1 text-left">Search requirements, tests, data, executions, defects...</span>
        <kbd className="hidden rounded border border-border bg-background px-1.5 py-0.5 text-[10px] font-medium sm:inline-block">
          ⌘K
        </kbd>
      </button>

      {open && (
        <div className="fixed inset-0 z-[90] flex items-start justify-center pt-[12vh]">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-xl overflow-hidden rounded-xl border border-border bg-popover shadow-2xl animate-fade-in">
            <div className="flex items-center gap-3 border-b border-border px-4">
              <Search className="size-5 text-muted-foreground" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by ID, name, test data, locator, execution..."
                className="h-14 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
              <kbd className="rounded border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground">ESC</kbd>
            </div>
            <div className="max-h-80 overflow-y-auto scrollbar-thin p-2">
              {results.length === 0 && (
                <p className="px-3 py-6 text-center text-sm text-muted-foreground">No results found.</p>
              )}
              {results.map((r) => (
                <button
                  key={r.type + r.id}
                  onClick={() => {
                    router.push(r.href);
                    setOpen(false);
                    setQuery("");
                  }}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-accent"
                  )}
                >
                  <span className="rounded-md bg-secondary px-2 py-1 font-mono text-[11px] text-muted-foreground">
                    {r.id}
                  </span>
                  <span className="flex-1 text-sm">{r.label}</span>
                  <span className="text-[11px] text-muted-foreground">{r.type}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
