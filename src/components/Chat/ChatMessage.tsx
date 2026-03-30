"use client";

import React from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { ExternalLink, FileText, Loader2 } from "lucide-react";
import TypingMessage from "./TypingMessage";
import MarkdownMessage from "./MessageMarkdown";
import { Message } from "@/types";
import MessageAttachments from "./MessageAttachments";

interface ChatMessageProps {
  msg: Message;
  isLast: boolean;
  isSending: boolean;
}

function ChatMessage({ msg, isLast, isSending }: ChatMessageProps) {
  const isAssistant = msg.role === "assistant";
  const attachments = msg.message_attachments ?? [];
  const hasContent = msg.content && msg.content.trim().length > 0;
  
  const isWaiting = isAssistant && isLast && isSending && !hasContent;
  
  const isTyping = isAssistant && isLast && isSending && hasContent;
  return (
    <div
      className={cn(
        "flex gap-3 w-full mb-4",
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
          "flex flex-col gap-2 w-full min-w-0",
          "will-change-[height] overflow-anchor-none",
          msg.role === "user" ? "items-end" : "items-start"
        )}
      >
        {attachments.length > 0 && (
          <MessageAttachments
            attachments={attachments}
            role={msg.role}
          />
        )}

        <div
          className={cn(
            "px-5 py-3.5 text-sm shadow-sm max-w-full min-w-0",
            msg.role === "user"
              ? "bg-primary text-primary-foreground rounded-3xl rounded-br-lg"
              : "bg-muted/30 text-foreground rounded-3xl rounded-bl-lg border"
          )}
        >
          {isAssistant ? (
            <div className="w-full min-w-0 break-words [overflow-wrap:anywhere] overflow-hidden">
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
          ) : msg.content ? (
            <div className="whitespace-pre-wrap break-words [overflow-wrap:anywhere] leading-relaxed">
              {msg.content}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default React.memo(ChatMessage, (prev, next) => {
  return (
    prev.msg.id === next.msg.id &&
    prev.msg.content === next.msg.content &&
    prev.msg.role === next.msg.role &&
    prev.isLast === next.isLast &&
    prev.isSending === next.isSending &&
    prev.msg.message_attachments === next.msg.message_attachments
  );
});
