import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { ChatMessage } from "@/features/chat/components/chat-message";
import type { PortfolioChatMessage } from "@/lib/ai/tools";

function userMessage(text: string): PortfolioChatMessage {
  return {
    id: "user-1",
    role: "user",
    parts: [{ type: "text", text }],
  } as PortfolioChatMessage;
}

function assistantTextMessage(text: string): PortfolioChatMessage {
  return {
    id: "assistant-1",
    role: "assistant",
    parts: [{ type: "text", text }],
  } as PortfolioChatMessage;
}

function assistantToolMessage(
  state: "output-available" | "output-error"
): PortfolioChatMessage {
  const basePart = {
    type: "tool-scoreLead" as const,
    toolCallId: "call-1",
    state,
    input: { company: "Acme", employees: 500 },
  };

  return {
    id: "assistant-2",
    role: "assistant",
    parts: [
      state === "output-available"
        ? {
            ...basePart,
            output: {
              company: "Acme",
              score: 92,
              priority: "High",
              recommendation: "Contact within 24 hours.",
            },
          }
        : { ...basePart, output: undefined },
    ],
  } as unknown as PortfolioChatMessage;
}

describe("ChatMessage", () => {
  it("renders a user message with the correct accessible label and text", () => {
    render(<ChatMessage message={userMessage("Hi there")} />);

    const article = screen.getByRole("article", { name: /your message/i });
    expect(article).toHaveTextContent("Hi there");
  });

  it("renders an assistant text message with its own accessible label", () => {
    render(<ChatMessage message={assistantTextMessage("Hello, how can I help?")} />);

    expect(
      screen.getByRole("article", { name: /assistant message/i })
    ).toHaveTextContent("Hello, how can I help?");
  });

  it("renders nothing when a message has no visible text or tool parts", () => {
    const emptyMessage = {
      id: "assistant-empty",
      role: "assistant",
      parts: [],
    } as unknown as PortfolioChatMessage;

    const { container } = render(<ChatMessage message={emptyMessage} />);

    expect(container).toBeEmptyDOMElement();
  });

  it("renders the scoreLead tool result as a lead score card", () => {
    render(<ChatMessage message={assistantToolMessage("output-available")} />);

    expect(screen.getByRole("heading", { name: "Acme" })).toBeInTheDocument();
    expect(screen.getByText(/high priority/i)).toBeInTheDocument();
    expect(screen.getByText(/contact within 24 hours/i)).toBeInTheDocument();
  });

  it("renders a tool error state without crashing the message", () => {
    render(<ChatMessage message={assistantToolMessage("output-error")} />);

    expect(screen.getByRole("alert")).toHaveTextContent(
      /lead scoring could not be completed/i
    );
  });
});