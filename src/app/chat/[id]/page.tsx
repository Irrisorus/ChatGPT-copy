"use client";

import { useParams } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ChatInput } from "@/components/ChatInput"; 
import { cn } from "@/lib/utils";

const mockMessages = [
  { id: "1", role: "user", content: "Привет! Расскажи, как отцентрировать div?" },
  { 
    id: "2", 
    role: "assistant", 
    content: "Привет! Тебе нужно задать контейнеру `display: flex`, а затем `justify-content: center` и `align-items: center`." 
  },
  { id: "3", role: "user", content: "Спасибо!" },
];

export default function ChatPage() {
  const params = useParams();

  return (
    <div className="flex flex-col h-full w-full bg-background font-sans antialiased">

      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-6 max-w-3xl mx-auto px-4 py-8 md:px-6 md:py-10 pb-6">
          {mockMessages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "flex gap-4 w-full group",
                msg.role === "user" ? "justify-end pl-10 md:pl-20" : "justify-start pr-10 md:pr-20"
              )}
            >

              {msg.role === "assistant" && (
                <Avatar className="w-9 h-9 shrink-0 border bg-muted shadow-inner">
                  <AvatarFallback className="text-xs font-mono font-bold text-muted-foreground">
                    GE
                  </AvatarFallback>
                </Avatar>
              )}

              <div
                className={cn(
                  "px-5 py-3.5 text-sm leading-relaxed shadow-sm transition-colors",
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-3xl rounded-br-lg"
                    : "bg-muted/30 text-foreground rounded-3xl rounded-bl-lg border" 
                )}
              >
                {msg.content}
              </div>
            </div>
          ))}
          
          <div className="h-4 shrink-0" />
        </div>
      </ScrollArea>

      <ChatInput />
    </div>
  );
}
