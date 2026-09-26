export const MaterialRequisitionBucket = ["TO_PICKUP", "TO_REVIEW", "DONE"] as const;
export type MaterialRequisitionBucket = (typeof MaterialRequisitionBucket)[number];

export const MaterialRequisitionBucketText: Record<MaterialRequisitionBucket, string> = {
  TO_PICKUP: "待领用",
  TO_REVIEW: "待复核",
  DONE: "已完成"
};
