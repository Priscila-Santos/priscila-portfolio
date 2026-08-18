"use client";

import dynamic from "next/dynamic";
import { useEffect, useState, type ReactNode } from "react";

import { usePrefersReducedMotion } from "@/features/three/lib/use-prefers-reduced-motion";
import { useLowPowerContext } from "@/features/three/lib/use-low-power-context";

const AuroraCanvas = dynamic(
  () => import("@/features/hero/components/aurora-canvas").then((mod) => mod.AuroraCanvas),
  {
    ssr: false,
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

export function ShaderHero({ children }: ShaderHeroProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const lowPower = useLowPowerContext();
  const [readyToUpgrade, setReadyToUpgrade] = useState(false);
  const [webglSupported, setWebglSupported] = useState<boolean | null>(null);

  // 🔄 Novo useEffect atualizado
  useEffect(() => {
    let idleId: number | undefined;
    let timeoutId: number | undefined;
    let cancelIdle: ((id: number) => void) | undefined;

    function markReady() {
      setReadyToUpgrade(true);
    }

    function scheduleUpgrade() {
      const requestIdle = window.requestIdleCallback;
      cancelIdle = window.cancelIdleCallback;

      if (typeof requestIdle === "function") {
        idleId = requestIdle(markReady);
      } else {
        timeoutId = window.setTimeout(markReady, 200);
      }
    }

    if (document.readyState === "complete") {
      scheduleUpgrade();
    } else {
      window.addEventListener("load", scheduleUpgrade, { once: true });
    }

    return () => {
      window.removeEventListener("load", scheduleUpgrade);
      if (idleId !== undefined && typeof cancelIdle === "function") cancelIdle(idleId);
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
    };
  }, []);

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
