"use client";

import { useState } from "react";
import { Settings, Plug, Bot, Bell, Check } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const integrations = [
  { name: "Jira", connected: true },
  { name: "Confluence", connected: true },
  { name: "GitHub", connected: true },
  { name: "Azure DevOps", connected: true },
  { name: "Playwright", connected: true },
  { name: "Selenium", connected: false },
  { name: "Appium", connected: false },
  { name: "BrowserStack", connected: true },
];

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={cn("relative h-6 w-11 rounded-full transition-colors", on ? "bg-primary" : "bg-secondary")}
    >
      <span className={cn("absolute top-0.5 size-5 rounded-full bg-white transition-transform", on ? "translate-x-5" : "translate-x-0.5")} />
    </button>
  );
}

export default function SettingsPage() {
  const [prefs, setPrefs] = useState({ autoHeal: true, autoDefect: true, notify: true, autoRun: false });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Configure integrations, agent behaviour and notifications."
        icon={<Settings className="size-5" />}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Plug className="size-4 text-primary" /> Integrations
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {integrations.map((i) => (
            <div key={i.name} className="flex items-center justify-between rounded-lg border border-border bg-secondary/30 px-4 py-3">
              <span className="font-medium">{i.name}</span>
              {i.connected ? (
                <Badge variant="success"><Check className="size-3" /> Connected</Badge>
              ) : (
                <Badge variant="outline">Connect</Badge>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Bot className="size-4 text-primary" /> AI Agent Behaviour
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <PrefRow label="Auto self-heal broken locators" desc="Apply high-confidence fixes automatically" on={prefs.autoHeal} onToggle={() => setPrefs((p) => ({ ...p, autoHeal: !p.autoHeal }))} />
            <PrefRow label="Auto-create defects" desc="Raise defects when tests fail after healing" on={prefs.autoDefect} onToggle={() => setPrefs((p) => ({ ...p, autoDefect: !p.autoDefect }))} />
            <PrefRow label="Auto-run on requirement import" desc="Kick off analysis immediately" on={prefs.autoRun} onToggle={() => setPrefs((p) => ({ ...p, autoRun: !p.autoRun }))} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Bell className="size-4 text-primary" /> Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <PrefRow label="Execution notifications" desc="Notify on pass, fail and healing events" on={prefs.notify} onToggle={() => setPrefs((p) => ({ ...p, notify: !p.notify }))} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function PrefRow({ label, desc, on, onToggle }: { label: string; desc: string; on: boolean; onToggle: () => void }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <Toggle on={on} onToggle={onToggle} />
    </div>
  );
}
