"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FlaskConical, Sparkles, RefreshCw, CheckCheck, Download, Plus, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusPill } from "@/components/ui/status-pill";
import { useToast } from "@/components/ui/toast";
import { scenarios, scenarioCategories } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export default function ScenariosPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [activeCat, setActiveCat] = useState<string>("All");

  const filtered = activeCat === "All" ? scenarios : scenarios.filter((s) => s.category === activeCat);

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Generated Test Scenarios"
        description="18 scenarios generated from JIRA-1245 acceptance criteria."
        icon={<FlaskConical className="size-5" />}
        actions={
          <>
            <Button variant="secondary" onClick={() => toast({ title: "Generating more scenarios", variant: "info" })}>
              <Plus className="size-4" /> Generate More
            </Button>
            <Button variant="secondary" onClick={() => toast({ title: "Regenerating scenarios", variant: "info" })}>
              <RefreshCw className="size-4" /> Regenerate
            </Button>
            <Button variant="gradient" onClick={() => toast({ title: "All scenarios approved", variant: "success" })}>
              <CheckCheck className="size-4" /> Approve All
            </Button>
            <Button variant="outline" onClick={() => toast({ title: "Exporting scenarios", variant: "info" })}>
              <Download className="size-4" /> Export
            </Button>
          </>
        }
      />

      <div className="flex items-center gap-3">
        <Badge variant="default" className="px-3 py-1">
          <Sparkles className="size-3" /> 18 scenarios generated
        </Badge>
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2">
        {["All", ...scenarioCategories].map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCat(cat)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
              activeCat === cat
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Scenario cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((s) => (
          <Card key={s.id} className="group transition-all hover:-translate-y-0.5 hover:shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-medium text-primary">{s.id}</span>
                <StatusPill status={s.status} />
              </div>
              <h3 className="mt-2 font-semibold">{s.title}</h3>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <Badge variant="secondary">{s.category}</Badge>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 border-t border-border pt-3 text-xs">
                <div>
                  <p className="text-muted-foreground">Priority</p>
                  <StatusPill status={s.priority} className="mt-0.5" />
                </div>
                <div>
                  <p className="text-muted-foreground">Risk</p>
                  <StatusPill status={s.risk} className="mt-0.5" />
                </div>
                <div>
                  <p className="text-muted-foreground">Coverage</p>
                  <p className="mt-0.5 font-medium">{s.coverage}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-primary" />
            <p className="text-sm">Scenarios approved. Ready to generate detailed test cases.</p>
          </div>
          <Button variant="gradient" onClick={() => router.push("/test-cases")}>
            Generate Test Cases <ArrowRight className="size-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
