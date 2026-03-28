"use client";

import { useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ChatInput } from "@/components/ChatInput";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { useMessages } from "@/hooks/use-messages";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function ChatPage() {
  const params = useParams();
  const chatId = params.id as string;
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, isLoading, sendMessage, isSending } = useMessages(chatId);

  // ------------------------REFACTOR----------------
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isSending]);

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-background font-sans antialiased">
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-6 max-w-3xl mx-auto px-4 py-8 md:px-6 md:py-10">

          {isLoading && (
            <div className="flex justify-center py-10">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          )}

          {!isLoading && messages.length === 0 && (
            <p className="text-center text-muted-foreground py-20">История сообщений пуста.</p>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "flex gap-3 w-full",
                "flex-col md:flex-row",
                msg.role === "user"
                  ? "items-end justify-end pl-10 md:pl-20" 
                  : "items-start justify-start" 
              )}
            >
              {msg.role === "assistant" && (
                <Avatar className="w-9 h-9 border bg-muted shrink-0">
                  <AvatarFallback className="text-xs font-mono font-bold">GE</AvatarFallback>
                </Avatar>
              )}

              <div className={cn(
                "px-5 py-3.5 text-sm shadow-sm max-w-full min-w-0 ",
                msg.role === "user"
                  ? "bg-primary text-primary-foreground rounded-3xl rounded-br-lg whitespace-pre-wrap"
                  : "bg-muted/30 text-foreground rounded-3xl rounded-bl-lg border"
              )}>

                {msg.role === "assistant" ? (
                  <div className="wrap-break-word overflow-hidden w-full">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
                        ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>,
                        ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>,
                        li: ({ children }) => <li>{children}</li>,
                        strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                        pre: ({ children }) => (
                          <pre className="overflow-x-auto max-w-full scrollbar-thin">
                            {children}
                          </pre>
                        ),
                        code(props) {
                          const { children, className, node, ...rest } = props;

                          const match = /language-(\w+)/.exec(className || '');
                          const isInline = !match && !String(children).includes('\n');

                          return isInline ? (
                            <code className="bg-foreground/10 px-1.5 py-0.5 rounded-md text-xs font-mono" {...rest}>
                              {children}
                            </code>
                          ) : (
                            <div className="relative my-3 rounded-lg overflow-hidden border bg-zinc-950 dark:bg-zinc-900 shadow-sm">
                              <div className="flex items-center px-4 py-1.5 bg-zinc-900 dark:bg-zinc-950 border-b border-zinc-800 text-[10px] text-zinc-400 font-mono uppercase tracking-wider">
                                {match ? match[1] : 'Code'}
                              </div>
                              <pre className="p-4 overflow-x-auto text-[13px] text-zinc-50 font-mono leading-relaxed">
                                <code className={className} {...rest}>
                                  {children}
                                </code>
                              </pre>
                            </div>
                          );
                        }
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  msg.content
                )}

              </div>
            </div>
          ))}

          {isSending && (
            <div className="flex gap-4 justify-start pr-10">
              <Avatar className="w-9 h-9 border bg-muted shrink-0">
                <AvatarFallback className="text-xs font-mono font-bold">GE</AvatarFallback>
              </Avatar>
              <div className="bg-muted/30 px-5 py-3.5 rounded-3xl rounded-bl-lg border italic text-muted-foreground text-sm flex items-center">
                <Loader2 className="size-3.5 animate-spin mr-2" />
                Gemini думает...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} className="h-2 shrink-0" />
        </div>
      </div>

      <div className="shrink-0 bg-background">
        <ChatInput onSend={(content: string) => sendMessage({ chatId, content })} disabled={isSending} />
      </div>
    </div>
  );
}
