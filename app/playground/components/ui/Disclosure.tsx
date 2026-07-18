"use client";

import { ReactNode, useId, useState } from "react";

interface DisclosureProps {
  title: string;
  children: ReactNode;
}

export default function Disclosure({
  title,
  children,
}: DisclosureProps) {
  const [open, setOpen] = useState(false);

  // Every disclosure gets unique IDs
  const buttonId = useId();
  const panelId = useId();

  return (
    <div className="rounded border">
      <button
        id={buttonId}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        
        className="w-full bg-gray-100 px-4 py-2 text-left"
        onClick={() => setOpen((previous) => !previous)}
      >
        {title}
      </button>

      {open && (
        <div
          id={panelId}
          role="region"
          aria-labelledby={buttonId}
          className="px-4 py-2"
        >
          {children}
        </div>
      )}
    </div>
  );
}