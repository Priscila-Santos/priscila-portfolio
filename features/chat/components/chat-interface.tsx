"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";

import { Button } from "@/components/ui/button";
import { ChatMessage } from "@/features/chat/components/chat-message";
import type { PortfolioChatMessage } from "@/lib/ai/tools";
import { cn } from "@/lib/utils";

export function ChatInterface() {
  // useState keeps the controlled textarea value in the browser between renders.
  const [input, setInput] = useState("");
  // Tracks whether streamed content should continue following the newest message.
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  // The scrollable conversation and its bottom marker let the component measure
  // scroll position and smoothly follow new streamed content.
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // useMemo creates the transport once, preventing a new API client on every render.
  const transport = useMemo(
    () => new DefaultChatTransport({ api: "/api/chat" }),
    []
  );

  // useChat owns message history and updates it as the API stream delivers chunks.
  const { messages, sendMessage, status, stop, error } = useChat<PortfolioChatMessage>({ transport });
  const isGenerating = status === "submitted" || status === "streaming";
  const latestMessage = messages.at(-1);
  const hasAssistantText =
    latestMessage?.role === "assistant" &&
    latestMessage.parts.some(
      (part) => part.type === "text" && part.text.trim().length > 0
    );

  // Keep the indicator visible from submission until Claude's first text token
  // reaches the UI. This prevents a status change from causing a visual flash.
  const showThinkingIndicator = isGenerating && !hasAssistantText;

  // New messages and streamed text update `messages`. Follow them only while
  // the visitor is near the bottom, so reading an earlier answer is never interrupted.
  useEffect(() => {
    if (!shouldAutoScroll) {
      return;
    }

    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, shouldAutoScroll, showThinkingIndicator]);

  function handleConversationScroll() {
    const container = scrollContainerRef.current;

    if (!container) {
      return;
    }

    // A small tolerance treats a visitor as "at the bottom" without requiring
    // pixel-perfect positioning, including while the stream changes height.
    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;
    setShouldAutoScroll(distanceFromBottom <= 80);
  }

  function handleJumpToLatest() {
    setShouldAutoScroll(true);
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const text = input.trim();
    if (!text || isGenerating) {
      return;
    }

    // Clear immediately for responsive feedback; useChat stores the submitted message.
    setInput("");
    await sendMessage({ text });
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
      <div className="relative">
        <div
          ref={scrollContainerRef}
          aria-atomic="false"
          aria-busy={isGenerating}
          aria-live="polite"
          aria-relevant="additions text"
          aria-label="Conversation"
          onScroll={handleConversationScroll}
          role="log"
          className="min-h-80 max-h-[min(60vh,36rem)] space-y-4 overflow-y-auto overscroll-contain p-4 sm:p-6"
        >
          {messages.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Try asking: “What technologies do you use?”
            </p>
          ) : (
            messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))
          )}

          <div
            aria-hidden={!showThinkingIndicator}
            className={cn(
              "overflow-hidden transition-[max-height,opacity,transform] duration-200 ease-out",
              showThinkingIndicator
                ? "max-h-10 translate-y-0 opacity-100"
                : "max-h-0 -translate-y-1 opacity-0"
            )}
          >
            <p
              className="flex items-center gap-2 text-sm text-muted-foreground"
              role={showThinkingIndicator ? "status" : undefined}
            >
              <span className="inline-flex gap-1" aria-hidden="true">
                <span className="size-1.5 animate-pulse rounded-full bg-current" />
                <span className="size-1.5 animate-pulse rounded-full bg-current [animation-delay:150ms]" />
                <span className="size-1.5 animate-pulse rounded-full bg-current [animation-delay:300ms]" />
              </span>
              Thinking…
            </p>
          </div>

          {error && (
            <p className="text-sm text-destructive" role="alert">
              Something went wrong. Please try again.
            </p>
          )}

          <div ref={bottomRef} />
        </div>

        {!shouldAutoScroll && messages.length > 0 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="absolute bottom-3 right-3 shadow-md"
            onClick={handleJumpToLatest}
          >
            Jump to latest
          </Button>
        )}
      </div>

      <form className="border-t p-4 sm:p-6" onSubmit={handleSubmit}>
        <label className="sr-only" htmlFor="chat-message">
          Ask a question
        </label>
        <textarea
          id="chat-message"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Ask about my work or engineering approach…"
          rows={3}
          disabled={isGenerating}
          className="w-full resize-y rounded-lg border bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        />

        <div className="mt-3 flex items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            Responses are generated by AI and may be incomplete.
          </p>
          {isGenerating ? (
            <Button
              type="button"
              variant="outline"
              aria-label="Stop generating response"
              onClick={stop}
            >
              Stop
            </Button>
          ) : (
            <Button type="submit" disabled={!input.trim()}>
              Send
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
