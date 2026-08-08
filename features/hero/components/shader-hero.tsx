"use client";

import dynamic from "next/dynamic";
import { useEffect, useState, type ReactNode } from "react";

import { usePrefersReducedMotion } from "@/features/three/lib/use-prefers-reduced-motion";
import { useLowPowerContext } from "@/features/three/lib/use-low-power-context";

const AuroraCanvas = dynamic(
  () => import("@/features/hero/components/aurora-canvas").then((mod) => mod.AuroraCanvas),
  {
    ssr: false,
    // Show the exact same static gradient while the chunk is still
    // downloading, instead of Next's default (nothing/null) — otherwise
    // there'd be a flash of blank space between "gradient" and "shader".
    loading: () => <StaticGradient />,
  }
);

function StaticGradient() {
  return (
    <div className="h-full w-full bg-[#0b0f19] bg-[radial-gradient(circle_at_28%_25%,#f43f5e_0%,transparent_45%),radial-gradient(circle_at_72%_70%,#38bdf8_0%,transparent_50%)]" />
  );
}

function hasWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      window.WebGLRenderingContext &&
        (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
    );
  } catch {
    return false;
  }
}

type ShaderHeroProps = {
  children: ReactNode;
};

/**
 * Fullscreen aurora shader hero for the homepage.
 *
 * The static gradient is always what paints first, on every device —
 * that part was already correct. What was missing: the WebGL probe and
 * the shader bundle import used to run inside a plain `useEffect` on
 * mount, which fires *during* hydration and competes directly for main-
 * thread time with the headline text painting (the page's actual LCP
 * element). A Lighthouse run on the deployed hero showed exactly that:
 * 5.7s of Total Blocking Time and a 540ms render delay on the headline,
 * caused by the shader's render loop starting immediately instead of
 * after the page was already interactive — the identical regression
 * documented (and fixed) for /lab/3d in week-seven/AUDIT.md.
 *
 * Two changes fix it here:
 *   1. The upgrade decision (WebGL probe + importing the shader chunk)
 *      is pushed to `requestIdleCallback`, so it only happens once the
 *      browser has spare main-thread time — after first paint, not
 *      competing with it.
 *   2. `useLowPowerContext` (already used by the 3D Lab) now also gates
 *      the hero, so a visitor on a slow connection or low-memory device
 *      never auto-upgrades to the WebGL canvas at all.
 */
export function ShaderHero({ children }: ShaderHeroProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const lowPower = useLowPowerContext();
  const [readyToUpgrade, setReadyToUpgrade] = useState(false);
  const [webglSupported, setWebglSupported] = useState<boolean | null>(null);

  useEffect(() => {
    let idleId: number | undefined;
    let timeoutId: number | undefined;

    function markReady() {
      setReadyToUpgrade(true);
    }

    // Read these off `window` into plain variables first. Checking
    // `"requestIdleCallback" in window` directly confuses TypeScript's
    // control-flow narrowing — lib.dom declares the property as always
    // present on `Window`, so TS treats the `else` branch as
    // unreachable and narrows `window` to `never` there (even though
    // Safari genuinely lacks it at runtime). Using `typeof` on a
    // standalone variable sidesteps that narrowing entirely.
    const requestIdle = window.requestIdleCallback;
    const cancelIdle = window.cancelIdleCallback;

    // requestIdleCallback isn't in Safari; setTimeout is the documented
    // fallback (a short delay is close enough to "when the browser is
    // idle" for this purpose, and still avoids blocking hydration).
    if (typeof requestIdle === "function") {
      idleId = requestIdle(markReady, { timeout: 2000 });
    } else {
      timeoutId = window.setTimeout(markReady, 200);
    }

    return () => {
      if (idleId !== undefined && typeof cancelIdle === "function") {
        cancelIdle(idleId);
      }
      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId);
      }
    };
  }, []);

  // Only probe for WebGL (and therefore only import the shader chunk)
  // once the browser told us it has idle time — this is what actually
  // delays the ~600KB download/execution past first paint.
  useEffect(() => {
    if (!readyToUpgrade) return;
    setWebglSupported(hasWebGL());
  }, [readyToUpgrade]);

  const showShader =
    readyToUpgrade && webglSupported === true && !prefersReducedMotion && !lowPower;

  return (
    <div className="relative isolate flex min-h-[70vh] items-center overflow-hidden">
      <div aria-hidden="true" className="absolute inset-0 -z-20">
        {showShader ? <AuroraCanvas /> : <StaticGradient />}
      </div>

      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-r from-black/65 via-black/25 to-transparent"
      />

      {children}
    </div>
  );
}