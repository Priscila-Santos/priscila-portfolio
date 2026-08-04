"use client";

import { useEffect, useState } from "react";

type NavigatorWithHints = Navigator & {
  connection?: { saveData?: boolean; effectiveType?: string };
  deviceMemory?: number;
};

/**
 * Best-effort signal that the visitor is on a constrained device or an
 * explicit data-saver connection. None of these APIs are universally
 * supported, so this is a hint used to pre-select the "static preview"
 * choice for the visitor, not a hard gate. Whatever it decides, the
 * person can still tap "Enable 3D view" to opt in.
 */
export function useLowPowerContext(): boolean {
  const [lowPower, setLowPower] = useState(false);

  useEffect(() => {
    const nav = navigator as NavigatorWithHints;
    const saveData = Boolean(nav.connection?.saveData);
    const slowConnection = nav.connection?.effectiveType
      ? ["slow-2g", "2g", "3g"].includes(nav.connection.effectiveType)
      : false;
    const lowMemory = typeof nav.deviceMemory === "number" && nav.deviceMemory <= 2;

    setLowPower(saveData || slowConnection || lowMemory);
  }, []);

  return lowPower;
}