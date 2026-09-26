import type { MaterialStock } from "../types/MaterialStock";

export const createDefaultMaterialStock = (overrides: Partial<MaterialStock> = {}): MaterialStock => ({
  id: 0,
  material_name: "",
  batch_no: "",
  total_amount: 0,
  unit: "g",
  expire_date: "",
  stocked_in_at: "",
  stocked_in_by: 0,
  used_amount: 0,
  remaining_amount: 0,
  expired: false,
  ...overrides
});

export const createMaterialStockForm = createDefaultMaterialStock;
export const createMaterialStockResponse = createDefaultMaterialStock;
