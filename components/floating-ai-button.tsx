// components/floating-ai-button.tsx
"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Persistent shortcut to /ai from anywhere on the site. Hidden on the /ai
 * page itself (no point floating over the thing it links to) so it never
 * competes with the chat interface.
 */
export function FloatingAiButton() {
  const pathname = usePathname();

  if (pathname === "/ai") {
    return null;
  }

  return (
    <Link
      href="/ai"
      aria-label="Ask my AI assistant"
      className={cn(
        "fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-medium text-primary-foreground shadow-card",
        "transition-transform hover:-translate-y-0.5 hover:bg-primary/90",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      )}
    >
      <Sparkles aria-hidden="true" className="size-4" />
      <span className="hidden sm:inline">Ask my AI</span>
    </Link>
  );
}