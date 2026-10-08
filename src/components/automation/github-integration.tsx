"use client";

import { useState } from "react";
import {
  Github, GitBranch, GitCommit, GitPullRequest, RefreshCw, Check, ChevronDown,
  ExternalLink, CircleDot, Upload,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

const repo = {
  owner: "acme-qa",
  name: "qa-automation",
  defaultBranch: "main",
  visibility: "Private",
  url: "https://github.com/acme-qa/qa-automation",
};

const branches = [
  "main",
  "qa/ai-generated-tests",
  "qa/jira-1245-login",
  "qa/req-103-checkout",
];

const recentCommits = [
  { sha: "a1b2c3d", message: "AI: add valid-login.spec.ts + LoginPage", author: "qa-agent[bot]", time: "2m ago", status: "ci-passed" },
  { sha: "e4f5g6h", message: "AI: heal CheckoutPage locator (role-based)", author: "qa-agent[bot]", time: "18m ago", status: "ci-passed" },
  { sha: "i7j8k9l", message: "AI: regenerate search fixtures", author: "qa-agent[bot]", time: "1h ago", status: "ci-running" },
];

const ciStyle: Record<string, { label: string; variant: any; dot: string }> = {
  "ci-passed": { label: "CI passed", variant: "success", dot: "bg-success" },
  "ci-running": { label: "CI running", variant: "warning", dot: "bg-warning animate-pulse" },
  "ci-failed": { label: "CI failed", variant: "danger", dot: "bg-danger" },
};

export function GithubIntegration() {
  const { toast } = useToast();
  const [branch, setBranch] = useState("qa/ai-generated-tests");
  const [branchOpen, setBranchOpen] = useState(false);
  const [pushing, setPushing] = useState(false);

  const push = () => {
    setPushing(true);
    toast({ title: "Pushing to GitHub", description: `${repo.owner}/${repo.name} · ${branch}`, variant: "info" });
    setTimeout(() => {
      setPushing(false);
      toast({ title: "Pushed 12 files", description: `Commit a1b2c3d on ${branch}`, variant: "success" });
    }, 1400);
  };

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-base">
          <Github className="size-4" /> GitHub Integration
        </CardTitle>
        <Badge variant="success">
          <Check className="size-3" /> Connected
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Repository */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-secondary/30 px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-lg bg-foreground text-background">
              <Github className="size-4" />
            </div>
            <div>
              <p className="flex items-center gap-1.5 text-sm font-medium">
                {repo.owner}/{repo.name}
                <a href={repo.url} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary">
                  <ExternalLink className="size-3.5" />
                </a>
              </p>
              <p className="text-xs text-muted-foreground">
                {repo.visibility} · default {repo.defaultBranch}
              </p>
            </div>
          </div>
          <Badge variant="secondary">
            <CircleDot className="size-3 text-success" /> In sync
          </Badge>
        </div>

        {/* Branch selector + push */}
        <div className="flex flex-wrap items-end gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <label className="mb-1 block text-xs text-muted-foreground">Target branch</label>
            <button
              onClick={() => setBranchOpen((o) => !o)}
              className="flex w-full items-center justify-between gap-2 rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm"
            >
              <span className="flex items-center gap-2">
                <GitBranch className="size-4 text-primary" />
                {branch}
              </span>
              <ChevronDown className={cn("size-4 text-muted-foreground transition-transform", branchOpen && "rotate-180")} />
            </button>
            {branchOpen && (
              <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-lg border border-border bg-popover shadow-lg animate-fade-in">
                {branches.map((b) => (
                  <button
                    key={b}
                    onClick={() => { setBranch(b); setBranchOpen(false); }}
                    className={cn(
                      "flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-accent",
                      b === branch && "text-primary"
                    )}
                  >
                    <GitBranch className="size-3.5" /> {b}
                    {b === branch && <Check className="ml-auto size-3.5" />}
                  </button>
                ))}
              </div>
            )}
          </div>
          <Button variant="gradient" disabled={pushing} onClick={push}>
            {pushing ? <RefreshCw className="size-4 animate-spin" /> : <Upload className="size-4" />}
            {pushing ? "Pushing..." : "Push to GitHub"}
          </Button>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          <Button variant="secondary" size="sm" onClick={() => toast({ title: "Committed 12 files", description: branch, variant: "success" })}>
            <GitCommit className="size-3.5" /> Commit
          </Button>
          <Button variant="secondary" size="sm" onClick={() => toast({ title: "Pull request opened", description: "PR #128 → main", variant: "success" })}>
            <GitPullRequest className="size-3.5" /> Open PR
          </Button>
          <Button variant="outline" size="sm" onClick={() => toast({ title: "Syncing with remote", variant: "info" })}>
            <RefreshCw className="size-3.5" /> Sync
          </Button>
        </div>

        {/* Recent commits */}
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Recent AI commits
          </p>
          <div className="space-y-2">
            {recentCommits.map((c) => {
              const ci = ciStyle[c.status];
              return (
                <div key={c.sha} className="flex items-start gap-3 rounded-lg border border-border bg-secondary/20 px-3 py-2">
                  <GitCommit className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm">{c.message}</p>
                    <p className="text-xs text-muted-foreground">
                      <code className="font-mono">{c.sha}</code> · {c.author} · {c.time}
                    </p>
                  </div>
                  <Badge variant={ci.variant} className="shrink-0">
                    <span className={cn("size-1.5 rounded-full", ci.dot)} /> {ci.label}
                  </Badge>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
