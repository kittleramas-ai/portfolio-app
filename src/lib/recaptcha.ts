/**
 * Lazy, on-demand Google reCAPTCHA v3 loader.
 *
 * CRITICAL FOR LIGHTHOUSE:
 * Standard Google reCAPTCHA scripts take 200ms+ of main thread evaluation time
 * and cost 200+ kB of network data if loaded in <head>.
 * This loader ensures the Google script is ONLY fetched when a real user
 * focuses an input or opens the chatbot modal.
 * Lighthouse (which does not focus forms on page load) will NEVER trigger this,
 * keeping the Lighthouse performance score at 95-100.
 */

declare global {
  interface Window {
    grecaptcha?: {
      ready: (callback: () => void) => void
      execute: (siteKey: string, options: { action: string }) => Promise<string>
    }
  }
}

let scriptLoadingPromise: Promise<void> | null = null

export function getRecaptchaSiteKey(): string {
  return (
    (typeof import.meta !== 'undefined' &&
      import.meta.env &&
      import.meta.env.VITE_RECAPTCHA_SITE_KEY) ||
    '6LfVw-wtAAAAAGIr2DwOcxQRw42t7_lvRav1_xdX'
  )
}

/**
 * Loads the reCAPTCHA v3 script dynamically on first user interaction.
 */
export function preloadRecaptcha(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve()

  const siteKey = getRecaptchaSiteKey()
  if (!siteKey) return Promise.resolve()

  if (window.grecaptcha && typeof window.grecaptcha.execute === 'function') {
    return Promise.resolve()
  }

  if (!scriptLoadingPromise) {
    scriptLoadingPromise = new Promise<void>((resolve) => {
      const existingScript = document.querySelector(
        'script[src*="recaptcha/api.js"]',
      ) as HTMLScriptElement | null

      if (existingScript) {
        if (window.grecaptcha) {
          resolve()
          return
        }
        existingScript.addEventListener('load', () => resolve(), { once: true })
        return
      }

      const script = document.createElement('script')
      script.src = `https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(
        siteKey,
      )}`
      script.async = true
      script.defer = true
      script.onload = () => resolve()
      script.onerror = (e) => {
        console.warn('[reCAPTCHA] Failed to load Google script:', e)
        resolve()
      }
      document.head.appendChild(script)
    })
  }

  return scriptLoadingPromise
}

/**
 * Executes reCAPTCHA v3 and returns a verification token.
 * Returns null if reCAPTCHA is unavailable, fails, or keys are missing/invalid.
 */
export async function getRecaptchaToken(action: string): Promise<string | null> {
  const siteKey = getRecaptchaSiteKey()
  if (!siteKey || typeof window === 'undefined') return null

  try {
    await preloadRecaptcha()

    if (!window.grecaptcha || typeof window.grecaptcha.ready !== 'function') {
      return null
    }

    return await new Promise<string | null>((resolve) => {
      // Set safety timeout in case Google API hangs or errors on localhost
      const timeout = window.setTimeout(() => {
        resolve(null)
      }, 3500)

      window.grecaptcha?.ready(async () => {
        try {
          const token = await window.grecaptcha?.execute(siteKey, { action })
          window.clearTimeout(timeout)
          resolve(token ?? null)
        } catch (err) {
          window.clearTimeout(timeout)
          console.warn('[reCAPTCHA] execution warning (Google domain verification pending):', err)
          resolve(null)
        }
      })
    })
  } catch {
    return null
  }
}
