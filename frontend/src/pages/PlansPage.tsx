import { useEffect, useMemo, useState } from "react";
import { useRestorationPlanStore } from "../stores/RestorationPlanStore";
import { useRestorationStepStore } from "../stores/RestorationStepStore";
import { useMaterialRequisitionStore } from "../stores/MaterialRequisitionStore";
import { MaterialRequisitionPanel } from "../components/common/MaterialRequisitionPanel";
import { StatusBadge } from "../components/common/StatusBadge";

// 修复方案页：选择方案查看其步骤与材料领用现场（与材料页共用 MaterialRequisitionPanel）。
export function PlansPage() {
  const { rows: plans, load: loadPlans } = useRestorationPlanStore();
  const steps = useRestorationStepStore((s) => s.rows);
  const loadSteps = useRestorationStepStore((s) => s.load);
  const archiveForPlan = useMaterialRequisitionStore((s) => s.archiveForPlan);
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    void loadPlans();
    void loadSteps();
  }, [loadPlans, loadSteps]);

  useEffect(() => {
    if (selectedPlanId == null && plans.length > 0) setSelectedPlanId(plans[0].id);
  }, [plans, selectedPlanId]);

  const planSteps = useMemo(
    () => (selectedPlanId == null ? [] : steps.filter((step) => step.plan_id === selectedPlanId)),
    [steps, selectedPlanId]
  );

  // 退回重审：领用记录留档，该方案步骤回到待领用，重开须另开新单。
  const rejectPlan = async () => {
    if (selectedPlanId == null) return;
    const reopenStepIds = steps.filter((step) => step.plan_id === selectedPlanId).map((step) => step.id);
    const archived = await archiveForPlan(selectedPlanId, reopenStepIds);
    setMessage(`方案 #${selectedPlanId} 已退回重审，${archived.length} 张领用单留档，重开步骤须另开新单`);
    void loadSteps();
  };

  return (
    <main className="page">
      <section className="page-head">
        <div>
          <p className="eyebrow">relic-restore</p>
          <h1>修复方案与步骤现场</h1>
        </div>
      </section>

      <section className="panel">
        <h2>方案列表</h2>
        <div className="table">
          {plans.map((plan) => (
            <button
              key={plan.id}
              className={"row plan-row" + (plan.id === selectedPlanId ? " selected" : "")}
              onClick={() => { setSelectedPlanId(plan.id); setMessage(null); }}
            >
              <strong>方案 #{plan.id} · {plan.plan_title}</strong>
              <StatusBadge value={plan.approval_status} />
            </button>
          ))}
        </div>
      </section>

      {selectedPlanId != null && (
        <>
          <section className="panel">
            <div className="mat-card-head">
              <h2>方案 #{selectedPlanId} 的步骤</h2>
              <button className="btn danger" onClick={rejectPlan}>方案退回重审（领用单留档）</button>
            </div>
            {message && <div className="guard guard-ok" role="status"><span>{message}</span></div>}
            <div className="table">
              {planSteps.map((step) => (
                <article key={step.id} className="row mat-row">
                  <span>
                    <strong>工序 {step.step_order} · {step.technique}</strong>
                    <em className="mat-name">{step.material_used || "尚未领用材料"}</em>
                  </span>
                  <StatusBadge value={step.step_status} />
                </article>
              ))}
            </div>
          </section>
          <MaterialRequisitionPanel planId={selectedPlanId} title={`方案 #${selectedPlanId} 的材料领用现场`} />
        </>
      )}
    </main>
  );
}
