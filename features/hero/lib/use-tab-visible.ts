"use client";

import { useEffect, useState } from "react";

/**
 * Tracks whether the current browser tab is visible.
 *
 * Used by AuroraCanvas to set R3F's `frameloop` to "never" while the tab
 * is hidden, so the shader stops rendering (and burning battery/GPU)
 * entirely instead of animating an invisible canvas in the background.
 * Starts `true` to match the common case and avoid a flash on mount.
 */
export function useTabVisible(): boolean {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    function handleVisibilityChange() {
      setVisible(!document.hidden);
    }

    handleVisibilityChange();
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  return visible;
}