"use client";

import { Bot, User } from "lucide-react";

export type AiChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
};

type AiMessageBubbleProps = {
  message: AiChatMessage;
};

function renderContent(content: string): React.ReactNode {
  const parts = content.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={index} className="font-semibold text-inherit">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part.split("\n").map((line, lineIndex, arr) => (
      <span key={`${index}-${lineIndex}`}>
        {line}
        {lineIndex < arr.length - 1 && <br />}
      </span>
    ));
  });
}

export function AiMessageBubble({ message }: AiMessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
          isUser
            ? "bg-zinc-900 text-white"
            : "bg-violet-100 text-violet-700 ring-1 ring-inset ring-violet-600/10"
        }`}
      >
        {isUser ? (
          <User className="h-4 w-4" strokeWidth={1.75} aria-hidden />
        ) : (
          <Bot className="h-4 w-4" strokeWidth={1.75} aria-hidden />
        )}
      </div>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? "bg-zinc-900 text-white"
            : "border border-zinc-200/80 bg-white text-zinc-700 shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
        }`}
      >
        {renderContent(message.content)}
      </div>
    </div>
  );
}
