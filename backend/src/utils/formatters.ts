export const toAuditTarget = (type: string, id: string | number) => `${type}#${id}`;
export const toMaterialIssueNo = (stepId: string | number, round: string | number) => `MI-${stepId}-${round}`;
