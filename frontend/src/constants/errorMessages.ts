export const ERROR_MESSAGES = {
  AUTH_REQUIRED: "请先登录后再继续操作",
  RBAC_DENIED: "当前角色没有执行该动作的权限",
  VALIDATION_FAILED: "表单字段缺失或格式错误",
  RATE_LIMITED: "请求过于频繁，请稍后再试",
  MATERIAL_BATCH_NOT_FOUND: "该批号未在材料台账中登记，无法领用",
  MATERIAL_EXPIRED: "材料已过有效期，禁止上场",
  MATERIAL_OVERDRAWN: "总领用量将超过入库量，库存不足",
  MATERIAL_BATCH_OCCUPIED: "同批号仍被另一个未结方案占用",
  MATERIAL_REVIEW_SELF: "复核人不能与领用人为同一修复师",
  MATERIAL_REQUISITION_NOT_FOUND: "领用单不存在",
  MATERIAL_REQUISITION_NOT_REVIEWABLE: "领用单当前状态不可复核",
  MATERIAL_BATCH_DUPLICATE: "批号已登记入库，请勿重复登记"
};
