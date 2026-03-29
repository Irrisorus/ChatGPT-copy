"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { ExternalLink, FileText, Loader2 } from "lucide-react";
import TypingMessage from "./TypingMessage";
import MarkdownMessage from "./MessageMarkdown";
import { Message } from "@/types";

interface ChatMessageProps {
  msg: Message;
  isLast: boolean;
  isSending: boolean;
}

export default function ChatMessage({ msg, isLast, isSending }: ChatMessageProps) {
  const isAssistant = msg.role === "assistant";
  const hasAttachments = msg.message_attachments && msg.message_attachments.length > 0;

  const isWaiting = isAssistant && isLast && isSending && !msg.content;
  const isTyping = isAssistant && isLast && isSending && msg.content;

  const renderAttachments = () => (
    <div className={cn(
        "flex flex-wrap gap-2 mb-1",
        msg.role === "user" ? "justify-end" : "justify-start"
    )}>
      {msg.message_attachments.map((file) => {
        const isImage = file.file_type.startsWith("image/");

        if (isImage) {
          return (
            <a
              key={file.id}
              href={file.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="relative group overflow-hidden rounded-xl border border-white/20 bg-black/5"
            >
              <img
                src={file.file_url}
                alt={file.file_name}
                className="max-h-60 max-w-full object-cover transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <ExternalLink className="size-5 text-white" />
              </div>
            </a>
          );
        }

        return (
          <a
            key={file.id}
            href={file.file_url}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "flex items-center gap-2 p-2.5 rounded-xl border transition-colors",
              msg.role === "user"
                ? "bg-white/10 border-white/20 hover:bg-white/20 text-white"
                : "bg-background border-border hover:bg-muted"
            )}
          >
            <FileText className="size-4 shrink-0" />
            <span className="truncate max-w-[150px] text-xs font-medium">
              {file.file_name}
            </span>
          </a>
        );
      })}
    </div>
  );

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


      <div className={cn(
          "flex flex-col gap-2 w-full",
          msg.role === "user" ? "items-end" : "items-start" 
      )}>
        {hasAttachments && renderAttachments()}

        <div
          className={cn(
            "px-5 py-3.5 text-sm shadow-sm max-w-full min-w-0 flex flex-col gap-3",
            msg.role === "user"
              ? "bg-primary text-primary-foreground rounded-3xl rounded-br-lg"
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
            msg.content && (
              <div className="whitespace-pre-wrap break-word leading-relaxed">
                {msg.content}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
