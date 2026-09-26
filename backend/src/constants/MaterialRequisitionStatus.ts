export const MaterialRequisitionStatus = ["PENDING_PICKUP","ISSUED","PENDING_REVIEW","REVIEWED","ARCHIVED"] as const;
export type MaterialRequisitionStatus = (typeof MaterialRequisitionStatus)[number];
