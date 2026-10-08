import { describe, expect, it } from "vitest";
import {
  detectDuplicateVariables, extractVariablesFromText, generateBddFeature, generateBddStepDefinitions, generateCanonicalAutomationScript,
  validateCanonicalVariables, type CanonicalVariable,
} from "../src/lib/canonical-variables";

const variables: CanonicalVariable[] = [
  { variableId: "VAR-001", name: "username", type: "credential", description: "User", required: true, source: "test_data_repository", scope: "test_case", dataKey: "qa_user_01", mask: true },
  { variableId: "VAR-002", name: "password", type: "credential", description: "Password", required: true, source: "secret_manager", scope: "test_case", dataKey: "qa_user_01_password", mask: true },
  { variableId: "VAR-003", name: "product_name", type: "test_data", description: "Product", required: true, source: "test_data_repository", scope: "test_case", dataKey: "catalog.product_name" },
];

describe("canonical variable registry", () => {
  it("extracts semantic username and password variables", () => {
    expect(extractVariablesFromText("Enter username and password.", variables).map((entry) => entry.name)).toEqual(["username", "password"]);
  });

  it("reuses username for duplicate semantic names", () => {
    expect(detectDuplicateVariables(["user_name", "userName", "login_username"], variables)).toEqual([
      { candidate: "user_name", canonicalName: "username", confidence: 1, action: "reuse" },
      { candidate: "userName", canonicalName: "username", confidence: 1, action: "reuse" },
      { candidate: "login_username", canonicalName: "username", confidence: 1, action: "reuse" },
    ]);
  });

  it("uses product_name exactly in generated web script", () => {
    const script = generateCanonicalAutomationScript("web", variables);
    expect(script).toContain('testData["product_name"]');
    expect(script).toContain("VAR-003 → product_name");
    expect(script).not.toMatch(/userName|login_user|\bproduct\s*=/);
  });

  it("fails validation for an undefined manual-step variable", () => {
    const issues = validateCanonicalVariables("TC-001", variables, [{ step: 1, instruction: "Search {{customer_id}}", variableIds: [], automationStep: 1 }]);
    expect(issues).toContainEqual(expect.objectContaining({ code: "undefined_variable", severity: "error" }));
  });

  it("preserves each ID/name across web, mobile, API and performance scripts", () => {
    (["web", "mobile", "api", "performance"] as const).forEach((platform) => {
      const script = generateCanonicalAutomationScript(platform, variables);
      variables.forEach((variable) => {
        expect(script).toContain(variable.variableId);
        expect(script).toContain(variable.name);
      });
    });
  });

  it("emits BDD feature and Cucumber steps with canonical bindings", () => {
    const steps = [
      { step: 1, instruction: "Navigate to {{base_url}}", variableIds: ["VAR-001"], automationStep: 1 },
      { step: 2, instruction: "Enter {{username}}", variableIds: ["VAR-002"], automationStep: 2 },
      { step: 3, instruction: "Search for {{product_name}}", variableIds: ["VAR-003"], automationStep: 3 },
    ];
    const feature = generateBddFeature({ testCaseId: "TC-001", requirementId: "REQ-100", title: "Login and search", variables, manualSteps: steps });
    const definitions = generateBddStepDefinitions(variables, steps);
    expect(feature).toContain("@TC-001 @REQ-100");
    expect(feature).toContain("Given I navigate to {{base_url}}");
    expect(feature).toContain("When I enter {{username}}");
    expect(feature).toContain("When I search for {{product_name}}");
    expect(feature).toContain("# VAR-003 → product_name");
    expect(definitions).toContain('this.testData["username"]');
    expect(definitions).toContain('this.testData["product_name"]');
    expect(definitions).toContain("VAR-003 → product_name");
    expect(definitions).not.toMatch(/userName|login_user/);
  });

  it("never embeds a plaintext credential default in a valid registry", () => {
    const insecure: CanonicalVariable[] = [{ ...variables[1], defaultValue: "plaintext-password" }];
    const issues = validateCanonicalVariables("TC-001", insecure, [{ step: 1, instruction: "Enter {{password}}", variableIds: ["VAR-002"], automationStep: 1 }]);
    expect(issues).toContainEqual(expect.objectContaining({ code: "credential_exposure", severity: "error" }));
    expect(generateCanonicalAutomationScript("web", variables)).not.toContain("plaintext-password");
  });
});
