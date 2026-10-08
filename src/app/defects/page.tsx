"use client";

import { useState } from "react";
import { Bug, Sparkles, ExternalLink, GitBranch, Link2 } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusPill } from "@/components/ui/status-pill";
import { Drawer } from "@/components/ui/drawer";
import { useToast } from "@/components/ui/toast";
import { defects, type Defect } from "@/lib/mock-data";

export default function DefectsPage() {
  const { toast } = useToast();
  const [selected, setSelected] = useState<Defect | null>(null);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Defects"
        description="AI-generated defects with root cause analysis and impact mapping."
        icon={<Bug className="size-5" />}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard value="8" label="Open" accent="text-danger" />
        <MetricCard value="14" label="Resolved" accent="text-success" />
        <MetricCard value="3" label="Critical" accent="text-warning" />
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-5 py-3 font-medium">ID</th>
                  <th className="px-5 py-3 font-medium">Defect</th>
                  <th className="px-5 py-3 font-medium">Severity</th>
                  <th className="px-5 py-3 font-medium">Test</th>
                  <th className="px-5 py-3 font-medium">AI Root Cause</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {defects.map((d) => (
                  <tr
                    key={d.id}
                    onClick={() => setSelected(d)}
                    className="cursor-pointer border-b border-border/60 last:border-0 hover:bg-accent/40"
                  >
                    <td className="px-5 py-3"><span className="font-mono text-xs font-medium text-primary">{d.id}</span></td>
                    <td className="px-5 py-3 font-medium">{d.title}</td>
                    <td className="px-5 py-3"><StatusPill status={d.severity} /></td>
                    <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{d.test}</td>
                    <td className="px-5 py-3 text-muted-foreground">{d.rootCause}</td>
                    <td className="px-5 py-3"><StatusPill status={d.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Drawer open={!!selected} onClose={() => setSelected(null)}>
        {selected && (
          <div className="p-6">
            <span className="font-mono text-xs font-medium text-primary">{selected.id}</span>
            <h2 className="mt-1 text-xl font-semibold">{selected.title}</h2>
            <div className="mt-2 flex flex-wrap gap-2">
              <StatusPill status={selected.severity} />
              <StatusPill status={selected.status} />
              <Badge variant="secondary">Test {selected.test}</Badge>
            </div>

            <div className="mt-5 flex items-center gap-2 text-primary">
              <Sparkles className="size-4" />
              <span className="text-sm font-medium">AI Root Cause Analysis</span>
            </div>

            <Section title="Root Cause">
              <p className="rounded-lg border border-border bg-secondary/30 p-3 text-sm">{selected.rootCause === "UI change" ? "Checkout button locator changed after UI redesign." : selected.suggestedFix}</p>
            </Section>

            <Section title="Impact">
              <p className="text-sm text-muted-foreground">{selected.impact}</p>
            </Section>

            <Section title="Suggested Fix">
              <p className="rounded-lg border border-success/30 bg-success/5 p-3 text-sm">{selected.suggestedFix}</p>
            </Section>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-border bg-secondary/30 p-3">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <GitBranch className="size-4" />
                  <span className="text-xs">Related Tests</span>
                </div>
                <p className="mt-1 text-xl font-semibold">{selected.relatedTests}</p>
              </div>
              <div className="rounded-lg border border-border bg-secondary/30 p-3">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Link2 className="size-4" />
                  <span className="text-xs">Requirement</span>
                </div>
                <p className="mt-1 font-mono text-sm font-semibold text-primary">{selected.requirement}</p>
              </div>
            </div>

            <Button
              variant="gradient"
              className="mt-6 w-full"
              onClick={() => toast({ title: "Jira defect created", description: `${selected.id} pushed to Jira.`, variant: "success" })}
            >
              <ExternalLink className="size-4" /> Create Jira Defect
            </Button>
          </div>
        )}
      </Drawer>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-5">
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</h3>
      {children}
    </div>
  );
}

function MetricCard({ value, label, accent }: { value: string; label: string; accent: string }) {
  return (
    <Card className="p-5">
      <p className={`text-4xl font-semibold ${accent}`}>{value}</p>
      <p className="mt-1 text-sm text-muted-foreground">{label}</p>
    </Card>
  );
}
