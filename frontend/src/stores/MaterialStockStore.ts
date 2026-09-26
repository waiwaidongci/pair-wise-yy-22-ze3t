import { create } from "zustand";
import { listMaterialStock, stockInMaterial } from "../api/MaterialStock";
import type { MaterialStock } from "../types/MaterialStock";

type StockInPayload = {
  material_name: string;
  batch_no: string;
  total_amount: number;
  unit: string;
  expire_date: string;
  stocked_in_by: number;
};

type State = {
  rows: MaterialStock[];
  loading: boolean;
  load: () => Promise<void>;
  stockIn: (payload: StockInPayload) => Promise<MaterialStock>;
};

export const useMaterialStockStore = create<State>((set) => ({
  rows: [],
  loading: false,
  async load() {
    set({ loading: true });
    set({ rows: await listMaterialStock(), loading: false });
  },
  async stockIn(payload) {
    const created = await stockInMaterial(payload);
    set((state) => ({ rows: [...state.rows, created] }));
    return created;
  }
}));
