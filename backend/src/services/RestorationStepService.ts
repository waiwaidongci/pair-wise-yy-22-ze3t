import { restorationStepRepository } from "../repositories/RestorationStepRepository";
import { materialRequisitionService } from "./MaterialRequisitionService";

export const restorationStepService = {
  list: () => restorationStepRepository.findAll(),
  create: (row: unknown) => restorationStepRepository.save(row as never),
  // 步骤完工：先把已领用材料转入待复核，再落步骤状态。
  complete: (id: number) => materialRequisitionService.completeStep(id)
};
