// Utility helpers for Netlify functions
function getUserIdFromEvent(event) {
  // Allow x-dev-user header for local multi-user testing
  const headers = event.headers || {};
  const devOverride = headers['x-dev-user'] || headers['X-Dev-User'];
  if (devOverride) return devOverride;

  const auth = headers['authorization'] || headers['Authorization'] || '';
  if (!auth) return 'dev-user';
  const token = auth.split(' ')[1] || '';
  try {
    const parts = token.split('.');
    if (parts.length >= 2) {
      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
      return payload.sub || payload.user_id || payload.sub || payload.email || 'netlify-user';
    }
  } catch (e) {
    // ignore and fall back
  }
  return 'netlify-user';
}

module.exports = { getUserIdFromEvent };


