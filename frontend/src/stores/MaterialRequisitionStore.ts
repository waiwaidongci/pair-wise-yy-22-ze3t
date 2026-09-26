import { create } from "zustand";
import {
  listMaterialRequisition,
  issueMaterial,
  reviewMaterialRequisition,
  archiveRequisitionsForPlan
} from "../api/MaterialRequisition";
import type { MaterialRequisition, MaterialRequisitionBucket } from "../types/MaterialRequisition";

type IssuePayload = {
  step_id: number;
  batch_no: string;
  used_amount: number;
  opened_at?: string;
  operator_id: number;
  replaced_requisition_id?: number;
};

type State = {
  rows: MaterialRequisition[];
  loading: boolean;
  bucket: MaterialRequisitionBucket | "ALL";
  setBucket: (bucket: MaterialRequisitionBucket | "ALL") => void;
  load: () => Promise<void>;
  issue: (payload: IssuePayload) => Promise<MaterialRequisition>;
  review: (id: number, reviewerId: number, reviewNote: string) => Promise<MaterialRequisition>;
  archiveForPlan: (planId: number, reopenStepIds: number[]) => Promise<MaterialRequisition[]>;
};

const patchRow = (rows: MaterialRequisition[], updated: MaterialRequisition) =>
  rows.map((row) => (row.id === updated.id ? updated : row));

// 始终全量拉取：待领用页要据此计算跨方案批号占用与累计用量，三段清单在前端本地分桶。
export const useMaterialRequisitionStore = create<State>((set) => ({
  rows: [],
  loading: false,
  bucket: "ALL",
  setBucket(bucket) {
    set({ bucket });
  },
  async load() {
    set({ loading: true });
    set({ rows: await listMaterialRequisition(), loading: false });
  },
  async issue(payload) {
    const created = await issueMaterial(payload);
    set((state) => ({ rows: [created, ...state.rows] }));
    return created;
  },
  async review(id, reviewerId, reviewNote) {
    const updated = await reviewMaterialRequisition(id, { reviewer_id: reviewerId, review_note: reviewNote });
    set((state) => ({ rows: patchRow(state.rows, updated) }));
    return updated;
  },
  async archiveForPlan(planId, reopenStepIds) {
    const archived = await archiveRequisitionsForPlan(planId, reopenStepIds);
    set((state) => {
      const byId = new Map(archived.map((row) => [row.id, row]));
      return { rows: state.rows.map((row) => byId.get(row.id) ?? row) };
    });
    return archived;
  }
}));
