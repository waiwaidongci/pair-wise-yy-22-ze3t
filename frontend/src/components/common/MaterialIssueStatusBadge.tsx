import { MaterialIssueStatusText, type MaterialIssueStatus } from "../../constants/MaterialIssueStatus";

export function MaterialIssueStatusBadge({ value }: { value: string }) {
  const key = value as MaterialIssueStatus;
  return <span className={"badge issue-" + String(value).toLowerCase().replace(/_/g, "-")}>{MaterialIssueStatusText[key] ?? value}</span>;
}
