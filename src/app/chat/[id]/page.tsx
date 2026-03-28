"use client";

import { useEffect, useRef } from "react";
import { useParams } from "next/navigation";

import { Loader2 } from "lucide-react";
import { useMessages } from "@/hooks/use-messages";
import { ChatInput } from "@/components/Chat/ChatInput";
import ChatMessage from "@/components/Chat/ChatMessage";

export default function ChatPage() {
  const params = useParams();
  const chatId = params.id as string;
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, isLoading, sendMessage, isSending } = useMessages(chatId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
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
            <p className="text-center text-muted-foreground py-20 font-medium">
              Начните диалог с Gemini...
            </p>
          )}

          {messages.map((msg, index) => (
            <ChatMessage
              key={msg.id}
              msg={msg}
              isLast={index === messages.length - 1}
              isSending={isSending}
            />
          ))}

          <div ref={messagesEndRef} className="h-2 shrink-0" />
        </div>
      </div>

      <div className="shrink-0 bg-background">
        <div className="max-w-3xl mx-auto w-full">
          <ChatInput 
            onSend={(content: string) => sendMessage({ chatId, content })} 
            disabled={isSending} 
          />
        </div>
      </div>
    </div>
  );
}
