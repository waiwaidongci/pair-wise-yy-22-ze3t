export interface MaterialBatch {
  id: number;
  batch_no: string;
  material_name: string;
  total_quantity: number;
  unit: string;
  expiry_date: string;
  stocked_by: number;
  stocked_at: string;
  note: string;
}
