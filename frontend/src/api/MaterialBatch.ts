import { mockData } from "../mocks/seedData";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import type { MaterialBatch } from "../types/MaterialBatch";

const endpoint = "/api/material-batch";
const errorText: Record<string, string> = ERROR_MESSAGES;

export async function listMaterialBatch(): Promise<MaterialBatch[]> {
  if (typeof fetch !== "undefined" && endpoint.startsWith("/api") && true) {
    try {
      const res = await fetch(endpoint);
      if (res.ok) return await res.json();
    } catch {
      // Local mock fallback keeps the UI available during offline review.
    }
  }
  return [...(mockData.materialBatch as unknown as MaterialBatch[])];
}

async function post<T>(url: string, body: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
  } catch {
    throw new Error("后端服务不可达，请确认 relic-restore-backend 已启动");
  }
  const data = (await res.json().catch(() => ({}))) as { code?: string; message?: string };
  if (!res.ok) {
    throw new Error((data.code && errorText[data.code]) || data.message || `请求失败（${res.status}）`);
  }
  return data as T;
}

export async function createMaterialBatch(payload: Partial<MaterialBatch>): Promise<MaterialBatch> {
  return post<MaterialBatch>(endpoint, payload);
}
