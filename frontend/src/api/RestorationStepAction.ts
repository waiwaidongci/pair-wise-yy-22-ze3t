import { postJson } from "./request";
import type { MaterialRequisition } from "../types/MaterialRequisition";

const endpoint = "/api/restoration-step";

export function completeRestorationStep(id: number) {
  return postJson<MaterialRequisition[]>(`${endpoint}/${id}/complete`, {});
}
