import { restorationPlanRepository } from "../repositories/RestorationPlanRepository";
import { materialRequisitionService } from "./MaterialRequisitionService";

export const restorationPlanService = {
  list: () => restorationPlanRepository.findAll(),
  create: (row: unknown) => restorationPlanRepository.save(row as never),
  // 方案进度：材料复核通过的步骤数 / 方案步骤总数。
  progress: (planId: number) => materialRequisitionService.planProgress(planId),
  // 方案退回重审：领用记录留档，重开的步骤回到待领用并须另开新单。
  reject: (planId: number, reopenStepIds: number[] = []) => {
    restorationPlanRepository.update(planId, { approval_status: "REJECTED" });
    return materialRequisitionService.archiveForPlan(planId, reopenStepIds);
  }
};
