export const RestorationStepStatus = ["PENDING_PICKUP","IN_PROGRESS","COMPLETED","ARCHIVED"] as const;
export type RestorationStepStatus = (typeof RestorationStepStatus)[number];
