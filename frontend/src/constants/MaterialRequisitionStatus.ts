export const MaterialRequisitionStatus = [
  "PENDING_PICKUP",
  "ISSUED",
  "PENDING_REVIEW",
  "REVIEWED",
  "ARCHIVED"
] as const;
export type MaterialRequisitionStatus = (typeof MaterialRequisitionStatus)[number];

export const MaterialRequisitionStatusText: Record<MaterialRequisitionStatus, string> = {
  PENDING_PICKUP: "待领用",
  ISSUED: "已领用待完工",
  PENDING_REVIEW: "待复核",
  REVIEWED: "复核通过",
  ARCHIVED: "退回留档"
};
