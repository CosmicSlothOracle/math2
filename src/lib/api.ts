import { getApiHeaders, processResponseHeaders } from './userId';

export async function apiGet(path: string) {
  const headers = getApiHeaders();
  const resp = await fetch(path, { method: 'GET', headers });
  processResponseHeaders(resp); // Store anon ID from Set-Cookie if present
  if (!resp.ok) throw new Error(`apiGet ${path} failed: ${resp.status}`);
  return resp.json();
}

export async function apiPost(path: string, body: any) {
  const headers = getApiHeaders();
  const resp = await fetch(path, { method: 'POST', headers, body: JSON.stringify(body) });
  processResponseHeaders(resp); // Store anon ID from Set-Cookie if present
  if (!resp.ok) throw new Error(`apiPost ${path} failed: ${resp.status}`);
  return resp.json();
}


