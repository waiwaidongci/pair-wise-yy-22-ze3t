import { useEffect, useMemo, useState } from "react";
import { useRestorationPlanStore } from "../stores/RestorationPlanStore";
import { useRestorationStepStore } from "../stores/RestorationStepStore";
import { useMaterialBatchStore } from "../stores/MaterialBatchStore";
import { useMaterialIssueStore } from "../stores/MaterialIssueStore";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import { MaterialIssueStatusBadge } from "../components/common/MaterialIssueStatusBadge";
import { StatusBadge } from "../components/common/StatusBadge";
import { StatCard } from "../components/common/StatCard";
import { EmptyState } from "../components/common/EmptyState";
import { formatDateOrDash, formatGrams } from "../utils/formatters";
import type { RestorationStep } from "../types/RestorationStep";

function ReopenControl({ step }: { step: RestorationStep }) {
  const batches = useMaterialBatchStore((state) => state.rows);
  const create = useMaterialIssueStore((state) => state.create);
  const [batchId, setBatchId] = useState("");

  const reopen = async () => {
    const ok = await create({ batch_id: Number(batchId), step_id: step.id, plan_id: step.plan_id, operator_id: step.operator_id });
    if (ok) {
      console.info(LOG_TEMPLATES.MaterialIssue[0], `step#${step.id}`);
      setBatchId("");
    }
  };

  return <span className="form-inline">
    <select value={batchId} onChange={(event) => setBatchId(event.target.value)}>
      <option value="">选择批次</option>
      {batches.map((batch) => <option key={batch.id} value={batch.id}>{batch.batch_no} · {batch.material_name}</option>)}
    </select>
    <button disabled={!batchId} onClick={reopen}>重开步骤另开新单</button>
  </span>;
}

export function PlansPage() {
  const planStore = useRestorationPlanStore();
  const stepStore = useRestorationStepStore();
  const batchStore = useMaterialBatchStore();
  const issueStore = useMaterialIssueStore();
  const [notice, setNotice] = useState("");

  useEffect(() => {
    planStore.load();
    stepStore.load();
    batchStore.load();
    issueStore.load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const batchById = useMemo(() => new Map(batchStore.rows.map((batch) => [batch.id, batch])), [batchStore.rows]);

  const returnPlan = async (planId: number) => {
    const archived = await issueStore.returnByPlan(planId, "方案退回重审，领用记录留档");
    console.info(LOG_TEMPLATES.MaterialIssue[3], `plan#${planId}`);
    setNotice(archived > 0 ? `方案 #${planId} 已退回重审，${archived} 张领用单留档，重开步骤请另开新单。` : `方案 #${planId} 没有在途领用单需要留档。`);
  };

  return <main className="page">
    <section className="page-head">
      <div>
        <p className="eyebrow">relic-restore</p>
        <h1>修复方案</h1>
      </div>
      <StatusBadge value="PLAN_PROGRESS" />
    </section>

    <section className="metrics">
      <StatCard label="方案数" value={planStore.rows.length} />
      <StatCard label="修复步骤" value={stepStore.rows.length} />
      <StatCard label="领用单" value={issueStore.rows.length} />
    </section>

    {issueStore.error && <p className="alert">已挡住：{issueStore.error}</p>}
    {notice && <p className="notice">{notice}</p>}

    {planStore.rows.map((plan) => {
      const planIssues = issueStore.rows.filter((row) => row.plan_id === plan.id);
      const active = planIssues.filter((row) => row.status !== "ARCHIVED");
      const completed = active.filter((row) => row.status === "COMPLETED").length;
      const progress = active.length === 0 ? 0 : Math.round((completed / active.length) * 100);
      const planSteps = stepStore.rows.filter((row) => row.plan_id === plan.id);
      return <section key={plan.id} className="panel wide">
        <h2>{plan.plan_title} <StatusBadge value={plan.approval_status} /></h2>
        <p className="muted">方案进度（复核通过才计入）：{completed}/{active.length} 张领用单 · {progress}%</p>
        <div className="progress"><span style={{ width: `${progress}%` }} /></div>
        <div className="table">
          {planSteps.map((step) => {
            const stepIssues = planIssues.filter((row) => row.step_id === step.id);
            return <article key={step.id} className="row step-row">
              <div className="cell">
                <strong>步骤 #{step.id} · {step.technique}</strong>
                <span className="muted">操作人 #{step.operator_id} · {step.step_status}</span>
              </div>
              <div className="cell">
                {stepIssues.map((issue) => <div key={issue.id} className={"issue-line" + (issue.status === "ARCHIVED" ? " archived" : "")}>
                  <MaterialIssueStatusBadge value={issue.status} />
                  <span>{issue.issue_no} · {batchById.get(issue.batch_id)?.batch_no ?? `批次 #${issue.batch_id}`} · {formatGrams(issue.quantity)} · 开封 {formatDateOrDash(issue.opened_at)}</span>
                  {issue.status === "ARCHIVED" && <span className="muted">留档可查 · {issue.review_note}</span>}
                </div>)}
                {stepIssues.length === 0 && <span className="muted">尚未开领用单</span>}
              </div>
              <div className="cell"><ReopenControl step={step} /></div>
            </article>;
          })}
          {planSteps.length === 0 && <EmptyState title="该方案尚未拆解步骤" />}
        </div>
        <button onClick={() => returnPlan(plan.id)}>退回重审（在途领用单留档）</button>
      </section>;
    })}
  </main>;
}
