import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import {
  PortfolioToolInvocation,
  ToolInvocation,
} from "@/features/chat/components/tool-invocation";
import type { PortfolioAgentMessage } from "@/lib/ai/portfolio-agent-tools";
import { cn } from "@/lib/utils";

type ChatMessageProps = {
  message: PortfolioAgentMessage;
};

function isGroundingToolInProgress(part: PortfolioAgentMessage["parts"][number]) {
  return (
    (part.type === "tool-listProjects" ||
      part.type === "tool-readProject" ||
      part.type === "tool-checkGrounding") &&
    (part.state === "input-streaming" || part.state === "input-available")
  );
}

export function ChatMessage({ message }: ChatMessageProps) {
  const hasVisibleContent = message.parts.some(
    (part) => part.type === "text" ||
      part.type === "tool-scoreLead" ||
      isGroundingToolInProgress(part)
  );

  if (!hasVisibleContent) {
    return null;
  }

  const isUser = message.role === "user";

  return (
    <article
      aria-label={isUser ? "Your message" : "Assistant message"}
      className={cn("flex", isUser ? "justify-end" : "justify-start")}
    >
      <div className="max-w-[85%] sm:max-w-[75%]">
        {message.parts.map((part, index) => {
          if (part.type === "text") {
            return (
              <div
                key={`${message.id}-text-${index}`}
                className={cn(
                  "rounded-xl px-4 py-3 text-sm leading-6 shadow-sm",
                  isUser
                    ? "bg-primary text-primary-foreground"
                    : "border bg-card text-card-foreground"
                )}
              >
                {isUser ? (
                  <p className="whitespace-pre-wrap">{part.text}</p>
                ) : (
                  <div className="prose prose-sm max-w-none prose-p:my-2 prose-p:text-card-foreground prose-ul:my-2 prose-li:text-card-foreground prose-ol:my-2 prose-strong:text-card-foreground prose-headings:text-card-foreground dark:prose-invert">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {part.text}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            );
          }

          if (part.type === "tool-scoreLead") {
            return (
              <ToolInvocation
                key={part.toolCallId}
                state={part.state}
                input={part.input}
                output={part.output}
              />
            );
          }

          if (part.type === "tool-listProjects") {
            return (
              <PortfolioToolInvocation
                key={part.toolCallId}
                toolName="listProjects"
                state={part.state}
                input={part.input}
              />
            );
          }

          if (part.type === "tool-readProject") {
            return (
              <PortfolioToolInvocation
                key={part.toolCallId}
                toolName="readProject"
                state={part.state}
                input={part.input}
              />
            );
          }

          if (part.type === "tool-checkGrounding") {
            return (
              <PortfolioToolInvocation
                key={part.toolCallId}
                toolName="checkGrounding"
                state={part.state}
                input={part.input}
              />
            );
          }

          return null;
        })}
      </div>
    </article>
  );
}
