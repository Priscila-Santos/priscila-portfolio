"use client";

import { Box } from "lucide-react";

type SceneFallbackProps = {
  reason: "reduced-motion" | "low-power" | "not-started" | "webgl-unsupported";
  onEnable?: () => void;
};

const copy: Record<SceneFallbackProps["reason"], { title: string; body: string }> = {
  "reduced-motion": {
    title: "3D view paused",
    body: "Your system asks for reduced motion, so the interactive scene stays off by default.",
  },
  "low-power": {
    title: "3D view paused",
    body: "This looks like a slower connection or device, so the interactive scene stays off by default.",
  },
  "not-started": {
    title: "3D model viewer",
    body: "Loads a real WebGL scene with orbit controls and a live material configurator.",
  },
  "webgl-unsupported": {
    title: "3D view unavailable",
    body: "This browser does not report WebGL support, so only the static preview is shown.",
  },
};

/**
 * A static, zero-motion stand-in for the canvas. Rendered instead of the
 * heavy Three.js bundle until the visitor explicitly opts in, so nobody
 * downloads ~600KB of 3D vendor code without asking for it.
 */
export function SceneFallback({ reason, onEnable }: SceneFallbackProps) {
  const { title, body } = copy[reason];
  const canEnable = reason !== "webgl-unsupported" && onEnable;

  return (
    <div className="flex h-full min-h-[24rem] flex-col items-center justify-center gap-4 rounded-xl border bg-[radial-gradient(circle_at_30%_20%,var(--color-blue-soft,theme(colors.muted.DEFAULT))_0%,transparent_60%)] bg-card p-8 text-center">
      <div className="grid size-14 place-items-center rounded-full bg-[var(--color-blue-soft)] text-accent">
        <Box aria-hidden="true" className="size-7" />
      </div>
      <div className="space-y-1">
        <h2 className="text-base font-semibold text-card-foreground">{title}</h2>
        <p className="max-w-sm text-sm text-muted-foreground">{body}</p>
      </div>
      {canEnable && (
        <button
          type="button"
          onClick={onEnable}
          className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Enable 3D view
        </button>
      )}
    </div>
  );
}