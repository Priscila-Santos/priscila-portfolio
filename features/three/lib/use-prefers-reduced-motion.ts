"use client";

import { useEffect, useState } from "react";

/**
 * Tracks the visitor's `prefers-reduced-motion` OS setting.
 *
 * The 3D viewer uses this to decide whether to render the interactive
 * WebGL canvas or a static fallback. Starting at `false` (rather than
 * `undefined`) avoids a layout flash before hydration on most devices;
 * the effect below corrects it immediately once the browser API is
 * available.
 */
export function usePrefersReducedMotion(): boolean {
  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReduced(query.matches);

    function handleChange(event: MediaQueryListEvent) {
      setPrefersReduced(event.matches);
    }

    query.addEventListener("change", handleChange);
    return () => query.removeEventListener("change", handleChange);
  }, []);

  return prefersReduced;
}