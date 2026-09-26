export const MaterialIssueStatus = ["PENDING_ISSUE", "PENDING_REVIEW", "COMPLETED", "ARCHIVED"] as const;
export type MaterialIssueStatus = (typeof MaterialIssueStatus)[number];
export const MaterialIssueStatusText: Record<MaterialIssueStatus, string> = {
  PENDING_ISSUE: "待领用",
  PENDING_REVIEW: "待复核",
  COMPLETED: "已完成",
  ARCHIVED: "已归档"
};
