export const createMaterialRequisitionDto = (overrides = {}) => ({
  id: 1,
  requisition_no: "MR-2026-0001",
  plan_id: 1,
  step_id: 1,
  batch_no: "B-2026-01",
  material_name: "环氧树脂 E-44",
  used_amount: 0,
  unit: "g",
  opened_at: "2026-09-25T09:00:00Z",
  operator_id: 1,
  status: "PENDING_PICKUP",
  completed_at: "",
  reviewer_id: null,
  reviewed_at: null,
  review_note: "",
  replaced_requisition_id: null,
  archived_at: null,
  ...overrides
});

export const createMaterialRequisitionResponse = createMaterialRequisitionDto;
