export const ERROR_MESSAGES = {
  AUTH_REQUIRED: "missing bearer token",
  RBAC_DENIED: "role denied",
  VALIDATION_FAILED: "invalid payload",
  RATE_LIMITED: "too many requests",
  MATERIAL_BATCH_NOT_FOUND: "批号 {batchNo} 未在材料台账中登记，无法领用",
  MATERIAL_EXPIRED: "批号 {batchNo} 的材料已于 {expireDate} 过期，禁止上场",
  MATERIAL_OVERDRAWN: "批号 {batchNo} 入库 {totalAmount}g，已领用 {usedAmount}g，再领 {requestAmount}g 将超出库存",
  MATERIAL_BATCH_OCCUPIED: "批号 {batchNo} 仍被未结方案 {planTitle}（方案 #{planId}）占用，需先结项或退回后方可领用",
  MATERIAL_REVIEW_SELF: "复核人不能与领用人为同一修复师，请由另一名修复师按批号复核",
  MATERIAL_REQUISITION_NOT_FOUND: "领用单 #{id} 不存在",
  MATERIAL_REQUISITION_NOT_REVIEWABLE: "领用单 #{id} 当前状态不可复核",
  MATERIAL_BATCH_DUPLICATE: "批号 {batchNo} 已登记入库，请勿重复登记"
};
