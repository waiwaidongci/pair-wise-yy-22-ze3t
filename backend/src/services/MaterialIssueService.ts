import { ERROR_CODES } from "../constants/errorCodes";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import { MaterialIssueStatus } from "../constants/MaterialIssueStatus";
import { materialBatchRepository } from "../repositories/MaterialBatchRepository";
import { materialIssueRepository } from "../repositories/MaterialIssueRepository";
import { createMaterialIssueDto } from "../constructors/MaterialIssueDtoFactory";
import { toMaterialIssueNo } from "../utils/formatters";
import type { MaterialIssue } from "../models/MaterialIssue";
import type { MaterialIssuePayload } from "../types/MaterialIssuePayload";

const [PENDING_ISSUE, PENDING_REVIEW, COMPLETED, ARCHIVED] = MaterialIssueStatus;

function fail(status: number, code: keyof typeof ERROR_CODES): never {
  throw { status, code, message: ERROR_MESSAGES[code] };
}

// 已消耗克数：凡登记过克数的领用单都计入，退回留档的旧单同样消耗库存
const consumedOf = (batchId: number, excludeId?: number): number =>
  materialIssueRepository.findAll()
    .filter((row) => row.batch_id === batchId && row.id !== excludeId && typeof row.quantity === "number")
    .reduce((sum, row) => sum + (row.quantity ?? 0), 0);

// 批号占用：同批号存在其他方案的待领用/待复核单，视为被未结方案占用
const occupyingIssue = (batchId: number, planId: number, excludeId?: number): MaterialIssue | undefined =>
  materialIssueRepository.findAll().find((row) =>
    row.batch_id === batchId && row.plan_id !== planId && row.id !== excludeId &&
    (row.status === PENDING_ISSUE || row.status === PENDING_REVIEW));

export const materialIssueService = {
  list: (): MaterialIssue[] => materialIssueRepository.findAll(),

  create: (payload: MaterialIssuePayload): MaterialIssue => {
    const batch = materialBatchRepository.findById(Number(payload.batch_id));
    if (!batch) fail(404, "MATERIAL_BATCH_NOT_FOUND");
    const stepId = Number(payload.step_id);
    const round = materialIssueRepository.nextRound(stepId);
    const row = createMaterialIssueDto({
      ...payload,
      id: materialIssueRepository.nextId(),
      issue_no: toMaterialIssueNo(stepId, round),
      batch_id: batch.id,
      step_id: stepId,
      plan_id: Number(payload.plan_id),
      operator_id: Number(payload.operator_id),
      round,
      status: PENDING_ISSUE,
      created_at: new Date().toISOString()
    }) as MaterialIssue;
    console.info(LOG_TEMPLATES.MaterialIssue[0], row.issue_no);
    return materialIssueRepository.save(row);
  },

  issue: (id: number, payload: MaterialIssuePayload): MaterialIssue => {
    const row = materialIssueRepository.findById(id);
    if (!row) fail(404, "MATERIAL_ISSUE_NOT_FOUND");
    const batch = materialBatchRepository.findById(row.batch_id);
    if (!batch) fail(404, "MATERIAL_BATCH_NOT_FOUND");
    if (new Date(batch.expiry_date).getTime() < Date.now()) fail(409, "MATERIAL_EXPIRED");
    const quantity = Number(payload.quantity);
    if (!Number.isFinite(quantity) || quantity <= 0) fail(400, "VALIDATION_FAILED");
    if (consumedOf(batch.id, id) + quantity > batch.total_quantity) fail(409, "MATERIAL_OVER_ISSUED");
    if (occupyingIssue(batch.id, row.plan_id, id)) fail(409, "MATERIAL_BATCH_OCCUPIED");
    console.info(LOG_TEMPLATES.MaterialIssue[1], row.issue_no);
    return materialIssueRepository.update(id, {
      quantity,
      opened_at: String(payload.opened_at ?? new Date().toISOString()),
      status: PENDING_REVIEW
    }) as MaterialIssue;
  },

  review: (id: number, payload: MaterialIssuePayload): MaterialIssue => {
    const row = materialIssueRepository.findById(id);
    if (!row) fail(404, "MATERIAL_ISSUE_NOT_FOUND");
    const reviewerId = Number(payload.reviewer_id);
    if (!Number.isFinite(reviewerId) || reviewerId === row.operator_id) fail(409, "MATERIAL_REVIEWER_CONFLICT");
    const pass = payload.pass !== false;
    const now = new Date().toISOString();
    console.info(LOG_TEMPLATES.MaterialIssue[2], row.issue_no);
    return materialIssueRepository.update(id, pass
      ? { status: COMPLETED, reviewer_id: reviewerId, reviewed_at: now, review_note: String(payload.note ?? "") }
      : { status: ARCHIVED, reviewer_id: reviewerId, reviewed_at: now, review_note: String(payload.note ?? ""), archived_at: now }) as MaterialIssue;
  },

  archiveByPlan: (planId: number, payload: MaterialIssuePayload): number => {
    const now = new Date().toISOString();
    const note = String(payload?.note ?? "方案退回重审，领用记录留档");
    const rows = materialIssueRepository.findAll().filter((row) =>
      row.plan_id === planId && (row.status === PENDING_ISSUE || row.status === PENDING_REVIEW));
    rows.forEach((row) => {
      console.info(LOG_TEMPLATES.MaterialIssue[3], row.issue_no);
      materialIssueRepository.update(row.id, { status: ARCHIVED, archived_at: now, review_note: note });
    });
    return rows.length;
  },

  planProgress: (planId: number) => {
    const rows = materialIssueRepository.findAll().filter((row) => row.plan_id === planId && row.status !== ARCHIVED);
    const completed = rows.filter((row) => row.status === COMPLETED).length;
    return { plan_id: planId, total: rows.length, completed };
  }
};
