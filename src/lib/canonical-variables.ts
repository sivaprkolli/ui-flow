export const VARIABLE_TYPES = [
  "static", "credential", "environment", "test_data", "generated",
  "synthetic", "dynamic", "correlated", "parameterized", "runtime",
] as const;

export type CanonicalVariableType = (typeof VARIABLE_TYPES)[number];
export type VariableScope = "test_case" | "suite" | "runtime";

export interface CanonicalVariable {
  variableId: string;
  name: string;
  type: CanonicalVariableType;
  description: string;
  required: boolean;
  source: string;
  scope: VariableScope;
  dataKey?: string;
  defaultValue?: string;
  generator?: string;
  environment?: "QA" | "UAT" | "PROD" | "Local";
  environmentValues?: Partial<Record<"QA" | "UAT" | "PROD" | "Local", string>>;
  format?: string;
  mask?: boolean;
  dependencies?: string[];
  validation?: string;
}

export interface ManualTestStep {
  step: number;
  instruction: string;
  variableIds: string[];
  automationStep: number;
}

export interface VariableValidationIssue {
  severity: "error" | "warning";
  code: "undefined_variable" | "duplicate_name" | "invalid_name" | "invalid_type" | "missing_source" | "missing_environment_mapping" | "unused_variable" | "credential_exposure" | "missing_dependency";
  message: string;
  variableId?: string;
}

export interface DuplicateCandidate {
  candidate: string;
  canonicalName: string;
  confidence: number;
  action: "reuse" | "review";
}

export interface ResolvedVariable {
  variableId: string;
  name: string;
  source: string;
  environment: string;
  valueReference: string;
  masked: boolean;
  dependencies: string[];
  status: "resolved" | "requires_runtime_value";
}

const namePattern = /^[a-z][a-z0-9_]*$/;
const aliases: Record<string, string> = {
  user_name: "username",
  login_username: "username",
  login_user: "username",
  user: "username",
  pwd: "password",
  pass_word: "password",
  product: "product_name",
  productname: "product_name",
  baseurl: "base_url",
};

export const testCaseGeneratorPrompt = `You are responsible for defining canonical test data variables.
Create meaningful lower_snake_case variable names. Once a variable name is established, treat it as immutable for the lifecycle of the Test Case. Do not create synonyms or duplicate variables. All test steps must reference the canonical variable using {{variable_name}}.`;

export const scriptGeneratorPrompt = `The Test Case Variable Registry is the authoritative source for test data variables. You MUST use the exact canonical variable names defined in the registry. Do NOT rename, abbreviate, translate, or create synonyms for variables. If a required variable is missing from the registry, report an error instead of inventing a variable.`;

export function toSnakeCase(value: string) {
  return value.trim()
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .replace(/[\s-]+/g, "_")
    .replace(/[^a-zA-Z0-9_]/g, "")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "")
    .toLowerCase();
}

export function canonicalizeVariableCandidate(candidate: string) {
  const normalized = toSnakeCase(candidate);
  return aliases[normalized] ?? normalized;
}

export function extractVariablesFromText(text: string, existing: CanonicalVariable[] = []) {
  const candidates = new Set<string>();
  Array.from(text.matchAll(/{{\s*([\w-]+)\s*}}/g)).forEach((match) => candidates.add(match[1]));
  const semanticPatterns: Array<[RegExp, string]> = [
    [/\busername\b/i, "username"],
    [/\bpassword\b/i, "password"],
    [/\b(?:search|find)\s+(?:for\s+)?(?:a\s+)?product\b/i, "product_name"],
    [/\b(?:open|navigate to)\s+(?:the\s+)?(?:application|site|url)\b/i, "base_url"],
    [/\bexpected\s+price\b/i, "expected_price"],
  ];
  semanticPatterns.forEach(([pattern, name]) => { if (pattern.test(text)) candidates.add(name); });
  return Array.from(candidates).map((candidate) => {
    const normalized = canonicalizeVariableCandidate(candidate);
    const exact = existing.find((variable) => variable.name === normalized);
    return { candidate, name: exact?.name ?? normalized, existingVariableId: exact?.variableId };
  });
}

export function detectDuplicateVariables(candidates: string[], existing: CanonicalVariable[]): DuplicateCandidate[] {
  const matches: DuplicateCandidate[] = [];
  candidates.forEach((candidate) => {
    const normalized = canonicalizeVariableCandidate(candidate);
    const exact = existing.find((variable) => variable.name === normalized);
    if (exact) {
      matches.push({ candidate, canonicalName: exact.name, confidence: 1, action: "reuse" });
      return;
    }
    const close = existing.find((variable) => variable.name.includes(normalized) || normalized.includes(variable.name));
    if (close) matches.push({ candidate, canonicalName: close.name, confidence: 0.68, action: "review" });
  });
  return matches;
}

export function validateCanonicalVariables(
  testCaseId: string,
  variables: CanonicalVariable[],
  steps: ManualTestStep[],
  allowUnusedVariables = false,
): VariableValidationIssue[] {
  const issues: VariableValidationIssue[] = [];
  const names = new Set<string>();
  const ids = new Set<string>();
  const referencedIds = new Set(steps.flatMap((step) => step.variableIds));
  const referencedNames = new Set(steps.flatMap((step) => extractVariablesFromText(step.instruction).map((entry) => entry.name)));

  variables.forEach((variable) => {
    if (ids.has(variable.variableId)) issues.push({ severity: "error", code: "duplicate_name", variableId: variable.variableId, message: `Duplicate variable ID ${variable.variableId}.` });
    ids.add(variable.variableId);
    if (names.has(variable.name)) issues.push({ severity: "error", code: "duplicate_name", variableId: variable.variableId, message: `Duplicate canonical name ${variable.name}.` });
    names.add(variable.name);
    if (!namePattern.test(variable.name)) issues.push({ severity: "error", code: "invalid_name", variableId: variable.variableId, message: `${variable.name} must use lower_snake_case.` });
    if (!VARIABLE_TYPES.includes(variable.type)) issues.push({ severity: "error", code: "invalid_type", variableId: variable.variableId, message: `${variable.name} has an unsupported type.` });
    if (!variable.source) issues.push({ severity: "error", code: "missing_source", variableId: variable.variableId, message: `${variable.name} is missing a data source.` });
    if (variable.type === "environment" && !variable.environmentValues && !variable.defaultValue) issues.push({ severity: "error", code: "missing_environment_mapping", variableId: variable.variableId, message: `${variable.name} requires an environment mapping.` });
    if (variable.type === "credential" && variable.defaultValue) issues.push({ severity: "error", code: "credential_exposure", variableId: variable.variableId, message: `${variable.name} must not include a credential default value.` });
    if (!allowUnusedVariables && !referencedIds.has(variable.variableId) && !referencedNames.has(variable.name)) issues.push({ severity: "warning", code: "unused_variable", variableId: variable.variableId, message: `${variable.name} is not used by a manual step.` });
    (variable.dependencies ?? []).forEach((dependency) => {
      if (!variables.some((item) => item.variableId === dependency)) issues.push({ severity: "error", code: "missing_dependency", variableId: variable.variableId, message: `${variable.name} depends on undefined ${dependency}.` });
    });
  });

  steps.forEach((step) => {
    extractVariablesFromText(step.instruction).forEach(({ name }) => {
      if (!variables.some((variable) => variable.name === name)) issues.push({ severity: "error", code: "undefined_variable", message: `Test Case ${testCaseId} references {{${name}}} but no canonical registry entry exists.` });
    });
    step.variableIds.forEach((variableId) => {
      if (!variables.some((variable) => variable.variableId === variableId)) issues.push({ severity: "error", code: "undefined_variable", message: `Manual step ${step.step} references undefined ${variableId}.` });
    });
  });
  return issues;
}

export function resolveCanonicalVariable(variable: CanonicalVariable, environment: "QA" | "UAT" | "PROD" | "Local"): ResolvedVariable {
  const environmentValue = variable.environmentValues?.[environment];
  const isSecret = variable.type === "credential" || variable.mask === true;
  return {
    variableId: variable.variableId,
    name: variable.name,
    source: variable.source,
    environment,
    valueReference: environmentValue ?? variable.dataKey ?? variable.generator ?? `${variable.source}:${variable.name}`,
    masked: isSecret,
    dependencies: variable.dependencies ?? [],
    status: variable.type === "runtime" || variable.type === "dynamic" ? "requires_runtime_value" : "resolved",
  };
}

export type AutomationPlatform = "web" | "mobile" | "api" | "performance";

export function generateCanonicalAutomationScript(platform: AutomationPlatform, variables: CanonicalVariable[]) {
  const names = variables.map((variable) => variable.name);
  const has = (name: string) => names.includes(name);
  const bindings = names.map((name) => `const ${name} = testData["${name}"];`).join("\n");
  const pythonBindings = names.map((name) => `${name} = data["${name}"]`).join("\n");
  const required = variables.filter((variable) => variable.required).map((variable) => variable.variableId);
  const header = `// Canonical registry contract: ${variables.map((variable) => `${variable.variableId} → ${variable.name}`).join(", ")}\n// Required variable IDs: ${required.join(", ")}`;
  const webActions = [
    has("base_url") ? "await page.goto(base_url);" : "",
    has("username") ? "await page.getByLabel(\"Username\").fill(username);" : "",
    has("password") ? "await page.getByLabel(\"Password\").fill(password);" : "",
    has("product_name") ? "await page.getByPlaceholder(\"Search\").fill(product_name);" : "",
    has("customer_id") ? "await page.getByTestId(\"customer-id\").fill(customer_id);" : "",
  ].filter(Boolean).join("\n");
  if (platform === "web") return `${header}\n${bindings}\n\n${webActions}`;
  if (platform === "mobile") return `${header}\n${pythonBindings}\n\n${has("username") ? "driver.find_element(AppiumBy.ACCESSIBILITY_ID, \"username\").send_keys(username)\n" : ""}${has("password") ? "driver.find_element(AppiumBy.ACCESSIBILITY_ID, \"password\").send_keys(password)\n" : ""}${has("product_name") ? "driver.find_element(AppiumBy.ACCESSIBILITY_ID, \"search\").send_keys(product_name)" : ""}`;
  if (platform === "api") return `${header}\n${pythonBindings}\n\npayload = {\n${variables.filter((variable) => variable.name !== "base_url").map((variable) => `  \"${variable.name}\": ${variable.name},`).join("\n")}\n}\nresponse = client.post("/workflow", json=payload)`;
  return `${header}\n${names.map((name) => `const ${name} = __ENV.${name};`).join("\n")}\n\nhttp.post(\`${has("base_url") ? "${base_url}" : "https://example.test"}/workflow\`, JSON.stringify({ ${names.filter((name) => name !== "base_url").join(", ")} }));`;
}


export interface BddScenarioInput {
  testCaseId: string;
  requirementId: string;
  title: string;
  variables: CanonicalVariable[];
  manualSteps: ManualTestStep[];
}

function bddInstruction(instruction: string) {
  const text = instruction.trim();
  if (/^navigate to\s+/i.test(text)) return text.replace(/^navigate to\s+/i, "I navigate to ");
  if (/^enter\s+/i.test(text)) return text.replace(/^enter\s+/i, "I enter ");
  if (/^click\s+/i.test(text)) return text.replace(/^click\s+/i, "I click ");
  if (/^search for\s+/i.test(text)) return text.replace(/^search for\s+/i, "I search for ");
  if (/^load\s+/i.test(text)) return text.replace(/^load\s+/i, "I load ");
  if (/^complete\s+/i.test(text)) return text.replace(/^complete\s+/i, "I complete ");
  if (/^submit\s+/i.test(text)) return text.replace(/^submit\s+/i, "I submit ");
  if (/^verify\s+/i.test(text)) return text.replace(/^verify\s+/i, "I verify ");
  return `I perform ${text.charAt(0).toLowerCase()}${text.slice(1)}`;
}

export function generateBddFeature(input: BddScenarioInput) {
  const contract = input.variables.map((variable) => `# ${variable.variableId} → ${variable.name}`).join("\n");
  const steps = input.manualSteps.map((step, index) => {
    const instruction = bddInstruction(step.instruction);
    const keyword = index === 0 ? "Given" : /^I (verify|expect)/i.test(instruction) ? "Then" : index === input.manualSteps.length - 1 && /^I (verify|complete)/i.test(instruction) ? "Then" : "When";
    return `    ${keyword} ${instruction}`;
  }).join("\n");
  return `# Canonical variable registry — do not rename variables\n${contract}\n@${input.testCaseId} @${input.requirementId}\nFeature: ${input.title}\n\n  Scenario: ${input.title}\n${steps}`;
}

export function generateBddStepDefinitions(variables: CanonicalVariable[], steps: ManualTestStep[]) {
  const header = `import { Given, When, Then } from "@cucumber/cucumber";\n\n// Canonical registry contract: ${variables.map((variable) => `${variable.variableId} → ${variable.name}`).join(", ")}`;
  const definitions = steps.map((step, index) => {
    const instruction = bddInstruction(step.instruction);
    const keyword = index === 0 ? "Given" : /^I (verify|expect)/i.test(instruction) ? "Then" : "When";
    const variableNames = step.variableIds.map((id) => variables.find((variable) => variable.variableId === id)?.name).filter(Boolean) as string[];
    const action = variableNames.includes("base_url")
      ? "await this.page.goto(this.testData[\"base_url\"]);"
      : variableNames.includes("username")
        ? "await this.page.getByLabel(\"Username\").fill(this.testData[\"username\"]);"
        : variableNames.includes("password")
          ? "await this.page.getByLabel(\"Password\").fill(this.testData[\"password\"]);"
          : variableNames.includes("product_name")
            ? "await this.page.getByPlaceholder(\"Search\").fill(this.testData[\"product_name\"]);"
            : `await this.executeCanonicalStep([${variableNames.map((name) => `\"${name}\"`).join(", ")}]);`;
    return `${keyword}(\"${instruction}\", async function () {\n  ${action}\n});`;
  }).join("\n\n");
  return `${header}\n\n${definitions}`;
}
