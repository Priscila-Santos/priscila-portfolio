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
    <section className="px-page-x py-section">
      <div className="mx-auto max-w-4xl space-y-6">
        <header className="space-y-2">
          <p className="text-sm font-medium text-accent">Portfolio assistant</p>
          <h1 className="text-h1 font-title text-primary">Ask about my work</h1>
          <p className="max-w-2xl text-muted-foreground">
            Ask about my projects, front-end engineering approach, or how I use
            AI responsibly.
          </p>
        </header>

        <ChatInterface />
      </div>
    </section>
  );
}
