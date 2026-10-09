export interface RecordedInteraction {
  id: number;
  time: string;
  action: string;
  target: string;
  selector: string;
  testStep: string;
  artifacts: number;
}

export interface RecordedStepDraft extends RecordedInteraction {
  source: "manual_recorder" | "business_flow";
  createdAt: string;
}

const keyFor = (testCaseId: string) => `qa-agent:recorder-step-drafts:${testCaseId}`;

export function saveRecordedStepDrafts(testCaseId: string, source: RecordedStepDraft["source"], interactions: RecordedInteraction[]) {
  if (typeof window === "undefined") return;
  const existing = readRecordedStepDrafts(testCaseId);
  const drafts = interactions.map((interaction) => ({ ...interaction, source, createdAt: new Date().toISOString() }));
  window.localStorage.setItem(keyFor(testCaseId), JSON.stringify([...existing, ...drafts]));
}

export function readRecordedStepDrafts(testCaseId: string): RecordedStepDraft[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(keyFor(testCaseId));
    return raw ? JSON.parse(raw) as RecordedStepDraft[] : [];
  } catch {
    return [];
  }
}

export function clearRecordedStepDrafts(testCaseId: string) {
  if (typeof window !== "undefined") window.localStorage.removeItem(keyFor(testCaseId));
}
