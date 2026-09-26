import { materialRequisitionRepository } from "../repositories/MaterialRequisitionRepository";
import { materialStockRepository } from "../repositories/MaterialStockRepository";
import { restorationStepRepository } from "../repositories/RestorationStepRepository";
import { restorationPlanRepository } from "../repositories/RestorationPlanRepository";
import { createMaterialRequisitionDto } from "../constructors/MaterialRequisitionDtoFactory";
import { MaterialRequisitionStatus } from "../constants/MaterialRequisitionStatus";
import type { MaterialRequisitionBucket } from "../constants/MaterialRequisitionBucket";
import { ERROR_CODES } from "../constants/errorCodes";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import { ServiceError, formatMessage } from "../utils/serviceError";
import type { MaterialRequisition } from "../models/MaterialRequisition";
import type {
  MaterialRequisitionIssuePayload,
  MaterialRequisitionReviewPayload
} from "../types/MaterialRequisitionPayload";

const nowIso = () => new Date().toISOString();

const STATUS_TO_BUCKET: Record<string, MaterialRequisitionBucket> = {
  PENDING_PICKUP: "TO_PICKUP",
  ISSUED: "TO_REVIEW",
  PENDING_REVIEW: "TO_REVIEW",
  REVIEWED: "DONE",
  ARCHIVED: "DONE"
};

const withView = (row: MaterialRequisition) => ({
  ...row,
  list_bucket: STATUS_TO_BUCKET[row.status] ?? "TO_PICKUP",
  replaced_requisition_no:
    row.replaced_requisition_id == null
      ? null
      : materialRequisitionRepository.findById(row.replaced_requisition_id)?.requisition_no ?? null
});

const assertStep = (stepId: number) => {
  const step = restorationStepRepository.findById(stepId);
  if (!step) {
    throw new ServiceError(400, ERROR_CODES.VALIDATION_FAILED, `修复步骤 #${stepId} 不存在`);
  }
  const plan = restorationPlanRepository.findById(step.plan_id);
  if (!plan) {
    throw new ServiceError(400, ERROR_CODES.VALIDATION_FAILED, `步骤 #${stepId} 所属方案不存在`);
  }
  return { step, plan };
};

export const materialRequisitionService = {
  list(bucket?: string) {
    const rows = materialRequisitionRepository.findAll().map(withView);
    if (bucket === "TO_PICKUP" || bucket === "TO_REVIEW" || bucket === "DONE") {
      return rows.filter((row) => row.list_bucket === bucket);
    }
    return rows;
  },

  // 步骤现场：由操作人在步骤开始后领用，登记批号、克数与开封时间。
  issue(payload: MaterialRequisitionIssuePayload) {
    const step_id = Number(payload.step_id);
    const batch_no = String(payload.batch_no ?? "").trim();
    const used_amount = Number(payload.used_amount);
    const opened_at = String(payload.opened_at ?? "").trim() || nowIso();
    const operator_id = Number(payload.operator_id ?? 0);
    const replacedRaw = payload.replaced_requisition_id;
    const replaced_requisition_id =
      replacedRaw === undefined || replacedRaw === null || replacedRaw === "" ? null : Number(replacedRaw);

    if (!Number.isFinite(step_id) || !batch_no || !Number.isFinite(used_amount) || used_amount <= 0 || !operator_id) {
      throw new ServiceError(400, ERROR_CODES.VALIDATION_FAILED, ERROR_MESSAGES.VALIDATION_FAILED);
    }

    const { step, plan } = assertStep(step_id);

    const stock = materialStockRepository.findByBatchNo(batch_no);
    if (!stock) {
      throw new ServiceError(
        409,
        ERROR_CODES.MATERIAL_BATCH_NOT_FOUND,
        formatMessage(ERROR_MESSAGES.MATERIAL_BATCH_NOT_FOUND, { batchNo: batch_no })
      );
    }

    // 拦截 1：材料已过期。
    const today = new Date().toISOString().slice(0, 10);
    if (stock.expire_date < today) {
      throw new ServiceError(
        409,
        ERROR_CODES.MATERIAL_EXPIRED,
        formatMessage(ERROR_MESSAGES.MATERIAL_EXPIRED, { batchNo: batch_no, expireDate: stock.expire_date })
      );
    }

    // 拦截 2：同批号仍被另一个未结方案占用。
    const occupant = materialRequisitionRepository.findBatchOccupiedByOtherPlan(batch_no, plan.id);
    if (occupant) {
      throw new ServiceError(
        409,
        ERROR_CODES.MATERIAL_BATCH_OCCUPIED,
        formatMessage(ERROR_MESSAGES.MATERIAL_BATCH_OCCUPIED, {
          batchNo: batch_no,
          planId: occupant.plan_id,
          planTitle: restorationPlanRepository.findById(occupant.plan_id)?.plan_title ?? ""
        })
      );
    }

    // 拦截 3：总领用量超过入库量（活动领用单累计 + 本次领用）。
    const usedSoFar = materialRequisitionRepository.sumActiveUsedByBatch(batch_no);
    if (usedSoFar + used_amount > stock.total_amount) {
      throw new ServiceError(
        409,
        ERROR_CODES.MATERIAL_OVERDRAWN,
        formatMessage(ERROR_MESSAGES.MATERIAL_OVERDRAWN, {
          batchNo: batch_no,
          totalAmount: stock.total_amount,
          usedAmount: usedSoFar,
          requestAmount: used_amount
        })
      );
    }

    const id = materialRequisitionRepository.nextId();
    const requisition_no = `MR-${new Date().getFullYear()}-${String(id).padStart(4, "0")}`;

    // 重开步骤另开新单：可关联一张已留档旧单，旧单不删除、新旧单据可互相追查。
    let linkedOld: MaterialRequisition | null = null;
    if (replaced_requisition_id != null) {
      linkedOld = materialRequisitionRepository.findById(replaced_requisition_id) ?? null;
      if (!linkedOld) {
        throw new ServiceError(404, ERROR_CODES.MATERIAL_REQUISITION_NOT_FOUND,
          formatMessage(ERROR_MESSAGES.MATERIAL_REQUISITION_NOT_FOUND, { id: replaced_requisition_id }));
      }
      if (linkedOld.status !== "ARCHIVED") {
        throw new ServiceError(409, ERROR_CODES.VALIDATION_FAILED,
          `领用单 ${linkedOld.requisition_no} 尚未随方案退回留档，不能作为旧单关联`);
      }
    }

    const row = createMaterialRequisitionDto({
      id,
      requisition_no,
      plan_id: plan.id,
      step_id: step.id,
      batch_no,
      material_name: stock.material_name,
      used_amount,
      unit: stock.unit,
      opened_at,
      operator_id,
      replaced_requisition_id: linkedOld?.id ?? null,
      status: MaterialRequisitionStatus[1] // ISSUED：已领用待完工，归入待复核清单
    }) as MaterialRequisition;
    materialRequisitionRepository.save(row);

    restorationStepRepository.update(step.id, {
      step_status: "IN_PROGRESS",
      material_used: `${stock.material_name}（见领用单 ${requisition_no}）`
    });

    return withView(row);
  },

  // 步骤完工：已领用的单据进入待复核，等待另一名修复师按批号核对。
  completeStep(stepId: number) {
    const { step } = assertStep(stepId);
    const rows = materialRequisitionRepository.findByStep(step.id).filter(
      (row) => row.status === "ISSUED" || row.status === "PENDING_PICKUP"
    );
    if (rows.length === 0) {
      throw new ServiceError(400, ERROR_CODES.VALIDATION_FAILED, `步骤 #${stepId} 尚无领用记录，不能完工`);
    }
    rows.forEach((row) =>
      materialRequisitionRepository.update(row.id, {
        status: "PENDING_REVIEW",
        completed_at: nowIso()
      })
    );
    restorationStepRepository.update(step.id, {
      step_status: "COMPLETED",
      finished_at: nowIso()
    });
    return materialRequisitionRepository.findByStep(step.id).map(withView);
  },

  // 完工后由另一名修复师按批号复核，复核通过才计入方案进度。
  review(id: number, payload: MaterialRequisitionReviewPayload) {
    const row = materialRequisitionRepository.findById(id);
    if (!row) {
      throw new ServiceError(
        404,
        ERROR_CODES.MATERIAL_REQUISITION_NOT_FOUND,
        formatMessage(ERROR_MESSAGES.MATERIAL_REQUISITION_NOT_FOUND, { id })
      );
    }
    if (row.status !== "PENDING_REVIEW") {
      throw new ServiceError(
        409,
        ERROR_CODES.MATERIAL_REQUISITION_NOT_REVIEWABLE,
        formatMessage(ERROR_MESSAGES.MATERIAL_REQUISITION_NOT_REVIEWABLE, { id })
      );
    }
    const reviewer_id = Number(payload.reviewer_id ?? 0);
    if (!reviewer_id) {
      throw new ServiceError(400, ERROR_CODES.VALIDATION_FAILED, ERROR_MESSAGES.VALIDATION_FAILED);
    }
    if (reviewer_id === row.operator_id) {
      throw new ServiceError(403, ERROR_CODES.MATERIAL_REVIEW_SELF, ERROR_MESSAGES.MATERIAL_REVIEW_SELF);
    }
    const updated = materialRequisitionRepository.update(id, {
      status: "REVIEWED",
      reviewer_id,
      reviewed_at: nowIso(),
      review_note: String(payload.review_note ?? "")
    }) as MaterialRequisition;
    return withView(updated);
  },

  // 方案进度：已复核步骤数 / 方案步骤总数。
  planProgress(planId: number) {
    const stepIds = restorationStepRepository
      .findAll()
      .filter((step) => step.plan_id === planId)
      .map((step) => step.id);
    const reviewedSteps = stepIds.filter((stepId) =>
      materialRequisitionRepository
        .findByStep(stepId)
        .some((row) => row.status === "REVIEWED")
    ).length;
    return { plan_id: planId, total_steps: stepIds.length, reviewed_steps: reviewedSteps };
  },

  // 方案退回重审：关联领用记录留档，不删除、可追查；重开步骤另开新单。
  archiveForPlan(planId: number, reopenStepIds: number[] = []) {
    const archived = materialRequisitionRepository
      .findAll()
      .filter((row) => row.plan_id === planId && row.status !== "ARCHIVED")
      .map((row) =>
        materialRequisitionRepository.update(row.id, {
          status: "ARCHIVED",
          archived_at: nowIso(),
          review_note: row.review_note || "方案退回重审，领用记录留档备查；重开步骤须另开新单"
        })
      );
    reopenStepIds.forEach((stepId) => {
      restorationStepRepository.update(stepId, { step_status: "PENDING_PICKUP", finished_at: "" });
    });
    return (archived as MaterialRequisition[]).map(withView);
  }
};
