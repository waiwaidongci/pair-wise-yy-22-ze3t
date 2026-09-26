import { useEffect, useMemo, useState } from "react";
import { useMaterialBatchStore } from "../stores/MaterialBatchStore";
import { useMaterialIssueStore } from "../stores/MaterialIssueStore";
import { useRestorationStepStore } from "../stores/RestorationStepStore";
import { MaterialIssueStatus, MaterialIssueStatusText } from "../constants/MaterialIssueStatus";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import { MaterialIssueStatusBadge } from "../components/common/MaterialIssueStatusBadge";
import { StatusBadge } from "../components/common/StatusBadge";
import { StatCard } from "../components/common/StatCard";
import { EmptyState } from "../components/common/EmptyState";
import { useMaterialIssueGuard } from "../hooks/useMaterialIssueGuard";
import { createMaterialBatchForm } from "../constructors/MaterialBatchConstructor";
import { createMaterialIssueForm } from "../constructors/MaterialIssueConstructor";
import { formatDateOrDash, formatGrams } from "../utils/formatters";
import type { MaterialIssue } from "../types/MaterialIssue";

const nowLocal = () => new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16);

function PendingIssueRow({ issue }: { issue: MaterialIssue }) {
  const batches = useMaterialBatchStore((state) => state.rows);
  const issues = useMaterialIssueStore((state) => state.rows);
  const issueAction = useMaterialIssueStore((state) => state.issue);
  const guard = useMaterialIssueGuard(issues, batches);
  const [quantity, setQuantity] = useState("");
  const [openedAt, setOpenedAt] = useState(nowLocal());
  const batch = batches.find((row) => row.id === issue.batch_id);
  const blockers = guard.blockersFor(issue, Number(quantity) || 0);
  const invalid = !quantity || Number(quantity) <= 0;
  const blocked = blockers.length > 0;

  const submit = async () => {
    const ok = await issueAction(issue.id, { quantity: Number(quantity), opened_at: new Date(openedAt).toISOString() });
    if (ok) console.info(LOG_TEMPLATES.MaterialIssue[1], issue.issue_no);
  };

  return <article className="row issue-row">
    <div className="cell">
      <strong>{issue.issue_no}</strong>
      <span className="muted">步骤 #{issue.step_id} · 方案 #{issue.plan_id} · 操作人 #{issue.operator_id}</span>
    </div>
    <div className="cell">
      <span>{batch ? `${batch.batch_no} · ${batch.material_name}` : `批次 #${issue.batch_id}`}</span>
      <span className="muted">有效期至 {batch?.expiry_date.slice(0, 10) ?? "—"} · 剩余 {formatGrams(guard.remainingOf(issue.batch_id))}</span>
    </div>
    <div className="cell form-inline">
      <input type="number" min="0" placeholder="克数" value={quantity} onChange={(event) => setQuantity(event.target.value)} />
      <input type="datetime-local" value={openedAt} onChange={(event) => setOpenedAt(event.target.value)} />
      <button className="primary" disabled={invalid || blocked} onClick={submit}>领用</button>
    </div>
    {blocked && <div className="blockers">
      {blockers.map((blocker) => <p key={blocker.code} className="alert">已挡住：{blocker.message}</p>)}
    </div>}
  </article>;
}

function PendingReviewRow({ issue }: { issue: MaterialIssue }) {
  const batches = useMaterialBatchStore((state) => state.rows);
  const review = useMaterialIssueStore((state) => state.review);
  const [reviewerId, setReviewerId] = useState(String(issue.operator_id === 1 ? 2 : 1));
  const [note, setNote] = useState("");
  const batch = batches.find((row) => row.id === issue.batch_id);
  const conflict = Number(reviewerId) === issue.operator_id;

  const submit = async (pass: boolean) => {
    const ok = await review(issue.id, { reviewer_id: Number(reviewerId), pass, note });
    if (ok) console.info(LOG_TEMPLATES.MaterialIssue[2], issue.issue_no);
  };

  return <article className="row issue-row">
    <div className="cell">
      <strong>{issue.issue_no}</strong>
      <span className="muted">步骤 #{issue.step_id} · 方案 #{issue.plan_id} · 操作人 #{issue.operator_id}</span>
    </div>
    <div className="cell">
      <span>{batch ? `${batch.batch_no} · ${batch.material_name}` : `批次 #${issue.batch_id}`}</span>
      <span className="muted">领用 {formatGrams(issue.quantity)} · 开封 {formatDateOrDash(issue.opened_at)}</span>
    </div>
    <div className="cell form-inline">
      <input type="number" min="1" placeholder="复核人 ID" value={reviewerId} onChange={(event) => setReviewerId(event.target.value)} />
      <input type="text" placeholder="复核意见" value={note} onChange={(event) => setNote(event.target.value)} />
      <button className="primary" disabled={conflict || !reviewerId} onClick={() => submit(true)}>复核通过</button>
      <button disabled={conflict || !reviewerId} onClick={() => submit(false)}>退回</button>
    </div>
    {conflict && <div className="blockers"><p className="alert">已挡住：{ERROR_MESSAGES.MATERIAL_REVIEWER_CONFLICT}</p></div>}
  </article>;
}

function ReadonlyIssueRow({ issue }: { issue: MaterialIssue }) {
  const batches = useMaterialBatchStore((state) => state.rows);
  const batch = batches.find((row) => row.id === issue.batch_id);
  return <article className={"row issue-row" + (issue.status === "ARCHIVED" ? " archived" : "")}>
    <div className="cell">
      <strong>{issue.issue_no}</strong>
      <span className="muted">步骤 #{issue.step_id} · 方案 #{issue.plan_id} · 第 {issue.round} 单</span>
    </div>
    <div className="cell">
      <span>{batch ? `${batch.batch_no} · ${batch.material_name}` : `批次 #${issue.batch_id}`}</span>
      <span className="muted">领用 {formatGrams(issue.quantity)} · 开封 {formatDateOrDash(issue.opened_at)}</span>
    </div>
    <div className="cell">
      <MaterialIssueStatusBadge value={issue.status} />
      <span className="muted">
        {issue.status === "ARCHIVED"
          ? `留档 ${formatDateOrDash(issue.archived_at)} · ${issue.review_note || "方案退回重审"}`
          : `复核人 #${issue.reviewer_id ?? "—"} · ${formatDateOrDash(issue.reviewed_at)}`}
      </span>
    </div>
  </article>;
}

export function MaterialsPage() {
  const batchStore = useMaterialBatchStore();
  const issueStore = useMaterialIssueStore();
  const stepStore = useRestorationStepStore();
  const [tab, setTab] = useState<(typeof MaterialIssueStatus)[number]>("PENDING_ISSUE");
  const [batchForm, setBatchForm] = useState(() => createMaterialBatchForm());
  const [issueForm, setIssueForm] = useState(() => createMaterialIssueForm());

  useEffect(() => {
    batchStore.load();
    issueStore.load();
    stepStore.load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const guard = useMaterialIssueGuard(issueStore.rows, batchStore.rows);
  const counts = useMemo(() => {
    const result: Record<string, number> = { PENDING_ISSUE: 0, PENDING_REVIEW: 0, COMPLETED: 0, ARCHIVED: 0 };
    issueStore.rows.forEach((row) => { result[row.status] = (result[row.status] ?? 0) + 1; });
    return result;
  }, [issueStore.rows]);
  const tabRows = useMemo(() => issueStore.rows.filter((row) => row.status === tab), [issueStore.rows, tab]);

  const submitBatch = async () => {
    const ok = await batchStore.stockIn({ ...batchForm, total_quantity: Number(batchForm.total_quantity), stocked_by: Number(batchForm.stocked_by) });
    if (ok) {
      console.info(LOG_TEMPLATES.MaterialBatch[0], batchForm.batch_no);
      setBatchForm(createMaterialBatchForm());
    }
  };

  const submitIssue = async () => {
    const step = stepStore.rows.find((row) => row.id === Number(issueForm.step_id));
    if (!step) return;
    const ok = await issueStore.create({
      batch_id: Number(issueForm.batch_id),
      step_id: step.id,
      plan_id: step.plan_id,
      operator_id: Number(issueForm.operator_id)
    });
    if (ok) {
      console.info(LOG_TEMPLATES.MaterialIssue[0], `step#${step.id}`);
      setIssueForm(createMaterialIssueForm());
    }
  };

  return <main className="page">
    <section className="page-head">
      <div>
        <p className="eyebrow">relic-restore</p>
        <h1>材料台账</h1>
      </div>
      <MaterialIssueStatusBadge value={tab} />
    </section>

    <section className="metrics">
      <StatCard label="材料批次" value={batchStore.rows.length} />
      <StatCard label="待领用" value={counts.PENDING_ISSUE} />
      <StatCard label="待复核" value={counts.PENDING_REVIEW} />
      <StatCard label="已完成" value={counts.COMPLETED} />
    </section>

    {(batchStore.error || issueStore.error) && <p className="alert">已挡住：{batchStore.error || issueStore.error}</p>}

    <section className="panel wide">
      <h2>批次台账（入库登记）</h2>
      <div className="table">
        {batchStore.rows.map((batch) => <article key={batch.id} className="row">
          <strong>{batch.batch_no} · {batch.material_name}</strong>
          <span>总量 {formatGrams(batch.total_quantity)} · 剩余 {formatGrams(guard.remainingOf(batch.id))} · 有效期至 {batch.expiry_date.slice(0, 10)}</span>
          <StatusBadge value={guard.isExpired(batch.id) ? "EXPIRED" : "IN_STOCK"} />
        </article>)}
        {batchStore.rows.length === 0 && <EmptyState title="暂无材料批次" />}
      </div>
      <div className="form-inline stock-form">
        <input type="text" placeholder="批号" value={batchForm.batch_no} onChange={(event) => setBatchForm({ ...batchForm, batch_no: event.target.value })} />
        <input type="text" placeholder="材料名称" value={batchForm.material_name} onChange={(event) => setBatchForm({ ...batchForm, material_name: event.target.value })} />
        <input type="number" min="0" placeholder="总量（克）" value={batchForm.total_quantity || ""} onChange={(event) => setBatchForm({ ...batchForm, total_quantity: Number(event.target.value) })} />
        <input type="date" value={batchForm.expiry_date} onChange={(event) => setBatchForm({ ...batchForm, expiry_date: event.target.value })} />
        <input type="number" min="1" placeholder="入库人 ID" value={batchForm.stocked_by || ""} onChange={(event) => setBatchForm({ ...batchForm, stocked_by: Number(event.target.value) })} />
        <button className="primary" disabled={!batchForm.batch_no || !batchForm.material_name || !batchForm.total_quantity || !batchForm.expiry_date} onClick={submitBatch}>入库登记</button>
      </div>
    </section>

    <section className="panel wide">
      <h2>新建领用单（步骤开始后开单）</h2>
      <div className="form-inline">
        <select value={issueForm.step_id || ""} onChange={(event) => setIssueForm({ ...issueForm, step_id: Number(event.target.value) })}>
          <option value="">选择修复步骤</option>
          {stepStore.rows.map((step) => <option key={step.id} value={step.id}>步骤 #{step.id} · {step.technique}（方案 #{step.plan_id}）</option>)}
        </select>
        <select value={issueForm.batch_id || ""} onChange={(event) => setIssueForm({ ...issueForm, batch_id: Number(event.target.value) })}>
          <option value="">选择材料批次</option>
          {batchStore.rows.map((batch) => <option key={batch.id} value={batch.id}>{batch.batch_no} · {batch.material_name}（剩余 {formatGrams(guard.remainingOf(batch.id))}）</option>)}
        </select>
        <input type="number" min="1" placeholder="操作人 ID" value={issueForm.operator_id || ""} onChange={(event) => setIssueForm({ ...issueForm, operator_id: Number(event.target.value) })} />
        <button className="primary" disabled={!issueForm.step_id || !issueForm.batch_id || !issueForm.operator_id} onClick={submitIssue}>开单</button>
      </div>
      <p className="muted">重开步骤会自动另开新单（单号轮次递增），退回留档的旧单在「已归档」中追查。</p>
    </section>

    <section className="panel wide">
      <div className="tabs">
        {MaterialIssueStatus.map((status) => <button key={status} className={tab === status ? "active" : ""} onClick={() => setTab(status)}>
          {MaterialIssueStatusText[status]}（{counts[status]}）
        </button>)}
      </div>
      <div className="table">
        {tab === "PENDING_ISSUE" && tabRows.map((issue) => <PendingIssueRow key={issue.id} issue={issue} />)}
        {tab === "PENDING_REVIEW" && tabRows.map((issue) => <PendingReviewRow key={issue.id} issue={issue} />)}
        {(tab === "COMPLETED" || tab === "ARCHIVED") && tabRows.map((issue) => <ReadonlyIssueRow key={issue.id} issue={issue} />)}
        {tabRows.length === 0 && <EmptyState title={`暂无${MaterialIssueStatusText[tab]}领用单`} />}
      </div>
    </section>
  </main>;
}
