import { useEffect, useMemo, useState } from "react";
import { useMaterialRequisitionStore } from "../../stores/MaterialRequisitionStore";
import { useMaterialStockStore } from "../../stores/MaterialStockStore";
import { useRestorationStepStore } from "../../stores/RestorationStepStore";
import { useRestorationPlanStore } from "../../stores/RestorationPlanStore";
import { completeRestorationStep } from "../../api/RestorationStepAction";
import { useMaterialGuard } from "../../hooks/useMaterialGuard";
import { MaterialBatchTag } from "./MaterialBatchTag";
import { MaterialGuardAlert } from "./MaterialGuardAlert";
import { MaterialRequisitionStatusText } from "../../constants/MaterialRequisitionStatus";
import { MaterialRequisitionBucketText } from "../../constants/MaterialRequisitionBucket";
import { formatDate, formatGrams } from "../../utils/formatters";
import type { MaterialRequisitionBucket } from "../../types/MaterialRequisition";
import type { RestorationStep } from "../../types/RestorationStep";

const TABS: Array<MaterialRequisitionBucket> = ["TO_PICKUP", "TO_REVIEW", "DONE"];
const ACTIVE_REQ_STATUS = ["PENDING_PICKUP", "ISSUED", "PENDING_REVIEW"];

type IssueFormState = {
  step_id: number;
  batch_no: string;
  used_amount: number | "";
  opened_at: string;
  operator_id: number;
  replaced_requisition_id: number | "";
};

type ReviewFormState = { reviewer_id: number | ""; review_note: string };

const nowLocalInputValue = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
};

function IssueCard({
  step,
  onChanged
}: {
  step: RestorationStep;
  onChanged: () => void;
}) {
  const stockRows = useMaterialStockStore((s) => s.rows);
  const requisitionRows = useMaterialRequisitionStore((s) => s.rows);
  const issue = useMaterialRequisitionStore((s) => s.issue);
  const plans = useRestorationPlanStore((s) => s.rows);
  const [form, setForm] = useState<IssueFormState>({
    step_id: step.id,
    batch_no: "",
    used_amount: "",
    opened_at: nowLocalInputValue(),
    operator_id: 1,
    replaced_requisition_id: ""
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const planTitleById = (id: number) => plans.find((plan) => plan.id === id)?.plan_title ?? "";

  // 方案退回后重开的步骤可关联旧领用单（旧单留档、新单接续可追查）。
  const archivedCandidates = useMemo(
    () => requisitionRows.filter((row) => row.status === "ARCHIVED" && row.plan_id === step.plan_id),
    [requisitionRows, step.plan_id]
  );

  const block = useMaterialGuard({
    stockRows,
    requisitionRows,
    batchNo: form.batch_no,
    requestAmount: Number(form.used_amount || 0),
    planId: step.plan_id,
    planTitleById
  });

  const selectedStock = stockRows.find((row) => row.batch_no === form.batch_no);

  const submit = async () => {
    setError(null);
    if (!form.batch_no || !form.used_amount || !form.operator_id) {
      setError("请填写批号、领用克数与操作人");
      return;
    }
    setSubmitting(true);
    try {
      await issue({
        step_id: step.id,
        batch_no: form.batch_no,
        used_amount: Number(form.used_amount),
        opened_at: form.opened_at ? new Date(form.opened_at).toISOString() : undefined,
        operator_id: Number(form.operator_id),
        replaced_requisition_id:
          form.replaced_requisition_id === "" ? undefined : Number(form.replaced_requisition_id)
      });
      setForm((prev) => ({ ...prev, batch_no: "", used_amount: "", replaced_requisition_id: "" }));
      onChanged();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <article className="mat-card">
      <header className="mat-card-head">
        <div>
          <strong>步骤 #{step.id} · {step.technique}</strong>
          <span className="mat-sub">方案 #{step.plan_id} · 工序序号 {step.step_order}</span>
        </div>
        <span className="badge badge-warn">{MaterialRequisitionStatusText.PENDING_PICKUP}</span>
      </header>

      <div className="mat-form">
        <label>
          材料批号
          <select value={form.batch_no} onChange={(e) => setForm({ ...form, batch_no: e.target.value })}>
            <option value="">请选择已入库批号</option>
            {stockRows.map((stock) => (
              <option key={stock.batch_no} value={stock.batch_no} disabled={stock.expired}>
                {stock.batch_no} · {stock.material_name} · 剩余 {formatGrams(stock.remaining_amount ?? 0, stock.unit)} · 有效期至 {stock.expire_date}
                {stock.expired ? "（已过期）" : ""}
              </option>
            ))}
          </select>
        </label>
        <label>
          领用克数（{selectedStock?.unit ?? "g"}）
          <input
            type="number"
            min={0}
            step={1}
            value={form.used_amount}
            onChange={(e) => setForm({ ...form, used_amount: e.target.value === "" ? "" : Number(e.target.value) })}
            placeholder="例如 30"
          />
        </label>
        <label>
          开封时间
          <input
            type="datetime-local"
            value={form.opened_at}
            onChange={(e) => setForm({ ...form, opened_at: e.target.value })}
          />
        </label>
        <label>
          领用人（修复师编号）
          <input
            type="number"
            min={1}
            value={form.operator_id}
            onChange={(e) => setForm({ ...form, operator_id: Number(e.target.value) })}
          />
        </label>
        <label>
          关联旧单（退回重开时可选）
          <select
            value={form.replaced_requisition_id}
            onChange={(e) => setForm({ ...form, replaced_requisition_id: e.target.value === "" ? "" : Number(e.target.value) })}
          >
            <option value="">无（全新领用）</option>
            {archivedCandidates.map((row) => (
              <option key={row.id} value={row.id}>{row.requisition_no}（{row.batch_no} · 已留档）</option>
            ))}
          </select>
        </label>
      </div>

      <MaterialGuardAlert block={block} />
      {error && <div className="guard guard-error" role="alert"><strong>领用被拦截</strong><span>{error}</span></div>}

      <div className="mat-actions">
        <button className="btn primary" disabled={!!block || submitting} onClick={submit}>
          确认领用并开单
        </button>
        {selectedStock && !block && (
          <span className="mat-hint">
            入库 {formatGrams(selectedStock.total_amount, selectedStock.unit)}，领用后剩余{" "}
            {formatGrams(selectedStock.total_amount - (selectedStock.used_amount ?? 0) - Number(form.used_amount || 0), selectedStock.unit)}
          </span>
        )}
      </div>
    </article>
  );
}

function ReviewRow({ row, onChanged }: { row: import("../../types/MaterialRequisition").MaterialRequisition; onChanged: () => void }) {
  const review = useMaterialRequisitionStore((s) => s.review);
  const loadSteps = useRestorationStepStore((s) => s.load);
  const [form, setForm] = useState<ReviewFormState>({ reviewer_id: "", review_note: "" });
  const [error, setError] = useState<string | null>(null);

  const finishStep = async () => {
    setError(null);
    try {
      await completeRestorationStep(row.step_id);
      onChanged();
      await loadSteps();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const submitReview = async () => {
    setError(null);
    if (!form.reviewer_id) {
      setError("请填写复核修复师编号");
      return;
    }
    try {
      await review(row.id, Number(form.reviewer_id), form.review_note);
      onChanged();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const awaitingStepFinish = row.status === "ISSUED";
  return (
    <article className="mat-card">
      <header className="mat-card-head">
        <div>
          <strong>{row.requisition_no}</strong>
          <span className="mat-sub">方案 #{row.plan_id} · 步骤 #{row.step_id} · 领用人 #{row.operator_id}</span>
        </div>
        <span className={"badge " + (awaitingStepFinish ? "badge-warn" : "badge-info")}>
          {MaterialRequisitionStatusText[row.status]}
        </span>
      </header>
      <dl className="mat-meta">
        <div><dt>批号</dt><dd><MaterialBatchTag batchNo={row.batch_no} /></dd></div>
        <div><dt>材料</dt><dd>{row.material_name}</dd></div>
        <div><dt>领用量</dt><dd>{formatGrams(row.used_amount, row.unit)}</dd></div>
        <div><dt>开封时间</dt><dd>{formatDate(row.opened_at)}</dd></div>
      </dl>

      {error && <div className="guard guard-error" role="alert"><strong>操作失败</strong><span>{error}</span></div>}

      {awaitingStepFinish ? (
        <div className="mat-actions">
          <button className="btn" onClick={finishStep}>步骤完工，送复核</button>
          <span className="mat-hint">完工后由另一名修复师按批号复核，复核通过才计入方案进度</span>
        </div>
      ) : (
        <div className="mat-form">
          <label>
            复核人（须与领用人 #{row.operator_id} 不同）
            <input
              type="number"
              min={1}
              value={form.reviewer_id}
              onChange={(e) => setForm({ ...form, reviewer_id: e.target.value === "" ? "" : Number(e.target.value) })}
            />
          </label>
          <label className="grow">
            复核意见
            <input
              type="text"
              value={form.review_note}
              placeholder="批号、克数与剩余量核对结论"
              onChange={(e) => setForm({ ...form, review_note: e.target.value })}
            />
          </label>
          <div className="mat-actions">
            <button
              className="btn primary"
              disabled={!form.reviewer_id || Number(form.reviewer_id) === row.operator_id}
              onClick={submitReview}
            >
              复核通过
            </button>
            {Number(form.reviewer_id) === row.operator_id && (
              <span className="mat-hint danger">不能由领用人本人复核</span>
            )}
          </div>
        </div>
      )}
    </article>
  );
}

function DoneRow({ row }: { row: import("../../types/MaterialRequisition").MaterialRequisition }) {
  const archived = row.status === "ARCHIVED";
  return (
    <article className="mat-card">
      <header className="mat-card-head">
        <div>
          <strong>{row.requisition_no}</strong>
          <span className="mat-sub">方案 #{row.plan_id} · 步骤 #{row.step_id} · 领用人 #{row.operator_id}</span>
        </div>
        <span className={"badge " + (archived ? "badge-muted" : "badge-ok")}>{MaterialRequisitionStatusText[row.status]}</span>
      </header>
      <dl className="mat-meta">
        <div><dt>批号</dt><dd><MaterialBatchTag batchNo={row.batch_no} /></dd></div>
        <div><dt>领用量</dt><dd>{formatGrams(row.used_amount, row.unit)}</dd></div>
        <div><dt>开封时间</dt><dd>{formatDate(row.opened_at)}</dd></div>
        <div><dt>完工时间</dt><dd>{formatDate(row.completed_at)}</dd></div>
        {!archived && (
          <>
            <div><dt>复核人</dt><dd>修复师 #{row.reviewer_id ?? "—"}</dd></div>
            <div><dt>复核时间</dt><dd>{formatDate(row.reviewed_at ?? "")}</dd></div>
            <div className="full"><dt>复核意见</dt><dd>{row.review_note || "—"}</dd></div>
          </>
        )}
        {archived && (
          <>
            <div><dt>留档时间</dt><dd>{formatDate(row.archived_at ?? "")}</dd></div>
            <div className="full"><dt>留档说明</dt><dd>{row.review_note || "方案退回重审，领用记录留档备查"}</dd></div>
          </>
        )}
        {!archived && row.replaced_requisition_no && (
          <div className="full"><dt>接续旧单</dt><dd>{row.replaced_requisition_no}（旧单已留档，可凭单号追查）</dd></div>
        )}
      </dl>
    </article>
  );
}

// 材料领用现场面板：待领用 / 待复核 / 已完成 三段清单，方案页可按 planId 过滤复用。
export function MaterialRequisitionPanel({ planId, title = "材料领用现场" }: { planId?: number; title?: string }) {
  const { rows, loading, bucket, setBucket, load } = useMaterialRequisitionStore();
  const stockRows = useMaterialStockStore((s) => s.rows);
  const steps = useRestorationStepStore((s) => s.rows);
  const loadStock = useMaterialStockStore((s) => s.load);
  const loadSteps = useRestorationStepStore((s) => s.load);
  const loadPlans = useRestorationPlanStore((s) => s.load);

  // 写操作后统一刷新：领用/完工/复核都会改变领用单、步骤状态与台账剩余量。
  const refreshAll = () => {
    void load();
    void loadSteps();
    void loadStock();
  };

  useEffect(() => {
    void load();
    if (stockRows.length === 0) void loadStock();
    if (steps.length === 0) void loadSteps();
    void loadPlans();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const allRows = useMemo(() => (planId == null ? rows : rows.filter((row) => row.plan_id === planId)), [rows, planId]);

  const counts = useMemo(() => {
    const result: Record<MaterialRequisitionBucket, number> = {
      TO_PICKUP: 0,
      TO_REVIEW: allRows.filter((row) => row.status === "ISSUED" || row.status === "PENDING_REVIEW").length,
      DONE: allRows.filter((row) => row.status === "REVIEWED" || row.status === "ARCHIVED").length
    };
    return result;
  }, [allRows]);

  // 待领用完全以领用单为准：未完工/未留档、且尚无活动领用单的步骤。
  // 方案退回重开后步骤回到待领用，旧单已 ARCHIVED，故会重新出现在这里并须另开新单。
  const openSteps = useMemo(() => {
    const activeReqByStep = new Set<number>();
    rows.filter((row) => ACTIVE_REQ_STATUS.includes(row.status)).forEach((row) => activeReqByStep.add(row.step_id));
    return steps.filter(
      (step) =>
        (planId == null || step.plan_id === planId) &&
        step.step_status !== "COMPLETED" &&
        step.step_status !== "ARCHIVED" &&
        !activeReqByStep.has(step.id)
    );
  }, [steps, rows, planId]);

  const pickupCount = openSteps.length;
  const allCounts: Record<MaterialRequisitionBucket, number> = { ...counts, TO_PICKUP: pickupCount };

  const toReviewRows = allRows.filter((row) => row.status === "ISSUED" || row.status === "PENDING_REVIEW");
  const doneRows = allRows.filter((row) => row.status === "REVIEWED" || row.status === "ARCHIVED");

  return (
    <section className="panel mat-panel">
      <h2>{title}</h2>
      <div className="tabs">
        {TABS.map((tab) => (
          <button key={tab} className={"tab" + (bucket === tab ? " active" : "")} onClick={() => setBucket(tab)}>
            {MaterialRequisitionBucketText[tab]}
            <span className="tab-count">{allCounts[tab]}</span>
          </button>
        ))}
        <button className={"tab" + (bucket === "ALL" ? " active" : "")} onClick={() => setBucket("ALL")}>
          全部
        </button>
      </div>

      {loading && <p className="mat-hint">加载中…</p>}

      {!loading && bucket === "TO_PICKUP" && (
        <div className="mat-list">
          {openSteps.length === 0 && <div className="empty">暂无待领用步骤。步骤开始后在此选择批号、登记克数与开封时间。</div>}
          {openSteps.map((step) => <IssueCard key={step.id} step={step} onChanged={refreshAll} />)}
        </div>
      )}

      {!loading && bucket === "TO_REVIEW" && (
        <div className="mat-list">
          {toReviewRows.length === 0 && <div className="empty">暂无待复核领用单。</div>}
          {toReviewRows.map((row) => <ReviewRow key={row.id} row={row} onChanged={refreshAll} />)}
        </div>
      )}

      {!loading && bucket === "DONE" && (
        <div className="mat-list">
          {doneRows.length === 0 && <div className="empty">暂无已完成记录。</div>}
          {doneRows.map((row) => <DoneRow key={row.id} row={row} />)}
        </div>
      )}

      {!loading && bucket === "ALL" && (
        <div className="mat-list">
          {allRows.length === 0 && <div className="empty">暂无领用记录。</div>}
          {allRows.map((row) =>
            row.status === "REVIEWED" || row.status === "ARCHIVED" ? (
              <DoneRow key={row.id} row={row} />
            ) : (
              <ReviewRow key={row.id} row={row} onChanged={refreshAll} />
            )
          )}
        </div>
      )}
    </section>
  );
}
