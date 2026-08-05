import {
  convertToModelMessages,
  stepCountIs,
  streamText,
  type UIMessage,
} from "ai";

import { portfolioChatModel as model } from "@/lib/ai/portfolio-chat";import {
  portfolioAgentSystemPrompt,
  portfolioAgentTools,
} from "@/lib/ai/portfolio-agent";

export async function POST(request: Request) {
  const { messages }: { messages: UIMessage[] } = await request.json();

  const result = streamText({
    model,
    system: portfolioAgentSystemPrompt,
    messages: await convertToModelMessages(messages),
    tools: portfolioAgentTools,
    stopWhen: stepCountIs(5),
  });

  return result.toUIMessageStreamResponse();
}
