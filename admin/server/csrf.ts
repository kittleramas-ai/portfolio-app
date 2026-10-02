/**
 * Minimal CSRF protection for state-changing routes.
 *
 * The session cookie is SameSite=Lax, which already blocks cross-site POSTs
 * from a browser form. This adds defence in depth for the upload route:
 * an attacker-controlled page cannot make the browser send a multipart
 * upload with the admin cookie attached, but a same-site XSS or a misconfigured
 * proxy could, and an explicit Origin check fails loudly rather than silently.
 *
 * Origin is checked instead of a double-submit token: there is exactly one
 * state-changing non-cookie route (the upload), and a token would add a second
 * thing to get wrong without covering the login route (which is pre-auth and
 * cannot be CSRF'd into anything useful).
 */

export function isSafeSameOrigin(request: Request): boolean {
  const origin = request.headers.get('origin')
  // Same-origin fetches from some browsers omit Origin on GET; for POST it is
  // always present. If absent, fall back to comparing against the URL's origin.
  if (!origin) {
    const url = new URL(request.url)
    const referer = request.headers.get('referer')
    if (!referer) return true
    return new URL(referer).origin === url.origin
  }
  return origin === new URL(request.url).origin
}