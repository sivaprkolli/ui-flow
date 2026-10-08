"use client";

import { useState, useRef, useEffect } from "react";
import { Sparkles, X, Send, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const examplePrompts = [
  "Analyze JIRA-1245",
  "Generate negative test cases",
  "Automate TC-045",
  "Why did checkout fail?",
  "Fix all broken locators",
  "Run regression suite",
  "Show me high-risk requirements",
  "Generate release quality report",
];

interface AICard {
  title: string;
  reason: string;
  confidence?: number;
  evidence: string[];
  action: string;
}

interface Message {
  role: "user" | "agent";
  text?: string;
  card?: AICard;
}

const cannedResponses: Record<string, AICard> = {
  "why did checkout fail?": {
    title: "Checkout failure — TC-045",
    reason: "The Checkout button locator #checkout-button was removed during the UI redesign.",
    confidence: 98,
    evidence: ["DOM diff vs last passing run", "Visual screenshot diff", "Locator history"],
    action: "Apply self-healed role locator getByRole('button', { name: 'Checkout' })",
  },
  "fix all broken locators": {
    title: "Self-Healing — 3 broken locators",
    reason: "3 locators failed across Checkout, Search and Filter. Candidate role-based replacements found.",
    confidence: 96,
    evidence: ["#checkout-button → getByRole", "#searchBox → getByPlaceholder", ".filter-apply → getByRole"],
    action: "Apply all 3 fixes and re-run affected tests",
  },
  default: {
    title: "Understood — planning next steps",
    reason: "I mapped your request to the QA workflow and identified the relevant assets.",
    confidence: 92,
    evidence: ["Requirement graph", "Test case index", "Execution history"],
    action: "Proceed with the recommended action",
  },
};

export function CommandCenter() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "agent",
      text: "Hi Siva 👋 I'm your QA Agent. Ask me to analyze a requirement, generate tests, investigate failures or heal locators.",
    },
  ]);
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const send = (text: string) => {
    if (!text.trim()) return;
    const key = text.toLowerCase().trim();
    const card = cannedResponses[key] ?? cannedResponses.default;
    setMessages((m) => [...m, { role: "user", text }, { role: "agent", card }]);
    setInput("");
  };

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-fuchsia-500 px-5 py-3 text-sm font-semibold text-white shadow-lg ai-glow transition-transform hover:scale-105"
      >
        <Sparkles className="size-4" />
        Ask QA Agent
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 z-50 flex h-[600px] max-h-[80vh] w-[400px] max-w-[calc(100vw-3rem)] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl animate-fade-in">
          <div className="flex items-center justify-between border-b border-border bg-gradient-to-r from-primary/10 to-fuchsia-500/10 px-4 py-3">
            <div className="flex items-center gap-2.5">
              <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-fuchsia-500">
                <Sparkles className="size-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold">QA Agent</p>
                <p className="text-[11px] text-emerald-500">● Online · GPT-class reasoning</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="rounded-md p-1 hover:bg-accent">
              <X className="size-4" />
            </button>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto scrollbar-thin p-4">
            {messages.map((m, i) => (
              <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
                {m.text && (
                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm",
                      m.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground"
                    )}
                  >
                    {m.text}
                  </div>
                )}
                {m.card && <AgentCard card={m.card} />}
              </div>
            ))}

            {messages.length <= 1 && (
              <div className="space-y-2 pt-2">
                <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Try asking
                </p>
                <div className="flex flex-wrap gap-2">
                  {examplePrompts.map((p) => (
                    <button
                      key={p}
                      onClick={() => send(p)}
                      className="rounded-full border border-border bg-secondary/50 px-3 py-1.5 text-xs hover:bg-accent hover:text-accent-foreground"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          <div className="border-t border-border p-3">
            <div className="flex items-center gap-2 rounded-xl border border-border bg-secondary/50 px-3">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send(input)}
                placeholder="Ask the QA Agent anything..."
                className="h-11 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
              <Button size="icon" className="size-8" onClick={() => send(input)}>
                <Send className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function AgentCard({ card }: { card: AICard }) {
  return (
    <div className="w-full max-w-[92%] rounded-2xl border border-border bg-background p-3.5">
      <div className="flex items-center gap-2">
        <Sparkles className="size-4 text-primary" />
        <p className="text-sm font-semibold">{card.title}</p>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{card.reason}</p>

      {card.confidence !== undefined && (
        <div className="mt-3 flex items-center gap-2">
          <span className="text-[11px] text-muted-foreground">Confidence</span>
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
            <div className="h-full rounded-full bg-gradient-to-r from-primary to-fuchsia-500" style={{ width: `${card.confidence}%` }} />
          </div>
          <span className="text-[11px] font-semibold text-primary">{card.confidence}%</span>
        </div>
      )}

      <div className="mt-3 space-y-1">
        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Evidence</p>
        {card.evidence.map((e) => (
          <div key={e} className="flex items-center gap-2 text-xs text-foreground/80">
            <span className="size-1 rounded-full bg-primary" />
            {e}
          </div>
        ))}
      </div>

      <button className="mt-3 flex w-full items-center justify-between rounded-lg bg-primary/10 px-3 py-2 text-xs font-medium text-primary hover:bg-primary/15">
        {card.action}
        <ArrowRight className="size-3.5" />
      </button>
    </div>
  );
}
