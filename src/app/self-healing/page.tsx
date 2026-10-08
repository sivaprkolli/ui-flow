"use client";

import { HeartPulse, Sparkles, Check, X, Eye, ArrowRight, XCircle } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusPill } from "@/components/ui/status-pill";
import { useToast } from "@/components/ui/toast";
import { healingHistory } from "@/lib/mock-data";

export default function SelfHealingPage() {
  const { toast } = useToast();

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Self-Healing"
        description="Autonomous locator repair keeping your automation suite green."
        icon={<HeartPulse className="size-5" />}
        actions={<Badge variant="success"><Sparkles className="size-3" /> Healing Active</Badge>}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard value="17" label="Tests Healed" accent="text-emerald-400" />
        <MetricCard value="94%" label="Healing Success Rate" accent="text-primary" />
        <MetricCard value="12 min" label="Estimated Time Saved" accent="text-sky-400" />
      </div>

      {/* Healing example */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="size-4 text-primary" /> Latest Healing — Checkout
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-danger/30 bg-danger/5 p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Before</p>
                <Badge variant="danger"><XCircle className="size-3" /> Broken</Badge>
              </div>
              <div className="mt-3 rounded-lg bg-background p-3 font-mono text-sm">#checkout-button</div>
              <div className="mt-3 flex h-28 items-center justify-center rounded-lg border border-dashed border-border bg-secondary/40 text-xs text-muted-foreground">
                DOM / Screenshot — element not found
              </div>
            </div>
            <div className="rounded-xl border border-success/30 bg-success/5 p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">After</p>
                <Badge variant="success">Confidence 98%</Badge>
              </div>
              <div className="mt-3 rounded-lg bg-background p-3 font-mono text-sm">
                getByRole(&apos;button&apos;, {"{"} name: &apos;Checkout&apos; {"}"})
              </div>
              <div className="mt-3 flex h-28 items-center justify-center rounded-lg border border-dashed border-success/40 bg-success/5 text-xs text-success">
                DOM / Screenshot — element located ✓
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="success" onClick={() => toast({ title: "Fix accepted", description: "Applied to CheckoutPage.", variant: "success" })}>
              <Check className="size-4" /> Accept Fix
            </Button>
            <Button variant="secondary" onClick={() => toast({ title: "Fix rejected", variant: "warning" })}>
              <X className="size-4" /> Reject
            </Button>
            <Button variant="outline" onClick={() => toast({ title: "Viewing diff", variant: "info" })}>
              <Eye className="size-4" /> View Changes
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Self-Healing History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-5 py-3 font-medium">Test</th>
                  <th className="px-5 py-3 font-medium">Broken Locator</th>
                  <th className="px-5 py-3 font-medium">AI Fix</th>
                  <th className="px-5 py-3 font-medium">Confidence</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {healingHistory.map((h) => (
                  <tr key={h.id} className="border-b border-border/60 last:border-0 hover:bg-accent/40">
                    <td className="px-5 py-3 font-medium">{h.test}</td>
                    <td className="px-5 py-3">
                      <code className="rounded bg-danger/10 px-1.5 py-0.5 font-mono text-xs text-danger">{h.brokenLocator}</code>
                    </td>
                    <td className="px-5 py-3">
                      <code className="rounded bg-success/10 px-1.5 py-0.5 font-mono text-xs text-success">{h.aiFix}</code>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-secondary">
                          <div className="h-full rounded-full bg-gradient-to-r from-primary to-fuchsia-500" style={{ width: `${h.confidence}%` }} />
                        </div>
                        <span className="text-xs font-medium tabular-nums">{h.confidence}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-3"><StatusPill status={h.status} /></td>
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

function MetricCard({ value, label, accent }: { value: string; label: string; accent: string }) {
  return (
    <Card className="p-5">
      <p className={`text-4xl font-semibold ${accent}`}>{value}</p>
      <p className="mt-1 text-sm text-muted-foreground">{label}</p>
    </Card>
  );
}
