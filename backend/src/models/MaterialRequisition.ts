export interface MaterialRequisition {
  id: number;
  requisition_no: string;
  plan_id: number;
  step_id: number;
  batch_no: string;
  material_name: string;
  used_amount: number;
  unit: string;
  opened_at: string;
  operator_id: number;
  status: string;
  completed_at: string;
  reviewer_id: number | null;
  reviewed_at: string | null;
  review_note: string;
  replaced_requisition_id: number | null;
  archived_at: string | null;
}
