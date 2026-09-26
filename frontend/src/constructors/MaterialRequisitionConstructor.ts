import type { MaterialRequisition } from "../types/MaterialRequisition";

export const createDefaultMaterialRequisition = (
  overrides: Partial<MaterialRequisition> = {}
): MaterialRequisition => ({
  id: 0,
  requisition_no: "",
  plan_id: 0,
  step_id: 0,
  batch_no: "",
  material_name: "",
  used_amount: 0,
  unit: "g",
  opened_at: "",
  operator_id: 0,
  status: "PENDING_PICKUP",
  completed_at: "",
  reviewer_id: null,
  reviewed_at: null,
  review_note: "",
  replaced_requisition_id: null,
  replaced_requisition_no: null,
  archived_at: null,
  list_bucket: "TO_PICKUP",
  ...overrides
});

export const createMaterialRequisitionForm = createDefaultMaterialRequisition;
export const createMaterialRequisitionResponse = createDefaultMaterialRequisition;
