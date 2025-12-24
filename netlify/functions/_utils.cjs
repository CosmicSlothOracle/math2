// Utility helpers for Netlify functions

/**
 * Generates or retrieves a stable anonymous user ID.
 * Uses a cookie-based approach for persistence across requests.
 * In production, this ensures consistent user IDs even without authentication.
 */
function getOrCreateAnonId(event) {
  const headers = event.headers || {};
  const cookies = headers['cookie'] || headers['Cookie'] || '';

  // Try to extract anon_id from cookie (with error handling)
  try {
    if (typeof cookies === 'string' && cookies.length > 0) {
      const cookieMatch = cookies.match(/(?:^|;\s*)mm_anon_id=([^;]+)/);
      if (cookieMatch && cookieMatch[1]) {
        return cookieMatch[1];
      }
    }
  } catch (cookieErr) {
    console.warn('[getOrCreateAnonId] Cookie parsing error:', cookieErr.message);
    // Fall through to header check
  }

  // Try x-anon-id header (client can send this)
  const headerAnonId = headers['x-anon-id'] || headers['X-Anon-Id'];
  if (headerAnonId && typeof headerAnonId === 'string' && headerAnonId.length > 0) {
    return headerAnonId;
  }

  // Generate a new stable ID (will be persisted via Set-Cookie header in response)
  // Format: anon_<timestamp>_<random> for uniqueness
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `anon_${timestamp}_${random}`;
}

/**
 * Extracts user ID from event, with priority:
 * 1. x-dev-user header (for local testing)
 * 2. Authorization JWT token (Netlify Identity)
 * 3. Stable anonymous ID (cookie or header-based)
 *
 * In production, this ensures consistent user IDs even without authentication.
 */
function getUserIdFromEvent(event) {
  const headers = event.headers || {};

  // Allow x-dev-user header for local multi-user testing
  const devOverride = headers['x-dev-user'] || headers['X-Dev-User'];
  if (devOverride) {
    console.log('[getUserIdFromEvent] Using dev override:', devOverride);
    return devOverride;
  }

  // Try Authorization header (Netlify Identity JWT)
  const auth = headers['authorization'] || headers['Authorization'] || '';
  if (auth) {
    const token = auth.split(' ')[1] || '';
    try {
      const parts = token.split('.');
      if (parts.length >= 2) {
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
        const userId = payload.sub || payload.user_id || payload.email;
        if (userId) {
          console.log('[getUserIdFromEvent] Using JWT userId:', userId);
          return userId;
        }
      }
    } catch (e) {
      console.warn('[getUserIdFromEvent] JWT decode failed:', e.message);
      // Fall through to anon ID
    }
  }

  // Use stable anonymous ID (cookie or header-based)
  const anonId = getOrCreateAnonId(event);
  const isDev = process.env.NETLIFY_DEV === 'true' || !process.env.SUPABASE_URL;

  if (isDev) {
    // In local dev, use generic dev-user if no anon ID mechanism
    console.log('[getUserIdFromEvent] Dev mode, using anon ID:', anonId);
    return anonId;
  }

  // Production: always use stable anon ID
  console.log('[getUserIdFromEvent] Using stable anon ID:', anonId);
  return anonId;
}

module.exports = { getUserIdFromEvent };


