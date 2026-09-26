export const MaterialIssueStatus = ["PENDING_ISSUE","PENDING_REVIEW","COMPLETED","ARCHIVED"] as const;
export type MaterialIssueStatus = (typeof MaterialIssueStatus)[number];
