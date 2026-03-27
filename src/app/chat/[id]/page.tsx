"use client";

import { useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ChatInput } from "@/components/ChatInput"; 
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { useMessages } from "@/hooks/use-messages"; 

export default function ChatPage() {
  const params = useParams();
  const chatId = params.id as string;
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, isLoading, sendMessage, isSending } = useMessages(chatId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-full w-full bg-background font-sans antialiased">
      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-6 max-w-3xl mx-auto px-4 py-8 md:px-6 md:py-10 pb-6">
          
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
                "flex gap-4 w-full",
                msg.role === "user" ? "justify-end pl-10 md:pl-20" : "justify-start pr-10 md:pr-20"
              )}
            >
              {msg.role === "assistant" && (
                <Avatar className="w-9 h-9 border bg-muted">
                  <AvatarFallback className="text-xs font-mono font-bold">GE</AvatarFallback>
                </Avatar>
              )}

              <div className={cn(
                "px-5 py-3.5 text-sm shadow-sm whitespace-pre-wrap",
                msg.role === "user"
                  ? "bg-primary text-primary-foreground rounded-3xl rounded-br-lg"
                  : "bg-muted/30 text-foreground rounded-3xl rounded-bl-lg border" 
              )}>
                {msg.content}
              </div>
            </div>
          ))}
          
          {isSending && (
            <div className="flex gap-4 justify-start pr-10">
               <Avatar className="w-9 h-9 border bg-muted">
                  <AvatarFallback className="text-xs font-mono font-bold">GE</AvatarFallback>
                </Avatar>
                <div className="bg-muted/30 px-5 py-3.5 rounded-3xl rounded-bl-lg border italic text-muted-foreground text-sm">
                  Gemini думает...
                </div>
            </div>
          )}

          <div ref={messagesEndRef} className="h-4" />
        </div>
      </ScrollArea>

      <ChatInput onSend={(content:string) => sendMessage({ chatId, content })} disabled={isSending} />{/*  */}
    </div>
  );
}
