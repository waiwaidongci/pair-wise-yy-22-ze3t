import type { MaterialIssue } from "../types/MaterialIssue";

export const createDefaultMaterialIssue = (overrides: Partial<MaterialIssue> = {}): MaterialIssue => ({
  id: 0,
  issue_no: "",
  batch_id: 0,
  step_id: 0,
  plan_id: 0,
  operator_id: 1,
  quantity: null,
  opened_at: null,
  status: "PENDING_ISSUE",
  reviewer_id: null,
  reviewed_at: null,
  review_note: "",
  round: 1,
  created_at: "",
  archived_at: null,
  ...overrides
});

export const createMaterialIssueForm = createDefaultMaterialIssue;
export const createMaterialIssueResponse = createDefaultMaterialIssue;
