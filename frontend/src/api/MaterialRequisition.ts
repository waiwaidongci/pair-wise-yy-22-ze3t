import { mockData } from "../mocks/seedData";
import { postJson } from "./request";
import type { MaterialRequisition, MaterialRequisitionBucket } from "../types/MaterialRequisition";

const endpoint = "/api/material-requisition";

export async function listMaterialRequisition(bucket?: MaterialRequisitionBucket): Promise<MaterialRequisition[]> {
  try {
    const res = await fetch(bucket ? `${endpoint}?bucket=${bucket}` : endpoint);
    if (res.ok) return await res.json();
  } catch {
    // Local mock fallback keeps the UI available during offline review.
  }
  const rows = [...(mockData.materialRequisition as unknown as MaterialRequisition[])];
  return bucket ? rows.filter((row) => row.list_bucket === bucket) : rows;
}

// 步骤开始后由操作人领用：批号、克数、开封时间。
export function issueMaterial(payload: {
  step_id: number;
  batch_no: string;
  used_amount: number;
  opened_at?: string;
  operator_id: number;
  replaced_requisition_id?: number;
}) {
  return postJson<MaterialRequisition>(endpoint, payload);
}

// 完工后由另一名修复师按批号复核。
export function reviewMaterialRequisition(
  id: number,
  payload: { reviewer_id: number; review_note?: string }
) {
  return postJson<MaterialRequisition>(`${endpoint}/${id}/review`, payload);
}

// 方案退回重审：领用记录留档，重开步骤回到待领用并另开新单。
export function archiveRequisitionsForPlan(planId: number, reopenStepIds: number[] = []) {
  return postJson<MaterialRequisition[]>(`${endpoint}/plan/${planId}/archive`, {
    reopen_step_ids: reopenStepIds
  });
}
