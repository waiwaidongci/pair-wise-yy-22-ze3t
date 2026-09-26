import { mockData } from "../mocks/seedData";
import { postJson } from "./request";
import type { MaterialStock } from "../types/MaterialStock";

const endpoint = "/api/material-stock";

export async function listMaterialStock(): Promise<MaterialStock[]> {
  try {
    const res = await fetch(endpoint);
    if (res.ok) return await res.json();
  } catch {
    // Local mock fallback keeps the UI available during offline review.
  }
  return [...(mockData.materialStock as unknown as MaterialStock[])];
}

export function stockInMaterial(payload: {
  material_name: string;
  batch_no: string;
  total_amount: number;
  unit: string;
  expire_date: string;
  stocked_in_by: number;
}) {
  return postJson<MaterialStock>(endpoint, payload);
}
