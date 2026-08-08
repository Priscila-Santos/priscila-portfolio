"use client";

import dynamic from "next/dynamic";
import { useEffect, useState, type ReactNode } from "react";

import { usePrefersReducedMotion } from "@/features/three/lib/use-prefers-reduced-motion";

// ssr:false + dynamic import: the three.js/fiber/shader bundle (~600KB,
// same figure as the 3D Lab, since it's the same library) only downloads
// when the visitor is actually going to see it render.
const AuroraCanvas = dynamic(
  () => import("@/features/hero/components/aurora-canvas").then((mod) => mod.AuroraCanvas),
  { ssr: false }
);

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
 * Renders the animated WebGL shader only when both of these hold:
 *   - the visitor's OS hasn't requested reduced motion, and
 *   - the browser actually supports WebGL.
 * Otherwise it renders a static CSS gradient using the exact same
 * rose/blue palette as the shader — same visual identity, zero motion,
 * zero WebGL bundle. `webglSupported` starts as `null` (checked only in
 * useEffect, browser-only) so server and first client render agree: no
 * hydration mismatch, and the static gradient is what everyone sees for
 * one frame before the upgrade happens.
 */
export function ShaderHero({ children }: ShaderHeroProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [webglSupported, setWebglSupported] = useState<boolean | null>(null);

  useEffect(() => {
    setWebglSupported(hasWebGL());
  }, []);

  const showShader = webglSupported === true && !prefersReducedMotion;

  return (
    <div className="relative isolate flex min-h-[70vh] items-center overflow-hidden">
      {/* Background layer: either the live shader canvas, or the static
          fallback gradient. aria-hidden because it's purely decorative —
          the headline below carries the actual content. */}
      <div aria-hidden="true" className="absolute inset-0 -z-20">
        {showShader ? (
          <AuroraCanvas />
        ) : (
          <div className="h-full w-full bg-[#0b0f19] bg-[radial-gradient(circle_at_28%_25%,#f43f5e_0%,transparent_45%),radial-gradient(circle_at_72%_70%,#38bdf8_0%,transparent_50%)]" />
        )}
      </div>

      {/* Contrast scrim: a left-to-right dark gradient sitting between the
          background (shader or fallback, both colorful and animated/
          textured) and the text. This — not the shader's own vignette —
          is what actually guarantees the headline stays readable no
          matter what the noise field is doing underneath it. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-r from-black/65 via-black/25 to-transparent"
      />

      {children}
    </div>
  );
}