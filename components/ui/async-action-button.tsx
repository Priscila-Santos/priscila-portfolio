"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Loader2, Check, RotateCcw } from "lucide-react";

import { cn } from "@/lib/utils";

export type LifecycleState = "idle" | "loading" | "success" | "error";

type AsyncActionButtonProps = {
  /** Performs the action. Reject/throw to trigger the error state. */
  onAction: () => Promise<void>;
  icon: ReactNode;
  idleLabel: string;
  loadingLabel: string;
  successLabel: string;
  errorLabel?: string;
  disabled?: boolean;
  /** How long the success/error state holds before returning to idle. */
  holdMs?: number;
  className?: string;
};

/**
 * A single button that narrates its own lifecycle instead of snapping
 * between states: idle -> hover/focus -> loading -> success/error -> idle.
 *
 * This is the shared motion "system" — SendButton and DeployButton on the
 * demo page are both thin presets of this component, proving the transition
 * language (durations, easings, layout strategy) is one decision applied
 * twice, not two separate implementations that happen to look similar.
 *
 * Layout-thrash avoidance: the button's width never changes. Content is
 * cross-faded with transform + opacity inside an absolutely-stacked grid
 * cell, so the browser only ever animates compositor-friendly properties.
 */
export function AsyncActionButton({
  onAction,
  icon,
  idleLabel,
  loadingLabel,
  successLabel,
  errorLabel = "Retry",
  disabled = false,
  holdMs = 1400,
  className,
}: AsyncActionButtonProps) {
  const [state, setState] = useState<LifecycleState>("idle");
  const [shakeKey, setShakeKey] = useState(0);
  const resetTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Guards against a stale async response clobbering a state the user has
  // since moved past (e.g. retried while the first request was still in flight).
  const requestIdRef = useRef(0);

  useEffect(() => {
    return () => {
      if (resetTimeoutRef.current) clearTimeout(resetTimeoutRef.current);
    };
  }, []);

  const handleClick = useCallback(async () => {
    if (disabled || state === "loading") return;

    if (resetTimeoutRef.current) {
      clearTimeout(resetTimeoutRef.current);
      resetTimeoutRef.current = null;
    }

    const requestId = ++requestIdRef.current;
    setState("loading");

    try {
      await onAction();
      if (requestIdRef.current !== requestId) return;
      setState("success");
    } catch {
      if (requestIdRef.current !== requestId) return;
      setState("error");
      // Re-triggers the shake keyframe even if the previous one hasn't
      // finished, by changing the React key that the animation class hangs off.
      setShakeKey((key) => key + 1);
    }

    resetTimeoutRef.current = setTimeout(() => setState("idle"), holdMs);
  }, [disabled, holdMs, onAction, state]);

  const label =
    state === "loading" ? loadingLabel
    : state === "success" ? successLabel
    : state === "error" ? errorLabel
    : idleLabel;

  const stateIcon =
    state === "success" ? (
      <Check aria-hidden="true" className="size-4 motion-safe:animate-pop" />
    ) : state === "error" ? (
      <RotateCcw aria-hidden="true" className="size-4" />
    ) : (
      icon
    );

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled || state === "loading"}
      aria-live="polite"
      data-state={state}
      key={state === "error" ? `error-${shakeKey}` : state}
      className={cn(
        "relative h-10 w-48 select-none overflow-hidden rounded-lg border border-transparent bg-primary text-sm font-medium text-primary-foreground",
        "transition-[transform,box-shadow,background-color] duration-150 ease-out motion-reduce:transition-none",
        "hover:-translate-y-0.5 hover:shadow-md",
        "focus-visible:outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
        "active:translate-y-0 active:scale-[0.98] active:duration-100 active:ease-in",
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none disabled:hover:translate-y-0",
        state === "success" && "bg-emerald-600 hover:bg-emerald-600",
        state === "error" &&
          "bg-destructive hover:bg-destructive motion-safe:animate-shake",
        className
      )}
    >
      {/* Idle / success / error content. Absolutely positioned so swapping
          layers never changes the button's box size (no layout thrash). */}
      <span
        className={cn(
          "absolute inset-0 flex items-center justify-center gap-2 px-4 transition-[opacity,transform] duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none",
          state === "loading" ? "-translate-x-1.5 opacity-0" : "translate-x-0 opacity-100"
        )}
      >
        {stateIcon}
        <span className="truncate">{label}</span>
      </span>

      {/* Loading content, cross-faded in the same footprint. */}
      <span
        aria-hidden="true"
        className={cn(
          "absolute inset-0 flex items-center justify-center gap-2 px-4 transition-[opacity,transform] duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none",
          state === "loading" ? "translate-x-0 opacity-100" : "translate-x-1.5 opacity-0"
        )}
      >
        <Loader2 className="size-4 motion-safe:animate-[spin_0.7s_linear_infinite] motion-reduce:animate-none" />
        <span className="truncate">{loadingLabel}</span>
      </span>
    </button>
  );
}