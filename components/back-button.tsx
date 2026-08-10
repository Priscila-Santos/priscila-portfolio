// components/back-button.tsx
"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export function BackButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.back()}
      className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-accent sm:hidden"
    >
      <ArrowLeft aria-hidden="true" className="size-4" />
      Back
    </button>
  );
}