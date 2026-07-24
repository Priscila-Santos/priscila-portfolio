import {
  convertToModelMessages,
  stepCountIs,
  streamText,
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
