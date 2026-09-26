import { seed } from "../seed";
import type { MaterialRequisition } from "../models/MaterialRequisition";

// 复制种子数据，运行期领用/复核/留档在内存中累积，重启后回到种子状态。
const rows: MaterialRequisition[] = seed.materialRequisition.map((row) => ({ ...row }));

const ACTIVE_STATUSES = ["PENDING_PICKUP", "ISSUED", "PENDING_REVIEW"];

export const materialRequisitionRepository = {
  findAll: (): MaterialRequisition[] => rows,
  findById: (id: number): MaterialRequisition | undefined => rows.find((row) => row.id === id),
  findByStep: (stepId: number): MaterialRequisition[] => rows.filter((row) => row.step_id === stepId),
  nextId: () => rows.reduce((max, row) => Math.max(max, row.id), 0) + 1,
  // 同批号仍被另一个未结方案占用：存在活动领用单且其方案不是当前方案。
  findBatchOccupiedByOtherPlan: (batchNo: string, planId: number): MaterialRequisition | undefined =>
    rows.find((row) => row.batch_no === batchNo && row.plan_id !== planId && ACTIVE_STATUSES.includes(row.status)),
  // 批号在活动领用单中累计的克数（已领用但未随方案退回而留档的量都占用库存）。
  sumActiveUsedByBatch: (batchNo: string): number =>
    rows
      .filter((row) => row.batch_no === batchNo && row.status !== "ARCHIVED")
      .reduce((sum, row) => sum + row.used_amount, 0),
  save: (row: MaterialRequisition): MaterialRequisition => {
    rows.push(row);
    return row;
  },
  update: (id: number, patch: Partial<MaterialRequisition>): MaterialRequisition | undefined => {
    const row = rows.find((item) => item.id === id);
    if (!row) return undefined;
    Object.assign(row, patch);
    return row;
  }
};
