/**
 * Dynamically loads GSAP + plugins. Called only on desktop inside `useEffect`
 * via `loadGsap()`, so mobile clients never download or parse the GSAP bundle.
 *
 * NOTE: named `gsapLoader` (not `gsap.client`) on purpose — TanStack Start
 * denies `*.client.*` imports from SSR/server bundles, and these components
 * are rendered on the server. The dynamic `import('gsap')` calls below only
 * ever run in the browser inside effects, so this module is SSR-safe.
 */
import type gsap from 'gsap'
import type { ScrollTrigger } from 'gsap/ScrollTrigger'
import type { ScrollSmoother } from 'gsap/ScrollSmoother'
import type { ScrollToPlugin } from 'gsap/ScrollToPlugin'
import type { SplitText } from 'gsap/SplitText'
import type { DrawSVGPlugin } from 'gsap/DrawSVGPlugin'

export type GsapApi = {
  gsap: typeof gsap
  ScrollTrigger: typeof ScrollTrigger
  ScrollSmoother: typeof ScrollSmoother
  ScrollToPlugin: typeof ScrollToPlugin
  SplitText: typeof SplitText
  DrawSVGPlugin: typeof DrawSVGPlugin
}

let pending: Promise<GsapApi> | null = null

/** Loads + registers GSAP plugins once. Safe to call repeatedly (cached). */
export function loadGsap(): Promise<GsapApi> {
  if (pending) return pending
  pending = (async () => {
    const [
      { default: gsapMod },
      { ScrollTrigger: ST },
      { ScrollSmoother: SS },
      { ScrollToPlugin: STP },
      { SplitText: SPT },
      { DrawSVGPlugin: DSV },
    ] = await Promise.all([
      import('gsap'),
      import('gsap/ScrollTrigger'),
      import('gsap/ScrollSmoother'),
      import('gsap/ScrollToPlugin'),
      import('gsap/SplitText'),
      import('gsap/DrawSVGPlugin'),
    ])
    gsapMod.registerPlugin(ST, SS, STP, SPT, DSV)
    return {
      gsap: gsapMod,
      ScrollTrigger: ST,
      ScrollSmoother: SS,
      ScrollToPlugin: STP,
      SplitText: SPT,
      DrawSVGPlugin: DSV,
    }
  })()
  return pending
}
