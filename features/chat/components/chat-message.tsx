import { ToolInvocation } from "@/features/chat/components/tool-invocation";
import type { PortfolioChatMessage } from "@/lib/ai/tools";
import { cn } from "@/lib/utils";

type ChatMessageProps = {
  message: PortfolioChatMessage;
};

export function ChatMessage({ message }: ChatMessageProps) {
  const hasVisibleContent = message.parts.some(
    (part) => part.type === "text" || part.type === "tool-scoreLead"
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
                <p className="whitespace-pre-wrap">{part.text}</p>
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
                errorText={part.errorText}
              />
            );
          }

          return null;
        })}
      </div>
    </article>
  );
}
