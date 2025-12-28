# Bot Traffic Protection - Implementation Guide

This document describes the bot protection measures implemented to reduce unnecessary traffic and API costs.

## Overview

The site was experiencing excessive bot traffic, particularly hitting expensive endpoints like the Gemini API hint service. This implementation adds multiple layers of protection.

## Protection Layers

### 1. robots.txt (Basic Crawler Blocking)

**File:** `robots.txt` (root directory)

Blocks all crawlers from indexing the site. This helps with:
- Search engine crawlers
- SEO crawlers
- General web crawlers

**Note:** Currently blocks ALL crawlers. If you want to allow Google/Bing, uncomment the relevant lines in `robots.txt`.

### 2. User-Agent Bot Detection

**File:** `netlify/functions/_rateLimit.cjs`

Detects common bot patterns in User-Agent strings:
- Known bot identifiers (bot, crawler, spider, scraper)
- Command-line tools (curl, wget, python-requests)
- Security scanners (nikto, sqlmap, masscan)
- SEO tools (ahrefs, semrush, dotbot)

**Blocked requests:** Return 403 Forbidden immediately, no processing.

### 3. Rate Limiting

**File:** `netlify/functions/_rateLimit.cjs`

In-memory rate limiting (per Lambda instance):
- **Default:** 10 requests per 60 seconds per IP address
- **Limit per endpoint:** Configurable (hint endpoint uses 10/min)

**Note:** This is per-instance rate limiting. For production-scale protection across multiple Lambda instances, consider:
- Redis-based rate limiting
- Netlify's built-in rate limiting (if available)
- Third-party services (Cloudflare, etc.)

**Rate limit headers returned:**
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Remaining requests in window
- `X-RateLimit-Reset`: When the limit resets (ISO timestamp)
- `Retry-After`: Seconds until retry allowed (429 responses)

### 4. Registration Requirement

**File:** `netlify/functions/_utils.cjs` → `isUserRegistered()`

Expensive endpoints (like `/hint`) now require user registration:
- User must have a `display_name` in the database
- `display_name` must be at least 2 characters
- `display_name` cannot be the default "User"

**Unregistered users:** Return 401 Unauthorized with error code `USER_NOT_REGISTERED`.

**Graceful degradation:** In dev mode without Supabase, registration check is skipped.

## Protected Endpoints

### `/hint` (Gemini API)

**Protection applied:**
1. ✅ User-Agent bot detection
2. ✅ Rate limiting (10 requests/minute per IP)
3. ✅ Registration requirement

**Response codes:**
- `403`: Bot detected via User-Agent
- `429`: Rate limit exceeded
- `401`: User not registered
- `200`: Success (with hint text)

## Implementation Details

### Rate Limiting Utility

```javascript
const { checkRateLimit, getClientIP } = require('./_rateLimit.cjs');

const clientIP = getClientIP(event);
const rateLimit = checkRateLimit(clientIP, maxRequests, windowMs);

if (!rateLimit.allowed) {
  // Return 429 Too Many Requests
}
```

### Registration Check

```javascript
const { isUserRegistered } = require('./_utils.cjs');
const registered = await isUserRegistered(supabase, userId);

if (!registered) {
  // Return 401 Unauthorized
}
```

### Bot Detection

```javascript
const { shouldBlockByUserAgent } = require('./_rateLimit.cjs');

if (shouldBlockByUserAgent(event)) {
  // Return 403 Forbidden
}
```

## Extending Protection to Other Endpoints

To protect additional endpoints, add these checks at the start of the handler:

```javascript
const { checkRateLimit, getClientIP, shouldBlockByUserAgent } = require('./_rateLimit.cjs');
const { getUserIdFromEvent, isUserRegistered } = require('./_utils.cjs');
const { createSupabaseClient } = require('./_supabase.cjs');

exports.handler = async (event) => {
  // 1. Bot detection
  if (shouldBlockByUserAgent(event)) {
    return { statusCode: 403, /* ... */ };
  }

  // 2. Rate limiting (adjust limits as needed)
  const clientIP = getClientIP(event);
  const rateLimit = checkRateLimit(clientIP, 20, 60000); // 20/min
  if (!rateLimit.allowed) {
    return { statusCode: 429, /* ... */ };
  }

  // 3. Registration (for expensive operations only)
  const userId = getUserIdFromEvent(event);
  const supabase = createSupabaseClient();
  if (supabase && await isUserRegistered(supabase, userId)) {
    return { statusCode: 401, /* ... */ };
  }

  // ... rest of handler
};
```

## Configuration

### Rate Limit Adjustments

Edit `netlify/functions/_rateLimit.cjs`:
- Default limits in `checkRateLimit()` calls
- Bot pattern list in `isBotUserAgent()`

### robots.txt Customization

Edit `robots.txt`:
- Uncomment lines to allow specific search engines
- Add custom rules for specific paths

### Registration Check

Edit `netlify/functions/_utils.cjs` → `isUserRegistered()`:
- Adjust minimum display_name length
- Change validation logic

## Monitoring

Check Netlify Function logs for:
- `[hint] Blocked bot request` - Bot detections
- `[hint] Rate limit exceeded` - Rate limit hits
- `[hint] Unregistered user attempt` - Registration requirement hits

## Limitations

1. **In-memory rate limiting:** Only works within a single Lambda instance. Multiple instances = separate rate limits.
2. **User-Agent spoofing:** Bots can fake User-Agents to bypass detection (but rate limiting still applies).
3. **IP rotation:** Bots using multiple IPs can bypass rate limits.

For production at scale, consider:
- Redis-based distributed rate limiting
- Cloudflare or similar CDN protection
- CAPTCHA for sensitive operations
- API key authentication

## Testing

### Test Bot Detection

```bash
curl -X POST https://your-site.netlify.app/.netlify/functions/hint \
  -H "User-Agent: Python-requests/2.28.0" \
  -H "Content-Type: application/json" \
  -d '{"topic":"test","question":"test"}'
# Expected: 403 Forbidden
```

### Test Rate Limiting

```bash
# Send 11 requests quickly
for i in {1..11}; do
  curl -X POST https://your-site.netlify.app/.netlify/functions/hint \
    -H "Content-Type: application/json" \
    -d '{"topic":"test","question":"test"}'
done
# Expected: First 10 succeed (or fail on registration), 11th returns 429
```

### Test Registration Requirement

```bash
curl -X POST https://your-site.netlify.app/.netlify/functions/hint \
  -H "Content-Type: application/json" \
  -d '{"topic":"test","question":"test"}'
# Expected: 401 USER_NOT_REGISTERED (if not registered)
```

## Files Modified/Created

- ✅ `robots.txt` - Bot crawler blocking
- ✅ `netlify/functions/_rateLimit.cjs` - Rate limiting & bot detection utility
- ✅ `netlify/functions/_utils.cjs` - Added `isUserRegistered()` helper
- ✅ `netlify/functions/hint.cjs` - Applied all protection layers
- ✅ `netlify.toml` - Added robots.txt redirect rule

## Next Steps (Optional Enhancements)

1. **Redis-based rate limiting** for distributed protection
2. **CAPTCHA** for high-risk operations
3. **API keys** for programmatic access
4. **IP allowlisting** for trusted sources
5. **Analytics** to track blocked requests

