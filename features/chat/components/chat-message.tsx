import type { UIMessage } from "ai";

import { cn } from "@/lib/utils";

type ChatMessageProps = {
  message: UIMessage;
};

export function ChatMessage({ message }: ChatMessageProps) {
  const text = message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("");

  if (!text) {
    return null;
  }

  const isUser = message.role === "user";

  return (
    <article
      aria-label={isUser ? "Your message" : "Assistant message"}
      className={cn("flex", isUser ? "justify-end" : "justify-start")}
    >
      <div
        className={cn(
          "max-w-[85%] rounded-xl px-4 py-3 text-sm leading-6 shadow-sm sm:max-w-[75%]",
          isUser
            ? "bg-primary text-primary-foreground"
            : "border bg-card text-card-foreground"
        )}
      >
        <p className="whitespace-pre-wrap">{text}</p>
      </div>
    </article>
  );
}
