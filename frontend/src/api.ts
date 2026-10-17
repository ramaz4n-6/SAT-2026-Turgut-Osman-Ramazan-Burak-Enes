import { API_BASE } from './config';

export interface ApiResult<T> {
  data: T;
  live: boolean;
}

export async function fetchWithFallback<T>(path: string, fallback: T): Promise<ApiResult<T>> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    const response = await fetch(`${API_BASE}${path}`, { signal: controller.signal });
    clearTimeout(timer);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const data = (await response.json()) as T;
    return { data, live: true };
  } catch {
    return { data: fallback, live: false };
  }
}

export function unwrapData<T>(payload: T | { status: string; data: T }): T {
  if (payload && typeof payload === 'object' && 'status' in payload && 'data' in payload) {
    return (payload as { data: T }).data;
  }
  return payload as T;
}
