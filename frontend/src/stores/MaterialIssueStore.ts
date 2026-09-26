import { create } from "zustand";
import {
  createMaterialIssue,
  issueMaterial,
  listMaterialIssue,
  returnMaterialIssuesByPlan,
  reviewMaterialIssue
} from "../api/MaterialIssue";
import type { MaterialIssue } from "../types/MaterialIssue";

type State = {
  rows: MaterialIssue[];
  loading: boolean;
  error: string;
  load: () => Promise<void>;
  create: (payload: Partial<MaterialIssue>) => Promise<boolean>;
  issue: (id: number, payload: { quantity: number; opened_at: string }) => Promise<boolean>;
  review: (id: number, payload: { reviewer_id: number; pass: boolean; note?: string }) => Promise<boolean>;
  returnByPlan: (planId: number, note?: string) => Promise<number>;
  clearError: () => void;
};

export const useMaterialIssueStore = create<State>((set, get) => ({
  rows: [],
  loading: false,
  error: "",
  async load() {
    set({ loading: true });
    set({ rows: await listMaterialIssue(), loading: false });
  },
  async create(payload) {
    set({ error: "" });
    try {
      await createMaterialIssue(payload);
      await get().load();
      return true;
    } catch (err) {
      set({ error: err instanceof Error ? err.message : String(err) });
      return false;
    }
  },
  async issue(id, payload) {
    set({ error: "" });
    try {
      await issueMaterial(id, payload);
      await get().load();
      return true;
    } catch (err) {
      set({ error: err instanceof Error ? err.message : String(err) });
      return false;
    }
  },
  async review(id, payload) {
    set({ error: "" });
    try {
      await reviewMaterialIssue(id, payload);
      await get().load();
      return true;
    } catch (err) {
      set({ error: err instanceof Error ? err.message : String(err) });
      return false;
    }
  },
  async returnByPlan(planId, note) {
    set({ error: "" });
    try {
      const result = await returnMaterialIssuesByPlan(planId, note);
      await get().load();
      return result.archived;
    } catch (err) {
      set({ error: err instanceof Error ? err.message : String(err) });
      return 0;
    }
  },
  clearError() {
    set({ error: "" });
  }
}));
