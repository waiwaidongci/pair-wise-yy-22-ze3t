export type MaterialRequisitionStatus =
  | "PENDING_PICKUP"
  | "ISSUED"
  | "PENDING_REVIEW"
  | "REVIEWED"
  | "ARCHIVED";

export type MaterialRequisitionBucket = "TO_PICKUP" | "TO_REVIEW" | "DONE";

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
  status: MaterialRequisitionStatus;
  completed_at: string;
  reviewer_id: number | null;
  reviewed_at: string | null;
  review_note: string;
  replaced_requisition_id: number | null;
  replaced_requisition_no: string | null;
  archived_at: string | null;
  list_bucket: MaterialRequisitionBucket;
}
