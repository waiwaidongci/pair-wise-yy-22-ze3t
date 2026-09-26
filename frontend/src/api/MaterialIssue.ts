import { mockData } from "../mocks/seedData";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import type { MaterialIssue } from "../types/MaterialIssue";

const endpoint = "/api/material-issue";
const errorText: Record<string, string> = ERROR_MESSAGES;

export async function listMaterialIssue(): Promise<MaterialIssue[]> {
  if (typeof fetch !== "undefined" && endpoint.startsWith("/api") && true) {
    try {
      const res = await fetch(endpoint);
      if (res.ok) return await res.json();
    } catch {
      // Local mock fallback keeps the UI available during offline review.
    }
  }
  return [...(mockData.materialIssue as unknown as MaterialIssue[])];
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

export async function createMaterialIssue(payload: Partial<MaterialIssue>): Promise<MaterialIssue> {
  return post<MaterialIssue>(endpoint, payload);
}

export async function issueMaterial(id: number, payload: { quantity: number; opened_at: string }): Promise<MaterialIssue> {
  return post<MaterialIssue>(`${endpoint}/${id}/issue`, payload);
}

export async function reviewMaterialIssue(id: number, payload: { reviewer_id: number; pass: boolean; note?: string }): Promise<MaterialIssue> {
  return post<MaterialIssue>(`${endpoint}/${id}/review`, payload);
}

export async function returnMaterialIssuesByPlan(planId: number, note?: string): Promise<{ archived: number }> {
  return post<{ archived: number }>(`${endpoint}/plan/${planId}/return`, { note });
}
