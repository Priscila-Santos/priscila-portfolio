import {
  convertToModelMessages,
  stepCountIs,
  streamText,
  type UIMessage,
} from "ai";

import { portfolioChatModel as model } from "@/lib/ai/portfolio-chat";
import {
  portfolioAgentSystemPrompt,
  portfolioAgentTools,
} from "@/lib/ai/portfolio-agent";
import { checkRateLimit, getClientIdentifier } from "@/lib/rate-limit";

/**
 * Caps how long this route may run before the platform kills it. The agent
 * loop is already bounded to 5 steps (`stopWhen: stepCountIs(5)`), but a
 * slow tool call or a slow model response could otherwise hang far longer
 * than a chat UI should ever make a visitor wait. Adjust if your hosting
 * plan's function timeout differs.
 */
export const maxDuration = 30;

// Input caps: a visitor should never be able to send a message list large
// enough, or a single message long enough, to run up real API cost. These
// numbers are generous for genuine conversation and tight for a script.
const MAX_MESSAGES = 40;
const MAX_MESSAGE_CHARS = 4000;

function isRequestTooLarge(messages: UIMessage[]): boolean {
  if (messages.length > MAX_MESSAGES) {
    return true;
  }

  return messages.some((message) =>
    message.parts.some(
      (part) => part.type === "text" && part.text.length > MAX_MESSAGE_CHARS
    )
  );
}

export async function POST(request: Request) {
  const identifier = getClientIdentifier(request);
  const rateLimit = checkRateLimit(identifier);

  if (!rateLimit.allowed) {
    return new Response(
      JSON.stringify({
        error:
          "Too many requests. Please wait a moment before sending another message.",
      }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": String(rateLimit.retryAfterSeconds),
        },
      }
    );
  }

  const { messages }: { messages: UIMessage[] } = await request.json();

  if (isRequestTooLarge(messages)) {
    return new Response(
      JSON.stringify({
        error:
          "This conversation or message is too long for this demo assistant.",
      }),
      { status: 413, headers: { "Content-Type": "application/json" } }
    );
  }

  const result = streamText({
    model,
    system: portfolioAgentSystemPrompt,
    messages: await convertToModelMessages(messages),
    tools: portfolioAgentTools,
    stopWhen: stepCountIs(5),
  });

  return result.toUIMessageStreamResponse();
}