import type { Metadata } from "next";

import { ChatInterface } from "@/features/chat/components/chat-interface";

export const metadata: Metadata = {
  title: "AI Assistant | Portfolio",
  description: "Ask Priscila's portfolio assistant about her work and approach.",
};

type AiPageProps = {
  searchParams?: { test?: string };
};

export default function AiPage({ searchParams }: AiPageProps) {
  if (process.env.NODE_ENV !== "production" && searchParams?.test === "route-error") {
    throw new Error("Development-only route error.");
  }
  
  return (
    <section className="flex min-h-[calc(100dvh-5rem)] flex-col px-page-x py-4 sm:py-6">
      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-4 sm:gap-6">
        <header className="shrink-0 space-y-1">
          <p className="text-sm font-medium text-accent">Portfolio assistant</p>
          <h1 className="text-h1 font-title text-primary">Ask about my work</h1>
          <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
            Ask about my projects, front-end engineering approach, or how I use
            AI responsibly.
          </p>
        </header>

        <ChatInterface />
      </div>
    </section>
  );
}