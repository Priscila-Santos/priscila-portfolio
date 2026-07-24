"use client";

import { RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function AiError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <section className="px-page-x py-section">
      <div className="mx-auto max-w-3xl rounded-xl border border-destructive/30 bg-destructive/10 p-6">
        <p className="text-sm font-medium text-destructive">Portfolio assistant</p>
        <h1 className="mt-2 text-display text-primary">Something went wrong</h1>
        <p className="mt-3 max-w-xl text-muted-foreground">
          The assistant page could not be loaded. Please try again.
        </p>
        <Button className="mt-5" type="button" onClick={reset}>
          <RefreshCw aria-hidden="true" />
          Recover
        </Button>
      </div>
    </section>
  );
}
