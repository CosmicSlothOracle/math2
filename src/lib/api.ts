import { getApiHeaders, processResponseHeaders, setAnonId } from './userId';

/**
 * Extracts and persists userId from API response body.
 * This is more reliable than Set-Cookie headers which browsers block via JS.
 */
function persistUserIdFromResponse(data: any): void {
  if (data && typeof data.userId === 'string' && data.userId.length > 0) {
    setAnonId(data.userId);
  }
}

export async function apiGet(path: string) {
  const headers = getApiHeaders();
  const resp = await fetch(path, { method: 'GET', headers });
  processResponseHeaders(resp); // Store anon ID from Set-Cookie if present
  if (!resp.ok) throw new Error(`apiGet ${path} failed: ${resp.status}`);
  const data = await resp.json();
  persistUserIdFromResponse(data); // Also persist from response body
  return data;
}

export async function apiPost(path: string, body: any) {
  const headers = getApiHeaders();
  const resp = await fetch(path, { method: 'POST', headers, body: JSON.stringify(body) });
  processResponseHeaders(resp); // Store anon ID from Set-Cookie if present
  if (!resp.ok) throw new Error(`apiPost ${path} failed: ${resp.status}`);
  const data = await resp.json();
  persistUserIdFromResponse(data); // Also persist from response body
  return data;
}


