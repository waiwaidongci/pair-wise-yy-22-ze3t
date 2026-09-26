import { create } from "zustand";
import { createMaterialBatch, listMaterialBatch } from "../api/MaterialBatch";
import type { MaterialBatch } from "../types/MaterialBatch";

type State = {
  rows: MaterialBatch[];
  loading: boolean;
  error: string;
  load: () => Promise<void>;
  stockIn: (payload: Partial<MaterialBatch>) => Promise<boolean>;
  clearError: () => void;
};

export const useMaterialBatchStore = create<State>((set, get) => ({
  rows: [],
  loading: false,
  error: "",
  async load() {
    set({ loading: true });
    set({ rows: await listMaterialBatch(), loading: false });
  },
  async stockIn(payload) {
    set({ error: "" });
    try {
      await createMaterialBatch(payload);
      await get().load();
      return true;
    } catch (err) {
      set({ error: err instanceof Error ? err.message : String(err) });
      return false;
    }
  },
  clearError() {
    set({ error: "" });
  }
}));
