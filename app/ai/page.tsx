import type { Metadata } from "next";

import { ChatInterface } from "@/features/chat/components/chat-interface";

export const metadata: Metadata = {
  title: "AI Assistant | Portfolio",
  description: "Ask Priscila's portfolio assistant about her work and approach.",
};

export default function AiPage() {
  return (
    <section className="px-page-x py-section">
      <div className="mx-auto max-w-3xl space-y-6">
        <header className="space-y-2">
          <p className="text-sm font-medium text-accent">Portfolio assistant</p>
          <h1 className="text-display text-primary">Ask about my work</h1>
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
