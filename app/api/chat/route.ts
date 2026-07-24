import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  stepCountIs,
  streamText,
  type UIMessageChunk,
  validateUIMessages,
} from "ai";

import {
  portfolioChatModel,
  portfolioChatSystemPrompt,
} from "@/lib/ai/portfolio-chat";
import { portfolioTools, type PortfolioChatMessage } from "@/lib/ai/tools";

type ChatRequestBody = {
  messages: unknown;
};

/**
 * Narrows unknown JSON to the small request shape this endpoint accepts.
 * Runtime validation is needed because request bodies are not trustworthy just
 * because TypeScript types exist in the client application.
 */
function hasMessages(body: unknown): body is ChatRequestBody {
  return typeof body === "object" && body !== null && "messages" in body;
}

type DevelopmentTrigger =
  | "stream-error"
  | "rate-limit"
  | "timeout"
  | "malformed-tool";

function getLastUserText(messages: unknown): string {
  if (!Array.isArray(messages)) {
    return "";
  }

  const lastUserMessage = [...messages].reverse().find(
    (message): message is { role: string; parts: unknown } =>
      typeof message === "object" && message !== null && "role" in message && "parts" in message &&
      message.role === "user"
  );

  if (!lastUserMessage || !Array.isArray(lastUserMessage.parts)) {
    return "";
  }

  return lastUserMessage.parts
    .filter(
      (part): part is { type: string; text: string } =>
        typeof part === "object" && part !== null && "type" in part && "text" in part &&
        part.type === "text" && typeof part.text === "string"
    )
    .map((part) => part.text)
    .join("\n")
    .trim()
    .toLowerCase();
}

function getDevelopmentTrigger(request: Request, messages: unknown): DevelopmentTrigger | undefined {
  if (process.env.NODE_ENV === "production") {
    return undefined;
  }

  const queryTrigger = new URL(request.url).searchParams.get("test");
  const text = getLastUserText(messages);

  if (queryTrigger === "stream-error" || text === "trigger stream error") {
    return "stream-error";
  }

  if (queryTrigger === "rate-limit" || text === "trigger rate limit") {
    return "rate-limit";
  }

  if (queryTrigger === "timeout" || text === "trigger timeout") {
    return "timeout";
  }

  if (queryTrigger === "malformed-tool" || text === "trigger malformed tool response") {
    return "malformed-tool";
  }

  return undefined;
}

function createInterruptedStreamResponse() {
  let chunkIndex = 0;
  const stream = new ReadableStream<UIMessageChunk>({
    async pull(controller) {
      if (chunkIndex === 0) {
        chunkIndex += 1;
        controller.enqueue({ type: "start", messageId: "development-stream-error" });
        return;
      }

      if (chunkIndex === 1) {
        chunkIndex += 1;
        controller.enqueue({ type: "text-start", id: "development-text" });
        return;
      }

      if (chunkIndex === 2) {
        chunkIndex += 1;
        controller.enqueue({
          type: "text-delta",
          id: "development-text",
          delta: "This response started successfully, then the connection dropped…",
        });
        return;
      }

      // Give the partial text a chance to reach the browser before simulating
      // a dropped connection instead of emitting a normal stream error event.
      await new Promise((resolve) => setTimeout(resolve, 100));
      controller.error(new Error("Development-only interrupted stream."));
    },
  });

  return createUIMessageStreamResponse({ stream });
}

function createMalformedToolResponse() {
  const stream = new ReadableStream<UIMessageChunk>({
    start(controller) {
      controller.enqueue({ type: "start", messageId: "development-malformed-tool" });
      controller.enqueue({
        type: "tool-input-available",
        toolCallId: "development-malformed-tool-call",
        toolName: "scoreLead",
        input: { company: "Demo Company", employees: 100 },
      });
      controller.enqueue({
        type: "tool-output-available",
        toolCallId: "development-malformed-tool-call",
        output: { company: "Demo Company", unexpected: true },
      });
      controller.enqueue({ type: "finish" });
      controller.close();
    },
  });

  return createUIMessageStreamResponse({ stream });
}

export async function POST(request: Request) {
  let body: unknown;

  // Request is the Web API object for this HTTP call. Its JSON body contains
  // the message history sent by the future client-side chat interface.
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "The request body must be valid JSON." }, { status: 400 });
  }

  if (!hasMessages(body)) {
    return Response.json({ error: "A messages array is required." }, { status: 400 });
  }

  const developmentTrigger = getDevelopmentTrigger(request, body.messages);

  if (developmentTrigger === "rate-limit") {
    return Response.json(
      { error: "Development-only rate-limit response." },
      { status: 429, headers: { "Retry-After": "1" } }
    );
  }

  if (developmentTrigger === "timeout") {
    // This deliberate delay keeps the loading skeleton visible before returning
    // a gateway-timeout response, without involving the model provider.
    await new Promise((resolve) => setTimeout(resolve, 5_000));
    return Response.json(
      { error: "Development-only timeout response." },
      { status: 504 }
    );
  }

  if (developmentTrigger === "stream-error") {
    return createInterruptedStreamResponse();
  }

  if (developmentTrigger === "malformed-tool") {
    return createMalformedToolResponse();
  }

  // Tool schemas also validate any completed calls that return with the
  // conversation history, before those messages are sent back to the model.
  const messages = await validateUIMessages<PortfolioChatMessage>({
    messages: body.messages,
    tools: portfolioTools,
  });
  const modelMessages = await convertToModelMessages(messages, {
    tools: portfolioTools,
  });

  // streamText starts Anthropic's response and exposes a readable stream. The
  // AI SDK serializes stream chunks into its UI message protocol so useChat can
  // update the interface incrementally as text arrives.
  const result = streamText({
    model: portfolioChatModel,
    system: portfolioChatSystemPrompt,
    messages: modelMessages,
    tools: portfolioTools,
    // Allow Claude to receive the executed result and provide a short follow-up.
    stopWhen: stepCountIs(5),
  });

  // Return the streaming HTTP response to the browser. The provider and its
  // ANTHROPIC_API_KEY are used only on this server route and are never included
  // in the response body, client bundle, or browser network request.
  return result.toUIMessageStreamResponse();
}
