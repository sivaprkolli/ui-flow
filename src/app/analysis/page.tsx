"use client";

import { useRouter } from "next/navigation";
import {
  Brain, Target, Users, ListChecks, CheckCircle2, ShieldAlert, Sparkles,
  ArrowRight, FlaskConical,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AIProcessing } from "@/components/ai/processing";
import { useToast } from "@/components/ui/toast";

const acceptanceCriteria = [
  "Valid username and password",
  "Invalid username",
  "Invalid password",
  "Empty username",
  "Empty password",
  "Account locked after repeated failures",
  "Session timeout handling",
];

const understanding = [
  { icon: Target, title: "Business Objective", body: "Allow registered users to securely access the application." },
  { icon: Users, title: "Actors", body: "Registered User · Authentication Service" },
  { icon: ListChecks, title: "Preconditions", body: "User account exists · Application is available" },
  { icon: CheckCircle2, title: "Expected Outcome", body: "User successfully logs into the application." },
];

const risks = ["Authentication failure", "Session management", "Security validation", "Error message validation"];

export default function AnalysisPage() {
  const router = useRouter();
  const { toast } = useToast();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Requirement Analysis"
        description="JIRA-1245 · User Login"
        icon={<Brain className="size-5" />}
        actions={
          <Badge variant="success">
            <Sparkles className="size-3" /> Analysis Complete
          </Badge>
        }
      />

      {/* Requirement text */}
      <Card>
        <CardContent className="p-5">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Requirement</p>
          <blockquote className="border-l-2 border-primary pl-4 text-lg font-medium leading-relaxed">
            As a registered user, I should be able to login using valid credentials.
          </blockquote>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* AI understanding */}
          <div>
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <Sparkles className="size-4 text-primary" /> AI Understanding
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {understanding.map((u) => (
                <Card key={u.title}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 text-primary">
                      <u.icon className="size-4" />
                      <p className="text-sm font-medium text-foreground">{u.title}</p>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{u.body}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Acceptance criteria */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Acceptance Criteria</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2 sm:grid-cols-2">
              {acceptanceCriteria.map((c) => (
                <div key={c} className="flex items-center gap-2 rounded-lg border border-border bg-secondary/30 px-3 py-2 text-sm">
                  <CheckCircle2 className="size-4 shrink-0 text-success" />
                  {c}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Processing demo */}
          <AIProcessing
            title="AI is analyzing your requirement..."
            steps={[
              "Extracting business rules",
              "Identifying actors",
              "Extracting acceptance criteria",
              "Detecting edge cases",
              "Identifying risks",
              "Preparing test scenarios",
            ]}
          />

          {/* Risk analysis */}
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <ShieldAlert className="size-4 text-warning" /> AI Risk Analysis
              </CardTitle>
              <Badge variant="warning">Medium</Badge>
            </CardHeader>
            <CardContent className="space-y-2">
              {risks.map((r) => (
                <div key={r} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="size-1.5 rounded-full bg-warning" /> {r}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recommendation */}
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 text-primary">
                <Sparkles className="size-4" />
                <p className="text-sm font-medium">AI Recommendation</p>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                &ldquo;I recommend creating <span className="font-semibold text-foreground">18 test cases</span> covering
                positive, negative, boundary and security scenarios.&rdquo;
              </p>
              <Button
                variant="gradient"
                className="mt-4 w-full"
                onClick={() => {
                  toast({ title: "Generating test scenarios", description: "18 scenarios queued.", variant: "success" });
                  setTimeout(() => router.push("/scenarios"), 600);
                }}
              >
                <FlaskConical className="size-4" /> Generate Test Cases <ArrowRight className="size-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
