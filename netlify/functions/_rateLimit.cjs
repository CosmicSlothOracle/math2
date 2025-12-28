// Simple in-memory rate limiting for Netlify Functions
// Note: This is per-instance, so doesn't work across multiple Lambda instances
// For production, consider using Redis or Netlify's built-in rate limiting

// In-memory store: { identifier: { count: number, resetAt: timestamp } }
const rateLimitStore = new Map();

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (value.resetAt < now) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

/**
 * Simple rate limiter that checks if an identifier has exceeded the limit
 * @param {string} identifier - IP address, user ID, or other unique identifier
 * @param {number} maxRequests - Maximum requests allowed in the window
 * @param {number} windowMs - Time window in milliseconds
 * @returns {Object} { allowed: boolean, remaining: number, resetAt: number }
 */
function checkRateLimit(identifier, maxRequests = 10, windowMs = 60000) {
  const now = Date.now();
  const key = `${identifier}`;

  let entry = rateLimitStore.get(key);

  // Create new entry or reset if window expired
  if (!entry || entry.resetAt < now) {
    entry = {
      count: 0,
      resetAt: now + windowMs
    };
  }

  // Increment count
  entry.count++;
  rateLimitStore.set(key, entry);

  const allowed = entry.count <= maxRequests;
  const remaining = Math.max(0, maxRequests - entry.count);

  return {
    allowed,
    remaining,
    resetAt: entry.resetAt,
    count: entry.count
  };
}

/**
 * Extract client IP from Netlify event
 * Netlify provides IP in headers: x-nf-client-connection-ip or x-forwarded-for
 */
function getClientIP(event) {
  const headers = event.headers || {};
  // Netlify provides real client IP
  return headers['x-nf-client-connection-ip']
    || headers['x-forwarded-for']?.split(',')[0]?.trim()
    || headers['client-ip']
    || 'unknown';
}

/**
 * Check if User-Agent looks like a bot
 */
function isBotUserAgent(userAgent) {
  if (!userAgent || typeof userAgent !== 'string') return true; // No UA = suspicious

  const ua = userAgent.toLowerCase();
  const botPatterns = [
    'bot', 'crawler', 'spider', 'scraper', 'scrape',
    'curl', 'wget', 'python', 'java', 'go-http',
    'http', 'libwww', 'lwp-trivial', 'www::mechanize',
    'phpscheduleit', 'masscan', 'nikto', 'sqlmap',
    'scan', 'monitor', 'uptime', 'pingdom',
    'ahrefs', 'semrush', 'dotbot', 'mj12bot',
    'baiduspider', 'yandex', 'petalbot'
  ];

  return botPatterns.some(pattern => ua.includes(pattern));
}

/**
 * Check if request should be blocked based on User-Agent
 */
function shouldBlockByUserAgent(event) {
  const headers = event.headers || {};
  const userAgent = headers['user-agent'] || headers['User-Agent'] || '';
  return isBotUserAgent(userAgent);
}

module.exports = {
  checkRateLimit,
  getClientIP,
  isBotUserAgent,
  shouldBlockByUserAgent
};

