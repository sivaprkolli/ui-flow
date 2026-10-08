import { describe, expect, it } from "vitest";
import { getArtifacts, getVariableUsage, resolveVariables, validateVariables } from "../src/lib/variable-registry-store";

describe("test case variable registry integration", () => {
  it("resolves TC-001 canonical variables for QA without exposing secret values", () => {
    const result = resolveVariables("TC-001", "QA");
    expect(result.status).toBe("resolved");
    expect(result.variables).toEqual(expect.arrayContaining([
      expect.objectContaining({ variableId: "VAR-002", name: "username", masked: true, valueReference: "qa_user_01" }),
      expect.objectContaining({ variableId: "VAR-003", name: "password", masked: true, valueReference: "qa_user_01_password" }),
      expect.objectContaining({ variableId: "VAR-004", name: "product_name" }),
    ]));
    expect(JSON.stringify(result)).not.toContain("plaintext-password");
  });

  it("returns explicit requirement-to-step variable traceability artifacts", () => {
    const artifacts = getArtifacts("TC-001");
    const links = artifacts["traceability.json"];
    expect(links).toContainEqual(expect.objectContaining({ requirement_id: "JIRA-1245", test_case_id: "TC-001", variable_id: "VAR-004", variable_name: "product_name", manual_step: 5, automation_step: 7 }));
  });

  it("reports where a canonical variable is used", () => {
    const usage = getVariableUsage("VAR-002");
    expect(usage.testCases).toContainEqual(expect.objectContaining({ id: "TC-001" }));
    expect(usage.manualSteps).toContainEqual(expect.objectContaining({ testCaseId: "TC-001", step: 2 }));
    expect(usage.automationTargets).toEqual(["web", "mobile", "api", "performance"]);
  });

  it("keeps the seeded TC-001 variable registry valid", () => {
    expect(validateVariables("TC-001").filter((issue) => issue.severity === "error")).toEqual([]);
  });
});
