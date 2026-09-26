export const createMaterialStockDto = (overrides = {}) => ({
  id: 1,
  material_name: "环氧树脂 E-44",
  batch_no: "B-2026-01",
  total_amount: 500,
  unit: "g",
  expire_date: "2027-12-31",
  stocked_in_at: "2026-01-10T08:30:00Z",
  stocked_in_by: 3,
  ...overrides
});

export const createMaterialStockResponse = createMaterialStockDto;
