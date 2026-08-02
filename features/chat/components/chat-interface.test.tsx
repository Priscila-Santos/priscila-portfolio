import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// The real hook would try to open a network connection to /api/chat, so it is
// mocked here. Each test sets `mockUseChatReturn` to the exact shape useChat
// would report for that lifecycle state (pending/streaming/error/ready).
const sendMessage = vi.fn();
const stop = vi.fn();
const clearError = vi.fn();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let mockUseChatReturn: any;

vi.mock("@ai-sdk/react", () => ({
  useChat: () => mockUseChatReturn,
}));

vi.mock("ai", () => ({
  DefaultChatTransport: vi.fn(),
  UIMessageStreamError: { isInstance: () => false },
}));

const { ChatInterface } = await import("@/features/chat/components/chat-interface");

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function baseState(overrides: Record<string, any> = {}) {
  return {
    messages: [],
    sendMessage,
    status: "ready",
    stop,
    error: undefined,
    clearError,
    ...overrides,
  };
}

describe("ChatInterface", () => {
  beforeEach(() => {
    sendMessage.mockClear();
    stop.mockClear();
    clearError.mockClear();
  });

  it("shows the thinking indicator while a response is pending", () => {
    mockUseChatReturn = baseState({
      status: "submitted",
      messages: [{ id: "u1", role: "user", parts: [{ type: "text", text: "Hi" }] }],
    });

    render(<ChatInterface />);

    expect(
      screen.getByRole("status", { name: /preparing a response/i })
    ).toBeInTheDocument();
  });

  it("hides the thinking indicator once assistant text is streaming in", () => {
    mockUseChatReturn = baseState({
      status: "streaming",
      messages: [
        { id: "u1", role: "user", parts: [{ type: "text", text: "Hi" }] },
        { id: "a1", role: "assistant", parts: [{ type: "text", text: "Partial answer" }] },
      ],
    });

    render(<ChatInterface />);

    expect(screen.getByText("Partial answer")).toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("shows a retry option when a request is interrupted", async () => {
    mockUseChatReturn = baseState({
      status: "ready",
      error: new Error("network"),
      messages: [{ id: "u1", role: "user", parts: [{ type: "text", text: "Hi" }] }],
    });

    render(<ChatInterface />);

    expect(screen.getByRole("alert")).toHaveTextContent(/response interrupted/i);

    const retryButton = screen.getByRole("button", { name: /retry/i });
    expect(retryButton).toBeEnabled();

    await userEvent.click(retryButton);

    expect(sendMessage).toHaveBeenCalledWith(
      expect.objectContaining({ text: "Hi", messageId: "u1" })
    );
  });

  it("disables Send until the visitor types a non-empty message", async () => {
    mockUseChatReturn = baseState();

    render(<ChatInterface />);

    const sendButton = screen.getByRole("button", { name: /send/i });
    expect(sendButton).toBeDisabled();

    const textbox = screen.getByRole("textbox", { name: /ask a question/i });
    await userEvent.type(textbox, "What technologies do you use?");

    expect(sendButton).toBeEnabled();
  });

  it("does not enable Send for a whitespace-only message", async () => {
    mockUseChatReturn = baseState();

    render(<ChatInterface />);

    const textbox = screen.getByRole("textbox", { name: /ask a question/i });
    await userEvent.type(textbox, "   ");

    expect(screen.getByRole("button", { name: /send/i })).toBeDisabled();
    expect(sendMessage).not.toHaveBeenCalled();
  });
});