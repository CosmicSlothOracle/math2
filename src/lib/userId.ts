/**
 * Client-side utility for managing stable anonymous user IDs.
 * Reads from cookie (set by server) or generates/stores one locally.
 */

/**
 * Gets the anonymous user ID from cookie or localStorage.
 * Returns null if not found (server will generate one).
 */
export function getAnonId(): string | null {
  // Try cookie first (set by server via Set-Cookie header)
  if (typeof document !== 'undefined') {
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'mm_anon_id' && value) {
        return value;
      }
    }
  }

  // Fallback to localStorage (for client-side generation before first server call)
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('mm_anon_id');
    if (stored) {
      return stored;
    }
  }

  return null;
}

/**
 * Stores the anonymous user ID in localStorage (as backup to cookie).
 * Called when server returns a Set-Cookie header with mm_anon_id.
 */
export function setAnonId(id: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('mm_anon_id', id);
  }
}

/**
 * Gets headers for API requests, including anonymous ID if available.
 * Also includes Netlify Identity JWT if available.
 */
export function getApiHeaders(): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };

  // Add anonymous ID header if available
  const anonId = getAnonId();
  if (anonId) {
    headers['x-anon-id'] = anonId;
  }

  // Add Netlify Identity JWT if available
  try {
    // @ts-ignore
    const ni = (window as any).netlifyIdentity;
    if (ni && typeof ni.currentUser === 'function') {
      const current = ni.currentUser();
      if (current && current.token && current.token.access_token) {
        headers['Authorization'] = `Bearer ${current.token.access_token}`;
      }
    }
  } catch (e) {
    // ignore
  }

  return headers;
}

/**
 * Processes a response to extract and store anonymous ID from Set-Cookie header.
 * Should be called after fetch() to persist the ID.
 */
export function processResponseHeaders(response: Response): void {
  const setCookie = response.headers.get('set-cookie');
  if (setCookie) {
    const match = setCookie.match(/mm_anon_id=([^;]+)/);
    if (match && match[1]) {
      setAnonId(match[1]);
    }
  }
}

