"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import TypingMessage from "./TypingMessage";
import MarkdownMessage from "./MessageMarkdown";

interface Message {
  id: string;
  role: "user" | "assistant" | string;
  content: string;
}

interface ChatMessageProps {
  msg: Message;
  isLast: boolean;
  isSending: boolean;
}

export default function ChatMessage({ msg, isLast, isSending }: ChatMessageProps) {
  const isAssistant = msg.role === "assistant";
  
  // Состояния для сообщения ИИ
  const isWaiting = isAssistant && isLast && isSending && !msg.content;
  const isTyping = isAssistant && isLast && isSending && msg.content;

  return (
    <div
      className={cn(
        "flex gap-3 w-full",
        "flex-col md:flex-row",
        msg.role === "user"
          ? "items-end justify-end pl-10 md:pl-20"
          : "items-start justify-start"
      )}
    >
      {isAssistant && (
        <Avatar className="w-9 h-9 border bg-muted shrink-0">
          <AvatarFallback className="text-xs font-mono font-bold">GE</AvatarFallback>
        </Avatar>
      )}

      <div
        className={cn(
          "px-5 py-3.5 text-sm shadow-sm max-w-full min-w-0 ",
          msg.role === "user"
            ? "bg-primary text-primary-foreground rounded-3xl rounded-br-lg whitespace-pre-wrap"
            : "bg-muted/30 text-foreground rounded-3xl rounded-bl-lg border"
        )}
      >
        {isAssistant ? (
          <div className="w-full min-w-0 break-word overflow-hidden">
            {isWaiting ? (
              <div className="flex items-center text-muted-foreground/80 italic py-1">
                <Loader2 className="size-3.5 animate-spin mr-2.5" />
                <span>Gemini думает...</span>
              </div>
            ) : isTyping ? (
              <TypingMessage content={msg.content} />
            ) : (
              <MarkdownMessage content={msg.content} />
            )}
          </div>
        ) : (
          <div className="whitespace-pre-wrap break-word">{msg.content}</div>
        )}
      </div>
    </div>
  );
}
