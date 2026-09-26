export const ERROR_MESSAGES = {
  AUTH_REQUIRED: "请先登录后再继续操作",
  RBAC_DENIED: "当前角色没有执行该动作的权限",
  VALIDATION_FAILED: "表单字段缺失或格式错误",
  RATE_LIMITED: "请求过于频繁，请稍后再试",
  MATERIAL_BATCH_NOT_FOUND: "材料批次不存在",
  MATERIAL_ISSUE_NOT_FOUND: "领用单不存在",
  MATERIAL_EXPIRED: "材料已过期，禁止领用",
  MATERIAL_OVER_ISSUED: "总领用量超过入库量，禁止领用",
  MATERIAL_BATCH_OCCUPIED: "同批号仍被另一个未结方案占用，禁止领用",
  MATERIAL_REVIEWER_CONFLICT: "复核人须为另一名修复师"
};
