export interface MaterialIssue {
  id: number;
  issue_no: string;
  batch_id: number;
  step_id: number;
  plan_id: number;
  operator_id: number;
  quantity: number | null;
  opened_at: string | null;
  status: string;
  reviewer_id: number | null;
  reviewed_at: string | null;
  review_note: string;
  round: number;
  created_at: string;
  archived_at: string | null;
}
