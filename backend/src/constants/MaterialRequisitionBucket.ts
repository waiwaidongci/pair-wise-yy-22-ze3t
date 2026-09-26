export const MaterialRequisitionBucket = ["TO_PICKUP","TO_REVIEW","DONE"] as const;
export type MaterialRequisitionBucket = (typeof MaterialRequisitionBucket)[number];
