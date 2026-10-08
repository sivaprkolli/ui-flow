import {
  canonicalVariableRegistry, testCases, type TestCase,
} from "@/lib/mock-data";
import {
  canonicalizeVariableCandidate, detectDuplicateVariables, generateBddFeature, generateBddStepDefinitions, generateCanonicalAutomationScript, resolveCanonicalVariable,
  validateCanonicalVariables, type CanonicalVariable,
} from "@/lib/canonical-variables";

const caseVariables = new Map(testCases.map((testCase) => [testCase.id, [...testCase.variables]]));

export function getTestCaseOrThrow(testCaseId: string): TestCase {
  const testCase = testCases.find((item) => item.id === testCaseId);
  if (!testCase) throw new Error(`Test case ${testCaseId} was not found.`);
  return { ...testCase, variables: caseVariables.get(testCaseId) ?? [] };
}

export function getVariables(testCaseId: string) {
  return getTestCaseOrThrow(testCaseId).variables;
}

export function addOrReuseVariable(testCaseId: string, input: Omit<CanonicalVariable, "variableId" | "name"> & { name: string }) {
  const current = getVariables(testCaseId);
  const canonicalName = canonicalizeVariableCandidate(input.name);
  const duplicate = detectDuplicateVariables([input.name], [...canonicalVariableRegistry, ...current])[0];
  if (duplicate?.action === "reuse") {
    const reused = [...canonicalVariableRegistry, ...current].find((variable) => variable.name === duplicate.canonicalName)!;
    if (!current.some((variable) => variable.variableId === reused.variableId)) caseVariables.set(testCaseId, [...current, reused]);
    return { status: "reused" as const, variable: reused, duplicate };
  }
  if (duplicate?.action === "review") return { status: "review" as const, duplicate };
  const nextId = `VAR-${String(canonicalVariableRegistry.length + current.length + 1).padStart(3, "0")}`;
  const variable: CanonicalVariable = { ...input, variableId: nextId, name: canonicalName };
  caseVariables.set(testCaseId, [...current, variable]);
  return { status: "created" as const, variable };
}

export function getVariableOrThrow(variableId: string) {
  const variable = [...canonicalVariableRegistry, ...Array.from(caseVariables.values()).flat()]
    .find((item) => item.variableId === variableId);
  if (!variable) throw new Error(`Variable ${variableId} was not found.`);
  return variable;
}

export function updateVariable(variableId: string, patch: Partial<CanonicalVariable>) {
  const existing = getVariableOrThrow(variableId);
  if (patch.name && patch.name !== existing.name) throw new Error("Canonical variable names are immutable. Create a reviewed migration instead.");
  const updated = { ...existing, ...patch, variableId: existing.variableId, name: existing.name };
  caseVariables.forEach((variables, testCaseId) => {
    caseVariables.set(testCaseId, variables.map((variable) => variable.variableId === variableId ? updated : variable));
  });
  return updated;
}

export function validateVariables(testCaseId: string) {
  const testCase = getTestCaseOrThrow(testCaseId);
  return validateCanonicalVariables(testCase.id, testCase.variables, testCase.manualSteps);
}

export function resolveVariables(testCaseId: string, environment: "QA" | "UAT" | "PROD" | "Local" = "QA") {
  const testCase = getTestCaseOrThrow(testCaseId);
  const issues = validateCanonicalVariables(testCase.id, testCase.variables, testCase.manualSteps);
  if (issues.some((issue) => issue.severity === "error")) return { testCaseId, environment, status: "blocked" as const, issues, variables: [] };
  return { testCaseId, environment, status: "resolved" as const, issues, variables: testCase.variables.map((variable) => resolveCanonicalVariable(variable, environment)) };
}

export function getVariableUsage(variableId: string) {
  const variable = getVariableOrThrow(variableId);
  return {
    variable,
    testCases: testCases.filter((testCase) => getVariables(testCase.id).some((item) => item.variableId === variableId)).map((testCase) => ({ id: testCase.id, title: testCase.title })),
    manualSteps: testCases.flatMap((testCase) => testCase.manualSteps.filter((step) => step.variableIds.includes(variableId)).map((step) => ({ testCaseId: testCase.id, step: step.step, instruction: step.instruction, automationStep: step.automationStep }))),
    automationTargets: ["web", "mobile", "api", "performance"],
  };
}

export function getArtifacts(testCaseId: string) {
  const testCase = getTestCaseOrThrow(testCaseId);
  return {
    "test_case.json": { test_case_id: testCase.id, title: testCase.title, variables: testCase.variables },
    "variable_registry.json": testCase.variables,
    "manual_test_case.json": testCase.manualSteps,
    "automation_test_data.json": testCase.variables.map((variable) => ({ variable_id: variable.variableId, name: variable.name, source: variable.source, data_key: variable.dataKey, mask: variable.mask ?? false })),
    "automation_script": {
      web_playwright: generateCanonicalAutomationScript("web", testCase.variables),
      mobile_appium: generateCanonicalAutomationScript("mobile", testCase.variables),
      api: generateCanonicalAutomationScript("api", testCase.variables),
      performance: generateCanonicalAutomationScript("performance", testCase.variables),
    },
    "bdd_feature.feature": generateBddFeature({ testCaseId: testCase.id, requirementId: testCase.requirement, title: testCase.title, variables: testCase.variables, manualSteps: testCase.manualSteps }),
    "bdd_step_definitions.ts": generateBddStepDefinitions(testCase.variables, testCase.manualSteps),
    "traceability.json": testCase.manualSteps.flatMap((step) => step.variableIds.map((variableId) => ({ requirement_id: testCase.requirement, test_case_id: testCase.id, variable_id: variableId, variable_name: testCase.variables.find((variable) => variable.variableId === variableId)?.name, manual_step: step.step, automation_step: step.automationStep }))),
  };
}
