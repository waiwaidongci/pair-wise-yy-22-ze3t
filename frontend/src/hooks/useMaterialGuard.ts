import { useMemo } from "react";
import type { MaterialStock } from "../types/MaterialStock";
import type { MaterialRequisition } from "../types/MaterialRequisition";

export type MaterialGuardBlock = { code: string; message: string };

// 领用前现场预检：与后端三条拦截规则保持一致，页面据此提前挡住并说明原因。
// 1) 材料已过期 2) 总领用量超过入库量 3) 同批号仍被另一个未结方案占用。
export function useMaterialGuard(params: {
  stockRows: MaterialStock[];
  requisitionRows: MaterialRequisition[];
  batchNo: string;
  requestAmount: number;
  planId: number;
  planTitleById?: (id: number) => string;
}) {
  const { stockRows, requisitionRows, batchNo, requestAmount, planId, planTitleById } = params;

  return useMemo<MaterialGuardBlock | null>(() => {
    if (!batchNo) return null;
    const stock = stockRows.find((row) => row.batch_no === batchNo);
    if (!stock) {
      return { code: "MATERIAL_BATCH_NOT_FOUND", message: `批号 ${batchNo} 未在材料台账中登记，无法领用` };
    }
    const today = new Date().toISOString().slice(0, 10);
    if (stock.expire_date < today) {
      return {
        code: "MATERIAL_EXPIRED",
        message: `批号 ${batchNo} 的「${stock.material_name}」已于 ${stock.expire_date} 过期，禁止上场`
      };
    }
    const occupant = requisitionRows.find(
      (row) =>
        row.batch_no === batchNo &&
        row.plan_id !== planId &&
        (row.status === "PENDING_PICKUP" || row.status === "ISSUED" || row.status === "PENDING_REVIEW")
    );
    if (occupant) {
      return {
        code: "MATERIAL_BATCH_OCCUPIED",
        message: `批号 ${batchNo} 仍被未结方案「${planTitleById?.(occupant.plan_id) ?? occupant.plan_id}」（方案 #${occupant.plan_id}）占用，需先结项或退回后方可领用`
      };
    }
    const usedSoFar = requisitionRows
      .filter((row) => row.batch_no === batchNo && row.status !== "ARCHIVED")
      .reduce((sum, row) => sum + row.used_amount, 0);
    if (requestAmount > 0 && usedSoFar + requestAmount > stock.total_amount) {
      return {
        code: "MATERIAL_OVERDRAWN",
        message: `批号 ${batchNo} 入库 ${stock.total_amount}${stock.unit}，已领用 ${usedSoFar}${stock.unit}，再领 ${requestAmount}${stock.unit} 将超出库存（剩余 ${stock.total_amount - usedSoFar}${stock.unit}）`
      };
    }
    return null;
  }, [stockRows, requisitionRows, batchNo, requestAmount, planId, planTitleById]);
}
