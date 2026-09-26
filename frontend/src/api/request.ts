// 统一请求封装：后端业务拦截（过期/超量/批号占用/同人复核）返回 { code, message }，
// 这里转成带 code 的错误，供页面原样展示拦截原因。
export async function postJson<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const error = new Error(data?.message ?? `请求失败（${res.status}）`) as Error & { code?: string; status?: number };
    error.code = data?.code;
    error.status = res.status;
    throw error;
  }
  return data as T;
}
