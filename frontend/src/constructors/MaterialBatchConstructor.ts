import type { MaterialBatch } from "../types/MaterialBatch";

export const createDefaultMaterialBatch = (overrides: Partial<MaterialBatch> = {}): MaterialBatch => ({
  id: 0,
  batch_no: "",
  material_name: "",
  total_quantity: 0,
  unit: "g",
  expiry_date: "",
  stocked_by: 1,
  stocked_at: "",
  note: "",
  ...overrides
});

export const createMaterialBatchForm = createDefaultMaterialBatch;
export const createMaterialBatchResponse = createDefaultMaterialBatch;
