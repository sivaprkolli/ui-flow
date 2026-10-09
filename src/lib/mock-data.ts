import type { CanonicalVariable, ManualTestStep } from "./canonical-variables";

// Central mock dataset for the QA Agent platform.

export const summaryStats = {
  requirements: 24,
  testCases: 186,
  automation: 142,
  passRate: 94.2,
  selfHealed: 17,
  defects: 8,
};

export const qualityBreakdown = [
  { name: "Passed", value: 132, color: "#22c55e" },
  { name: "Failed", value: 6, color: "#ef4444" },
  { name: "Skipped", value: 4, color: "#94a3b8" },
  { name: "Blocked", value: 4, color: "#a855f7" },
];

export const aiQualityScore = {
  score: 92,
  metrics: [
    { label: "Requirement Coverage", value: 96 },
    { label: "Test Coverage", value: 91 },
    { label: "Automation Coverage", value: 87 },
    { label: "Execution Stability", value: 94 },
  ],
  defectRisk: "Low",
};

export type ActivityStatus = "done" | "active" | "warning" | "info";
export interface Activity {
  id: string;
  icon: string;
  title: string;
  detail: string;
  time: string;
  status: ActivityStatus;
}

export const aiActivity: Activity[] = [
  { id: "a1", icon: "brain", title: "Analyzing requirement JIRA-1245", detail: "Parsing acceptance criteria and business rules from the linked Jira story.", time: "09:41", status: "done" },
  { id: "a2", icon: "check", title: "Identified 12 acceptance criteria", detail: "Extracted positive, negative and boundary conditions.", time: "09:41", status: "done" },
  { id: "a3", icon: "flask", title: "Generated 18 test scenarios", detail: "Covering functional, negative, boundary, security and accessibility categories.", time: "09:42", status: "done" },
  { id: "a4", icon: "file", title: "Generated 42 test cases", detail: "Detailed steps, test data and expected results produced.", time: "09:43", status: "done" },
  { id: "a5", icon: "bot", title: "Generating Playwright automation", detail: "Authoring TypeScript specs with accessibility-first locators.", time: "09:44", status: "active" },
  { id: "a6", icon: "play", title: "Executing 42 tests", detail: "Running on Chromium in the QA environment.", time: "09:46", status: "info" },
  { id: "a7", icon: "alert", title: "3 tests failed", detail: "Checkout, Search and Filter flows reported locator failures.", time: "09:48", status: "warning" },
  { id: "a8", icon: "heal", title: "AI identified broken locators", detail: "DOM diffing surfaced 3 candidate replacements.", time: "09:48", status: "info" },
  { id: "a9", icon: "check", title: "3 tests successfully self-healed", detail: "New role-based locators applied and re-executed.", time: "09:49", status: "done" },
  { id: "a10", icon: "report", title: "Report generated", detail: "Release Quality Score computed at 92/100.", time: "09:50", status: "done" },
];

export interface Requirement {
  id: string;
  title: string;
  source: string;
  status: string;
  analysis: string;
  coverage: number;
}

export const requirements: Requirement[] = [
  { id: "JIRA-1245", title: "User Login", source: "Jira", status: "Ready", analysis: "Complete", coverage: 96 },
  { id: "JIRA-1246", title: "Shopping Cart", source: "Jira", status: "Processing", analysis: "Running", coverage: 82 },
  { id: "REQ-103", title: "Checkout", source: "Document", status: "Ready", analysis: "Complete", coverage: 91 },
  { id: "JIRA-1251", title: "Product Search", source: "Jira", status: "Ready", analysis: "Complete", coverage: 88 },
  { id: "CONF-08", title: "Password Reset", source: "Confluence", status: "Ready", analysis: "Complete", coverage: 93 },
  { id: "JIRA-1260", title: "User Profile", source: "Jira", status: "Processing", analysis: "Running", coverage: 71 },
  { id: "REQ-114", title: "Wishlist", source: "Document", status: "Draft", analysis: "Pending", coverage: 40 },
  { id: "ADO-2043", title: "Order Tracking", source: "ADO", status: "Ready", analysis: "Complete", coverage: 89 },
  { id: "ADO-2051", title: "Payment Refunds", source: "ADO", status: "Processing", analysis: "Running", coverage: 66 },
];

export const scenarioCategories = [
  "Functional", "Negative", "Boundary", "Security", "Regression", "Accessibility", "Performance",
];

export interface Scenario {
  id: string;
  title: string;
  category: string;
  priority: string;
  risk: string;
  coverage: string;
  status: string;
}

export const scenarios: Scenario[] = [
  { id: "TS-001", title: "Successful Login", category: "Functional", priority: "High", risk: "Medium", coverage: "Authentication", status: "Approved" },
  { id: "TS-002", title: "Login with Invalid Password", category: "Negative", priority: "High", risk: "High", coverage: "Authentication", status: "Approved" },
  { id: "TS-003", title: "Login with Invalid Username", category: "Negative", priority: "High", risk: "Medium", coverage: "Authentication", status: "Approved" },
  { id: "TS-004", title: "Empty Credentials Validation", category: "Boundary", priority: "Medium", risk: "Low", coverage: "Validation", status: "Approved" },
  { id: "TS-005", title: "Account Lockout After 5 Attempts", category: "Security", priority: "High", risk: "High", coverage: "Security", status: "Pending" },
  { id: "TS-006", title: "Session Timeout Handling", category: "Security", priority: "Medium", risk: "Medium", coverage: "Session", status: "Pending" },
  { id: "TS-007", title: "SQL Injection Resistance", category: "Security", priority: "High", risk: "High", coverage: "Security", status: "Pending" },
  { id: "TS-008", title: "Keyboard-only Login Flow", category: "Accessibility", priority: "Medium", risk: "Low", coverage: "A11y", status: "Approved" },
  { id: "TS-009", title: "Login Response Under Load", category: "Performance", priority: "Low", risk: "Medium", coverage: "Performance", status: "Pending" },
  { id: "TS-010", title: "Remember Me Persistence", category: "Regression", priority: "Medium", risk: "Low", coverage: "Session", status: "Approved" },
];

export interface TestCase {
  id: string;
  title: string;
  priority: string;
  type: string;
  automation: string;
  status: string;
  requirement: string;
  scenario: string;
  testDataSetIds: string[];
  variables: CanonicalVariable[];
  manualSteps: ManualTestStep[];
}

export const canonicalVariableRegistry: CanonicalVariable[] = [
  { variableId: "VAR-001", name: "base_url", type: "environment", description: "Application base URL", required: true, source: "environment_registry", scope: "test_case", environmentValues: { QA: "https://qa.example.test", UAT: "https://uat.example.test", PROD: "https://example.test", Local: "http://localhost:3000" }, validation: "URL" },
  { variableId: "VAR-002", name: "username", type: "credential", description: "Valid application username", required: true, source: "test_data_repository", scope: "test_case", dataKey: "qa_user_01", mask: true, validation: "non_empty" },
  { variableId: "VAR-003", name: "password", type: "credential", description: "Valid application password", required: true, source: "secret_manager", scope: "test_case", dataKey: "qa_user_01_password", mask: true, validation: "secret_reference" },
  { variableId: "VAR-004", name: "product_name", type: "test_data", description: "Searchable product name", required: true, source: "test_data_repository", scope: "test_case", dataKey: "catalog.product_name", validation: "non_empty" },
  { variableId: "VAR-005", name: "customer_id", type: "test_data", description: "Checkout customer identity", required: true, source: "test_data_repository", scope: "test_case", dataKey: "checkout.customer_id", mask: true },
  { variableId: "VAR-006", name: "card_token", type: "credential", description: "Sandbox payment token", required: true, source: "secret_manager", scope: "test_case", dataKey: "payments.card_token", mask: true },
  { variableId: "VAR-007", name: "expected_price", type: "static", description: "Expected displayed product price", required: false, source: "test_data_repository", scope: "test_case", dataKey: "catalog.expected_price", format: "currency" },
  { variableId: "VAR-008", name: "access_token", type: "runtime", description: "Authentication token returned by login", required: true, source: "runtime_context", scope: "runtime", generator: "authentication_response", mask: true },
  { variableId: "VAR-009", name: "order_id", type: "correlated", description: "Order identifier created for the customer", required: true, source: "runtime_context", scope: "test_case", generator: "create_order", dependencies: ["VAR-005"] },
  { variableId: "VAR-010", name: "order_status", type: "correlated", description: "Status associated with the created order", required: true, source: "runtime_context", scope: "test_case", generator: "get_order_status", dependencies: ["VAR-009"] },
  { variableId: "VAR-011", name: "reset_email", type: "synthetic", description: "Synthetic recipient for password reset", required: true, source: "synthetic_data_generator", scope: "test_case", generator: "unique_email", mask: true },
];

const variableById = (ids: string[]) => canonicalVariableRegistry.filter((variable) => ids.includes(variable.variableId));
const loginSteps: ManualTestStep[] = [
  { step: 1, instruction: "Navigate to {{base_url}}", variableIds: ["VAR-001"], automationStep: 1 },
  { step: 2, instruction: "Enter {{username}}", variableIds: ["VAR-002"], automationStep: 3 },
  { step: 3, instruction: "Enter {{password}}", variableIds: ["VAR-003"], automationStep: 4 },
  { step: 4, instruction: "Click Login", variableIds: [], automationStep: 5 },
  { step: 5, instruction: "Search for {{product_name}}", variableIds: ["VAR-004"], automationStep: 7 },
];
const checkoutSteps: ManualTestStep[] = [
  { step: 1, instruction: "Navigate to {{base_url}}", variableIds: ["VAR-001"], automationStep: 1 },
  { step: 2, instruction: "Load {{customer_id}}", variableIds: ["VAR-005"], automationStep: 2 },
  { step: 3, instruction: "Complete payment using {{card_token}}", variableIds: ["VAR-006"], automationStep: 5 },
  { step: 4, instruction: "Verify {{order_id}} and {{order_status}}", variableIds: ["VAR-009", "VAR-010"], automationStep: 7 },
];
const resetSteps: ManualTestStep[] = [
  { step: 1, instruction: "Navigate to {{base_url}}", variableIds: ["VAR-001"], automationStep: 1 },
  { step: 2, instruction: "Submit password reset for {{reset_email}}", variableIds: ["VAR-011"], automationStep: 3 },
];

export const testCases: TestCase[] = [
  { id: "TC-001", title: "Login and Search Product", priority: "High", type: "Functional", automation: "Automated", status: "Ready", requirement: "JIRA-1245", scenario: "TS-001", testDataSetIds: ["TD-001", "TD-004"], variables: variableById(["VAR-001", "VAR-002", "VAR-003", "VAR-004"]), manualSteps: loginSteps },
  { id: "TC-002", title: "Invalid Password", priority: "High", type: "Negative", automation: "Automated", status: "Ready", requirement: "JIRA-1245", scenario: "TS-002", testDataSetIds: ["TD-001"], variables: variableById(["VAR-001", "VAR-002", "VAR-003"]), manualSteps: loginSteps.slice(0, 4) },
  { id: "TC-003", title: "Empty Username", priority: "Medium", type: "Negative", automation: "Pending", status: "Draft", requirement: "JIRA-1245", scenario: "TS-004", testDataSetIds: ["TD-001"], variables: variableById(["VAR-001", "VAR-003"]), manualSteps: [loginSteps[0], loginSteps[2], loginSteps[3]] },
  { id: "TC-004", title: "Account Lockout", priority: "High", type: "Security", automation: "Automated", status: "Ready", requirement: "JIRA-1245", scenario: "TS-005", testDataSetIds: ["TD-001"], variables: variableById(["VAR-001", "VAR-002", "VAR-003"]), manualSteps: loginSteps.slice(0, 4) },
  { id: "TC-021", title: "Login API Error Handling", priority: "High", type: "Negative", automation: "Automated", status: "Ready", requirement: "JIRA-1245", scenario: "TS-002", testDataSetIds: ["TD-001"], variables: variableById(["VAR-001", "VAR-002", "VAR-003", "VAR-008"]), manualSteps: loginSteps.slice(0, 4) },
  { id: "TC-045", title: "Checkout With Saved Card", priority: "Critical", type: "Functional", automation: "Automated", status: "Ready", requirement: "REQ-103", scenario: "TS-011", testDataSetIds: ["TD-002", "TD-003"], variables: variableById(["VAR-001", "VAR-005", "VAR-006", "VAR-009", "VAR-010"]), manualSteps: checkoutSteps },
  { id: "TC-046", title: "Checkout Guest Flow", priority: "High", type: "Functional", automation: "Automated", status: "Ready", requirement: "REQ-103", scenario: "TS-012", testDataSetIds: ["TD-002"], variables: variableById(["VAR-001", "VAR-005", "VAR-006", "VAR-009"]), manualSteps: checkoutSteps.slice(0, 3) },
  { id: "TC-052", title: "Add To Cart Boundary", priority: "Medium", type: "Boundary", automation: "Pending", status: "Draft", requirement: "JIRA-1246", scenario: "TS-020", testDataSetIds: ["TD-004"], variables: variableById(["VAR-001", "VAR-004", "VAR-007"]), manualSteps: [loginSteps[0], loginSteps[4]] },
  { id: "TC-061", title: "Product Search Relevance", priority: "Medium", type: "Functional", automation: "Automated", status: "Ready", requirement: "JIRA-1251", scenario: "TS-030", testDataSetIds: ["TD-004"], variables: variableById(["VAR-001", "VAR-004", "VAR-007"]), manualSteps: [loginSteps[0], loginSteps[4]] },
  { id: "TC-070", title: "Password Reset Email", priority: "High", type: "Functional", automation: "Automated", status: "Ready", requirement: "CONF-08", scenario: "TS-040", testDataSetIds: ["TD-005"], variables: variableById(["VAR-001", "VAR-011"]), manualSteps: resetSteps },
];

export interface TestDataField {
  key: string;
  value: string;
  classification: "Public" | "Masked PII" | "Secret" | "Synthetic";
}

export interface TestDataSet {
  id: string;
  name: string;
  source: string;
  sourceType: "Database" | "API" | "File" | "Repository" | "Synthetic";
  environment: "QA" | "Staging" | "Local";
  status: "Synced" | "Needs refresh" | "Draft";
  classification: "Public" | "Masked PII" | "Secret" | "Synthetic";
  records: number;
  lastSynced: string;
  fields: TestDataField[];
  requirementIds: string[];
  testCaseIds: string[];
}

export const testDataSets: TestDataSet[] = [
  {
    id: "TD-001", name: "QA Authentication Accounts", source: "QA PostgreSQL", sourceType: "Database", environment: "QA", status: "Synced", classification: "Masked PII", records: 24, lastSynced: "2 min ago",
    fields: [{ key: "username", value: "standard_user", classification: "Public" }, { key: "password", value: "••••••••", classification: "Secret" }, { key: "email", value: "qa.user+***@example.test", classification: "Masked PII" }, { key: "accountState", value: "active", classification: "Public" }],
    requirementIds: ["JIRA-1245"], testCaseIds: ["TC-001", "TC-002", "TC-003", "TC-004", "TC-021"],
  },
  {
    id: "TD-002", name: "Checkout Customer Profiles", source: "checkout-customers.csv", sourceType: "File", environment: "QA", status: "Synced", classification: "Masked PII", records: 80, lastSynced: "18 min ago",
    fields: [{ key: "customerId", value: "cus_qa_***", classification: "Masked PII" }, { key: "email", value: "buyer+***@example.test", classification: "Masked PII" }, { key: "country", value: "US", classification: "Public" }, { key: "savedCard", value: "true", classification: "Public" }],
    requirementIds: ["REQ-103"], testCaseIds: ["TC-045", "TC-046"],
  },
  {
    id: "TD-003", name: "Payment Test Tokens", source: "Payment Sandbox API", sourceType: "API", environment: "QA", status: "Synced", classification: "Secret", records: 12, lastSynced: "7 min ago",
    fields: [{ key: "cardToken", value: "tok_visa", classification: "Secret" }, { key: "currency", value: "USD", classification: "Public" }, { key: "declineToken", value: "tok_••••", classification: "Secret" }],
    requirementIds: ["REQ-103"], testCaseIds: ["TC-045"],
  },
  {
    id: "TD-004", name: "Product Catalog Fixtures", source: "github:acme-qa/qa-automation", sourceType: "Repository", environment: "QA", status: "Needs refresh", classification: "Public", records: 1_250, lastSynced: "3h ago",
    fields: [{ key: "sku", value: "SKU-10001", classification: "Public" }, { key: "category", value: "Electronics", classification: "Public" }, { key: "stock", value: "50", classification: "Public" }],
    requirementIds: ["JIRA-1246", "JIRA-1251"], testCaseIds: ["TC-052", "TC-061"],
  },
  {
    id: "TD-005", name: "Synthetic Reset Recipients", source: "AI Data Generator", sourceType: "Synthetic", environment: "QA", status: "Synced", classification: "Synthetic", records: 50, lastSynced: "Today, 09:45",
    fields: [{ key: "email", value: "reset.user+***@example.test", classification: "Synthetic" }, { key: "locale", value: "en-US", classification: "Synthetic" }, { key: "resetState", value: "valid", classification: "Synthetic" }],
    requirementIds: ["CONF-08"], testCaseIds: ["TC-070"],
  },
];

export interface ExecutionRow {
  id: string;
  test: string;
  browser: string;
  duration: string;
  status: "Passed" | "Failed" | "Running" | "Skipped";
}

export const executionRows: ExecutionRow[] = [
  { id: "TC-001", test: "Login Test", browser: "Chromium", duration: "3.2s", status: "Passed" },
  { id: "TC-052", test: "Cart Test", browser: "Chromium", duration: "5.1s", status: "Passed" },
  { id: "TC-045", test: "Checkout Test", browser: "Chromium", duration: "8.4s", status: "Failed" },
  { id: "TC-061", test: "Search Test", browser: "Chromium", duration: "2.9s", status: "Running" },
  { id: "TC-070", test: "Password Reset", browser: "Chromium", duration: "4.0s", status: "Passed" },
  { id: "TC-002", test: "Invalid Password", browser: "Chromium", duration: "2.1s", status: "Passed" },
  { id: "TC-046", test: "Guest Checkout", browser: "Chromium", duration: "6.7s", status: "Skipped" },
];

export interface HealingRecord {
  id: string;
  test: string;
  brokenLocator: string;
  aiFix: string;
  confidence: number;
  status: string;
}

export const healingHistory: HealingRecord[] = [
  { id: "H-1", test: "Checkout", brokenLocator: "#checkout-button", aiFix: "getByRole('button', { name: 'Checkout' })", confidence: 98, status: "Applied" },
  { id: "H-2", test: "Login", brokenLocator: ".login-btn", aiFix: "getByRole('button', { name: 'Login' })", confidence: 96, status: "Applied" },
  { id: "H-3", test: "Search", brokenLocator: "#searchBox", aiFix: "getByPlaceholder('Search products')", confidence: 94, status: "Approved" },
  { id: "H-4", test: "Filter", brokenLocator: ".filter-apply", aiFix: "getByRole('button', { name: 'Apply Filters' })", confidence: 91, status: "Applied" },
  { id: "H-5", test: "Profile", brokenLocator: "#save-profile", aiFix: "getByRole('button', { name: 'Save Changes' })", confidence: 89, status: "Pending" },
];

export interface Defect {
  id: string;
  title: string;
  severity: string;
  test: string;
  rootCause: string;
  status: string;
  impact: string;
  suggestedFix: string;
  relatedTests: number;
  requirement: string;
}

export const defects: Defect[] = [
  { id: "BUG-102", title: "Checkout failure", severity: "Critical", test: "TC-045", rootCause: "UI change", status: "Open", impact: "6 automated tests affected", suggestedFix: "Update shared CheckoutPage locator to role-based selector", relatedTests: 6, requirement: "REQ-103" },
  { id: "BUG-103", title: "Login error", severity: "High", test: "TC-021", rootCause: "API response", status: "Open", impact: "2 automated tests affected", suggestedFix: "Handle 401 payload shape in auth client", relatedTests: 2, requirement: "JIRA-1245" },
  { id: "BUG-104", title: "Search returns stale results", severity: "Medium", test: "TC-061", rootCause: "Caching", status: "Open", impact: "1 automated test affected", suggestedFix: "Invalidate search cache on query change", relatedTests: 1, requirement: "JIRA-1251" },
  { id: "BUG-098", title: "Cart total mismatch", severity: "High", test: "TC-052", rootCause: "Rounding", status: "Resolved", impact: "Resolved in build #482", suggestedFix: "Apply banker's rounding to totals", relatedTests: 3, requirement: "JIRA-1246" },
];

export const executionTrend = [
  { build: "#476", passed: 168, failed: 14, healed: 2 },
  { build: "#477", passed: 172, failed: 10, healed: 4 },
  { build: "#478", passed: 175, failed: 9, healed: 3 },
  { build: "#479", passed: 178, failed: 7, healed: 5 },
  { build: "#480", passed: 180, failed: 6, healed: 3 },
  { build: "#481", passed: 176, failed: 10, healed: 6 },
  { build: "#482", passed: 176, failed: 6, healed: 3 },
];

export const failureInvestigation = [
  { icon: "search", label: "Captured failure", detail: "Screenshot, DOM snapshot and trace collected." },
  { icon: "brain", label: "Analyzing DOM", detail: "Parsing the current DOM tree for candidate elements." },
  { icon: "history", label: "Comparing historical DOM", detail: "Diffing against the last passing run's DOM." },
  { icon: "camera", label: "Comparing screenshot", detail: "Visual diff highlights a relocated Checkout button." },
  { icon: "book", label: "Checking locator history", detail: "Reviewing prior stable selectors for this element." },
  { icon: "bulb", label: "Candidate locator identified", detail: "getByRole('button', { name: 'Checkout' }) — 98% confidence." },
  { icon: "heal", label: "Applying self-healing", detail: "Patching the CheckoutPage page object and re-running." },
];

export const traceability = [
  { stage: "Requirement", value: "JIRA-1245", count: 1 },
  { stage: "Acceptance Criteria", value: "6 Criteria", count: 6 },
  { stage: "Scenarios", value: "18 Scenarios", count: 18 },
  { stage: "Test Cases", value: "42 Test Cases", count: 42 },
  { stage: "Automated", value: "38 Automated", count: 38 },
  { stage: "Passed", value: "36 Passed", count: 36 },
  { stage: "Failed", value: "2 Failed", count: 2 },
  { stage: "Defect", value: "1 Defect", count: 1 },
];

export const notifications = [
  { id: "n1", icon: "alert", text: "3 tests failed in regression suite", time: "2m ago", type: "danger" },
  { id: "n2", icon: "heal", text: "4 locators automatically healed", time: "6m ago", type: "info" },
  { id: "n3", icon: "bug", text: "New critical defect BUG-102 created", time: "12m ago", type: "danger" },
  { id: "n4", icon: "check", text: "Regression execution completed", time: "20m ago", type: "success" },
  { id: "n5", icon: "brain", text: "AI analysis completed for JIRA-1245", time: "35m ago", type: "info" },
];

export const workflowNodes = [
  { id: "req", icon: "clipboard", label: "Requirement", count: 24, status: "done" },
  { id: "analysis", icon: "brain", label: "AI Analysis", count: 22, status: "done" },
  { id: "scenario", icon: "flask", label: "Scenario Generation", count: 156, status: "done" },
  { id: "cases", icon: "file", label: "Test Case Generation", count: 186, status: "done" },
  { id: "automation", icon: "bot", label: "Automation Generation", count: 142, status: "active" },
  { id: "execution", icon: "play", label: "Test Execution", count: 142, status: "active" },
  { id: "failure", icon: "search", label: "Failure Analysis", count: 6, status: "warning" },
  { id: "healing", icon: "heal", label: "Self-Healing", count: 17, status: "done" },
  { id: "defects", icon: "bug", label: "Defect Management", count: 8, status: "warning" },
  { id: "report", icon: "report", label: "Quality Report", count: 1, status: "done" },
];


export interface TestDataGovernance {
  dataSetId: string;
  schemaVersion: string;
  healthScore: number;
  freshness: "Fresh" | "Stale";
  freshnessSla: string;
  lastValidated: string;
  reservationPolicy: "Execution-scoped lease" | "Read only";
  cleanupPolicy: "Reset source state" | "Release lease" | "No cleanup required";
  auditPolicy: "Masked execution audit";
}

export const testDataGovernance: TestDataGovernance[] = [
  { dataSetId: "TD-001", schemaVersion: "auth.v3", healthScore: 98, freshness: "Fresh", freshnessSla: "15 min", lastValidated: "2 min ago", reservationPolicy: "Execution-scoped lease", cleanupPolicy: "Reset source state", auditPolicy: "Masked execution audit" },
  { dataSetId: "TD-002", schemaVersion: "checkout.v5", healthScore: 96, freshness: "Fresh", freshnessSla: "30 min", lastValidated: "18 min ago", reservationPolicy: "Execution-scoped lease", cleanupPolicy: "Reset source state", auditPolicy: "Masked execution audit" },
  { dataSetId: "TD-003", schemaVersion: "payments.v2", healthScore: 99, freshness: "Fresh", freshnessSla: "15 min", lastValidated: "7 min ago", reservationPolicy: "Execution-scoped lease", cleanupPolicy: "Release lease", auditPolicy: "Masked execution audit" },
  { dataSetId: "TD-004", schemaVersion: "catalog.v7", healthScore: 72, freshness: "Stale", freshnessSla: "60 min", lastValidated: "3h ago", reservationPolicy: "Read only", cleanupPolicy: "No cleanup required", auditPolicy: "Masked execution audit" },
  { dataSetId: "TD-005", schemaVersion: "reset.v2", healthScore: 97, freshness: "Fresh", freshnessSla: "24h", lastValidated: "Today, 09:45", reservationPolicy: "Execution-scoped lease", cleanupPolicy: "Release lease", auditPolicy: "Masked execution audit" },
];


export const traceabilityMetrics = {
  requirementCoverage: 94,
  acceptanceCoverage: 96,
  scenarioCoverage: 91,
  testCaseCoverage: 89,
  automationCoverage: 87,
  executionCoverage: 94,
  defectLinked: 100,
  orphanRequirements: 1,
  orphanTestCases: 3,
  unautomatedCritical: 2,
};

export const traceabilityCoverageMatrix = [
  { requirement: "JIRA-1245", title: "User Login", criteria: 6, scenarios: 18, testCases: 42, automated: 38, passed: 36, defects: 1, coverage: 96 },
  { requirement: "REQ-103", title: "Checkout", criteria: 8, scenarios: 22, testCases: 48, automated: 42, passed: 39, defects: 2, coverage: 91 },
  { requirement: "JIRA-1246", title: "Shopping Cart", criteria: 5, scenarios: 14, testCases: 31, automated: 24, passed: 23, defects: 1, coverage: 82 },
  { requirement: "JIRA-1251", title: "Product Search", criteria: 4, scenarios: 12, testCases: 26, automated: 22, passed: 21, defects: 1, coverage: 88 },
];

export interface FailureAnalysisRecord {
  id: string;
  testId: string;
  test: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  category: "UI change" | "API response" | "Data issue" | "Timing" | "Environment";
  status: "Self-healed" | "Open defect" | "Investigating" | "Resolved";
  duration: string;
  occurredAt: string;
  confidence: number;
  rootCause: string;
  suggestedFix: string;
  affectedTests: number;
  evidence: string[];
}

export const failureAnalysisRecords: FailureAnalysisRecord[] = [
  { id: "FA-001", testId: "TC-045", test: "Checkout With Saved Card", severity: "Critical", category: "UI change", status: "Self-healed", duration: "8.4s", occurredAt: "09:48", confidence: 98, rootCause: "Checkout button locator was removed during the checkout redesign.", suggestedFix: "Use getByRole('button', { name: 'Checkout' }) in CheckoutPage.", affectedTests: 6, evidence: ["DOM diff", "Visual diff", "Locator history"] },
  { id: "FA-002", testId: "TC-021", test: "Login API Error Handling", severity: "High", category: "API response", status: "Open defect", duration: "2.8s", occurredAt: "09:49", confidence: 94, rootCause: "Authentication endpoint returns an undocumented 401 payload shape.", suggestedFix: "Normalize the auth error payload and add a contract assertion.", affectedTests: 2, evidence: ["API trace", "Response schema diff", "Recent deployment"] },
  { id: "FA-003", testId: "TC-061", test: "Product Search Relevance", severity: "Medium", category: "Data issue", status: "Investigating", duration: "4.2s", occurredAt: "09:51", confidence: 87, rootCause: "Catalog fixture index is stale after the latest repository sync.", suggestedFix: "Refresh TD-004 and validate the catalog fixture schema.", affectedTests: 1, evidence: ["Fixture freshness", "Search ranking trace", "Dataset health"] },
  { id: "FA-004", testId: "TC-052", test: "Add To Cart Boundary", severity: "High", category: "Timing", status: "Resolved", duration: "5.1s", occurredAt: "Yesterday", confidence: 91, rootCause: "Cart total recalculation completed after the assertion window.", suggestedFix: "Wait for the cart-total update event before asserting the price.", affectedTests: 3, evidence: ["Playwright trace", "Network waterfall", "Event timing"] },
  { id: "FA-005", testId: "TC-070", test: "Password Reset Email", severity: "Medium", category: "Environment", status: "Resolved", duration: "6.3s", occurredAt: "Yesterday", confidence: 89, rootCause: "QA mail sandbox was unavailable for 4 minutes.", suggestedFix: "Add mail sandbox readiness probe to preflight.", affectedTests: 1, evidence: ["Environment health", "Mail API timeout", "Retry history"] },
  { id: "FA-006", testId: "TC-046", test: "Checkout Guest Flow", severity: "Low", category: "Data issue", status: "Self-healed", duration: "6.7s", occurredAt: "2 days ago", confidence: 93, rootCause: "Guest customer fixture had an expired postal-code rule.", suggestedFix: "Regenerate the synthetic guest profile before execution.", affectedTests: 1, evidence: ["Dataset audit", "Validation rule", "Synthetic generator"] },
];

export const failureCategoryBreakdown = [
  { category: "UI change", count: 2, color: "#ef4444" },
  { category: "API response", count: 1, color: "#f59e0b" },
  { category: "Data issue", count: 2, color: "#a855f7" },
  { category: "Timing", count: 1, color: "#38bdf8" },
  { category: "Environment", count: 1, color: "#94a3b8" },
];

export const executionReportMetrics = {
  build: "#482",
  suite: "Regression · QA · Chromium",
  total: 186,
  passed: 176,
  failed: 6,
  skipped: 4,
  blocked: 0,
  passRate: 94.6,
  duration: "18m 42s",
  avgDuration: "6.0s",
  retries: 8,
  selfHealed: 3,
};

export const executionDurationTrend = [
  { build: "#476", duration: 22.8, passRate: 92.3 },
  { build: "#477", duration: 21.7, passRate: 94.5 },
  { build: "#478", duration: 20.1, passRate: 95.1 },
  { build: "#479", duration: 19.3, passRate: 96.2 },
  { build: "#480", duration: 19.1, passRate: 96.8 },
  { build: "#481", duration: 20.5, passRate: 94.6 },
  { build: "#482", duration: 18.7, passRate: 94.6 },
];

export const executionByBrowser = [
  { browser: "Chromium", passed: 176, failed: 6, skipped: 4 },
  { browser: "Firefox", passed: 172, failed: 8, skipped: 6 },
  { browser: "WebKit", passed: 169, failed: 10, skipped: 7 },
];


export interface BusinessFlowRecord {
  id: string;
  name: string;
  description: string;
  mappingType: "requirement" | "scenario";
  mappingId: string;
  mappingTitle: string;
  environment: "QA" | "UAT" | "Staging" | "Local";
  status: "Draft" | "Recorded" | "Approved";
  steps: number;
  artifacts: number;
  updatedAt: string;
}

export const businessFlows: BusinessFlowRecord[] = [
  { id: "FLOW-001", name: "Customer Login and Product Discovery", description: "A customer signs in and discovers a product through search.", mappingType: "requirement", mappingId: "JIRA-1245", mappingTitle: "User Login", environment: "QA", status: "Recorded", steps: 5, artifacts: 14, updatedAt: "Today, 09:32" },
  { id: "FLOW-002", name: "Saved Card Checkout", description: "A returning customer completes checkout with a saved payment method.", mappingType: "scenario", mappingId: "TS-011", mappingTitle: "Checkout With Saved Card", environment: "QA", status: "Approved", steps: 8, artifacts: 21, updatedAt: "Yesterday" },
  { id: "FLOW-003", name: "Password Recovery", description: "A user requests and validates a password reset journey.", mappingType: "requirement", mappingId: "CONF-08", mappingTitle: "Password Reset", environment: "QA", status: "Draft", steps: 4, artifacts: 8, updatedAt: "May 12" },
];
