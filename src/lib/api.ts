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

  let data: any;
  try {
    data = await resp.json();
  } catch (parseErr) {
    // If response is not JSON, throw with status
    throw new Error(`apiGet ${path} failed: ${resp.status} (non-JSON response)`);
  }

  // Check if response indicates an error (even if status is 200)
  if (!resp.ok || (data && data.ok === false)) {
    const errorMsg = data?.error || data?.message || `HTTP ${resp.status}`;
    const error = new Error(`apiGet ${path} failed: ${errorMsg}`);
    (error as any).status = resp.status;
    (error as any).responseData = data;
    throw error;
  }

  persistUserIdFromResponse(data); // Also persist from response body
  return data;
}

export async function apiPost(path: string, body: any) {
  const headers = getApiHeaders();
  const resp = await fetch(path, { method: 'POST', headers, body: JSON.stringify(body) });
  processResponseHeaders(resp); // Store anon ID from Set-Cookie if present

  let data: any;
  try {
    data = await resp.json();
  } catch (parseErr) {
    // If response is not JSON, throw with status
    throw new Error(`apiPost ${path} failed: ${resp.status} (non-JSON response)`);
  }

  // Check if response indicates an error (even if status is 200)
  if (!resp.ok || (data && data.ok === false)) {
    const errorMsg = data?.error || data?.message || `HTTP ${resp.status}`;
    const error = new Error(`apiPost ${path} failed: ${errorMsg}`);
    (error as any).status = resp.status;
    (error as any).responseData = data;
    throw error;
  }

  persistUserIdFromResponse(data); // Also persist from response body
  return data;
}


