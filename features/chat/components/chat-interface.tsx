"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, UIMessageStreamError } from "ai";
import { MessageCircleMore, RefreshCw, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ChatMessage } from "@/features/chat/components/chat-message";
import { MAX_MESSAGE_CHARS } from "@/lib/ai/limits";
import type { PortfolioAgentMessage } from "@/lib/ai/portfolio-agent-tools";
import { cn } from "@/lib/utils";

export function ChatInterface() {
  const [input, setInput] = useState("");
  const trimmedLength = input.trim().length;
  const isTooLong = trimmedLength > MAX_MESSAGE_CHARS;
  // Tracks whether streamed content should continue following the newest message.
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  // The scrollable conversation and its bottom marker let the component measure
  // scroll position and smoothly follow new streamed content.
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // useMemo creates the transport once, preventing a new API client on every render.
  const transport = useMemo(
    () => new DefaultChatTransport({ api: "/api/portfolio-agent" }),
    []
  );

  // useChat owns message history and updates it as the API stream delivers chunks.
  const { messages, sendMessage, status, stop, error, clearError } = useChat<PortfolioAgentMessage>({ transport });
  const isGenerating = status === "submitted" || status === "streaming";
  const latestMessage = messages.at(-1);
  const hasAssistantText =
    latestMessage?.role === "assistant" &&
    latestMessage.parts.some(
      (part) => part.type === "text" && part.text.trim().length > 0
    );

  // Keep the assistant-shaped skeleton visible until Claude's first text token
  // reaches the UI. This avoids a generic loading indicator and prevents flashes.
  const showThinkingIndicator = isGenerating && !hasAssistantText;
  const failedUserMessage = [...messages].reverse().find((message) => message.role === "user");
  const errorDescription = UIMessageStreamError.isInstance(error)
    ? "The response was interrupted before it finished. Your earlier messages are still here."
    : "We couldn’t send that message. Your conversation is still here.";

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
    if (!text || isGenerating || isTooLong) {
      return;
    }

    if (process.env.NODE_ENV !== "production" && text.toLowerCase() === "trigger route error") {
      window.location.assign("/ai?test=route-error");
      return;
    }

    clearError();
    // Clear immediately for responsive feedback; useChat stores the submitted message.
    setInput("");
    await sendMessage({ text });
  }

  function handleExamplePrompt(prompt: string) {
    clearError();
    setInput(prompt);
    inputRef.current?.focus();
  }

  async function handleRetry() {
    if (!failedUserMessage || isGenerating) {
      return;
    }

    const text = failedUserMessage.parts
      .filter((part): part is Extract<typeof part, { type: "text" }> => part.type === "text")
      .map((part) => part.text)
      .join("\n")
      .trim();

    if (!text) {
      return;
    }

    // `messageId` is the AI SDK's replace-and-resend path. It removes any
    // partial assistant response, retains the earlier conversation, and sends
    // this user turn once instead of adding a duplicate message.
    clearError();
    await sendMessage({ text, messageId: failedUserMessage.id });
  }

  return (
    <div className="flex min-h-[22rem] max-h-[44rem] flex-1 flex-col overflow-hidden rounded-xl border bg-card shadow-sm">
      <div className="relative min-h-0 flex-1">
        <div
          ref={scrollContainerRef}
          aria-atomic="false"
          aria-busy={isGenerating}
          aria-live="polite"
          aria-relevant="additions text"
          aria-label="Conversation"
          onScroll={handleConversationScroll}
          role="log"
          className="h-full space-y-4 overflow-x-hidden overflow-y-auto overscroll-contain p-4 pb-6 sm:p-6"
        >
          {messages.length === 0 ? (
            <div className="flex min-h-full flex-col items-center justify-center px-2 py-8 text-center">
              <div className="mb-4 grid size-12 place-items-center rounded-full bg-[var(--color-blue-soft)] text-accent">
                <MessageCircleMore aria-hidden="true" className="size-6" />
              </div>
              <h2 className="text-base font-semibold text-card-foreground">No conversation yet</h2>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                Start with one of these questions, or write your own below.
              </p>
              <div className="mt-5 flex w-full max-w-lg flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-center">
                {[
                  "What technologies do you use?",
                  "Tell me about a recent project.",
                  "How do you approach front-end engineering?",
                ].map((prompt) => (
                  <Button
                    key={prompt}
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-auto whitespace-normal px-3 py-2 text-left sm:text-center"
                    onClick={() => handleExamplePrompt(prompt)}
                  >
                    {prompt}
                  </Button>
                ))}
              </div>
            </div>
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
            <div className="max-w-[75%] rounded-xl border bg-card p-4 shadow-sm" role={showThinkingIndicator ? "status" : undefined}>
              <span className="sr-only">Assistant is preparing a response</span>
              <div className="h-3 w-40 animate-pulse rounded bg-muted" />
              <div className="mt-3 h-3 w-full animate-pulse rounded bg-muted [animation-delay:150ms]" />
              <div className="mt-2 h-3 w-3/4 animate-pulse rounded bg-muted [animation-delay:300ms]" />
            </div>
          </div>

          {error && (
            <section className="rounded-xl border border-destructive/30 bg-destructive/10 p-4" role="alert">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-destructive">Response interrupted</p>
                  <p className="mt-1 text-sm text-muted-foreground">{errorDescription}</p>
                </div>
                <Button type="button" variant="destructive" size="sm" onClick={handleRetry} disabled={!failedUserMessage || isGenerating}>
                  <RefreshCw aria-hidden="true" />
                  Retry
                </Button>
              </div>
            </section>
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

      <form className="shrink-0 border-t bg-card p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:p-6" onSubmit={handleSubmit}>
        <label className="sr-only" htmlFor="chat-message">
          Ask a question
        </label>
        <textarea
          id="chat-message"
          ref={inputRef}
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Ask about my work or engineering approach…"
          rows={3}
          disabled={isGenerating}
          className="max-h-32 w-full resize-none rounded-lg border bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        />

        <div className="mt-3 flex items-center justify-between gap-3">
          <p
            aria-live="polite"
            className={cn(
              "text-xs",
              isTooLong ? "font-medium text-destructive" : "text-muted-foreground"
            )}
          >
            {isTooLong
              ?
              `Message is ${(trimmedLength - MAX_MESSAGE_CHARS).toLocaleString()} characters over the ${MAX_MESSAGE_CHARS.toLocaleString()} limit. Please shorten it.`
              : "Responses are generated by AI and may be incomplete."}
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
            <Button type="submit" disabled={!input.trim() || isTooLong}>
              <Send aria-hidden="true" />
              Send
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}