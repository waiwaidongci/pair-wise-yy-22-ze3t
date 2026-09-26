import { useMemo } from "react";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import type { MaterialBatch } from "../types/MaterialBatch";
import type { MaterialIssue } from "../types/MaterialIssue";

export interface IssueBlocker {
  code: string;
  message: string;
}

// 已消耗克数：凡登记过克数的领用单都计入，退回留档的旧单同样消耗库存
export const consumedOfBatch = (issues: MaterialIssue[], batchId: number, excludeId?: number): number =>
  issues
    .filter((row) => row.batch_id === batchId && row.id !== excludeId && typeof row.quantity === "number")
    .reduce((sum, row) => sum + (row.quantity ?? 0), 0);

export const occupyingIssueOf = (issues: MaterialIssue[], batchId: number, planId: number, excludeId?: number): MaterialIssue | undefined =>
  issues.find((row) =>
    row.batch_id === batchId && row.plan_id !== planId && row.id !== excludeId &&
    (row.status === "PENDING_ISSUE" || row.status === "PENDING_REVIEW"));

export function checkIssueBlockers(
  batch: MaterialBatch | undefined,
  issues: MaterialIssue[],
  current: MaterialIssue,
  quantity: number
): IssueBlocker[] {
  if (!batch) return [{ code: "MATERIAL_BATCH_NOT_FOUND", message: ERROR_MESSAGES.MATERIAL_BATCH_NOT_FOUND }];
  const blockers: IssueBlocker[] = [];
  if (new Date(batch.expiry_date).getTime() < Date.now()) {
    blockers.push({ code: "MATERIAL_EXPIRED", message: `${ERROR_MESSAGES.MATERIAL_EXPIRED}（有效期至 ${batch.expiry_date.slice(0, 10)}）` });
  }
  const remaining = batch.total_quantity - consumedOfBatch(issues, batch.id, current.id);
  if (quantity > 0 && quantity > remaining) {
    blockers.push({ code: "MATERIAL_OVER_ISSUED", message: `${ERROR_MESSAGES.MATERIAL_OVER_ISSUED}（剩余 ${remaining} ${batch.unit}）` });
  }
  const occupying = occupyingIssueOf(issues, batch.id, current.plan_id, current.id);
  if (occupying) {
    blockers.push({ code: "MATERIAL_BATCH_OCCUPIED", message: `${ERROR_MESSAGES.MATERIAL_BATCH_OCCUPIED}（单号 ${occupying.issue_no}，方案 #${occupying.plan_id}）` });
  }
  return blockers;
}

export function useMaterialIssueGuard(issues: MaterialIssue[], batches: MaterialBatch[]) {
  return useMemo(() => ({
    blockersFor: (issue: MaterialIssue, quantity: number): IssueBlocker[] =>
      checkIssueBlockers(batches.find((batch) => batch.id === issue.batch_id), issues, issue, quantity),
    remainingOf: (batchId: number): number => {
      const batch = batches.find((row) => row.id === batchId);
      return batch ? batch.total_quantity - consumedOfBatch(issues, batchId) : 0;
    },
    isExpired: (batchId: number): boolean => {
      const batch = batches.find((row) => row.id === batchId);
      return batch ? new Date(batch.expiry_date).getTime() < Date.now() : false;
    }
  }), [issues, batches]);
}
