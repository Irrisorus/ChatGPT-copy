"use client";

import { useEffect, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useMessages } from "@/hooks/use-messages";
import ChatMessage from "@/components/Chat/ChatMessage";
import ScrollToBottom from "@/components/ScrollToBottom";

export default function ChatPage() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const observerTarget = useRef<HTMLDivElement>(null);

  const params = useParams();
  const chatId = params.id as string;

  const { messages, isLoading, sendMessage, isSending, loadMore, hasMore } = useMessages(chatId);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  }, [messages.length]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          loadMore?.();
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasMore, isLoading, loadMore]);

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-background font-sans antialiased">
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto custom-scrollbar flex flex-col-reverse">
        <div className="flex flex-col-reverse gap-6 max-w-3xl mx-auto px-4 py-8 md:px-6 md:py-10 w-full">
          {[...messages].map((msg, index) => (
            <ChatMessage
              key={msg.id}
              msg={msg}
              isLast={index === 0}
              isSending={isSending}
            />
          ))}
          {hasMore && (
            <div ref={observerTarget} className="flex justify-center py-4 w-full">
              <Loader2 className="size-5 animate-spin text-muted-foreground/50" />
            </div>
          )}

          {!isLoading && messages.length === 0 && (
            <p className="text-center text-muted-foreground py-20 font-medium w-full">
              Начните диалог с Gemini...
            </p>
          )}
        </div>
      </div>


      <div className="shrink-0">
        <ScrollToBottom containerRef={scrollContainerRef} />
      </div>
    </div>
  );
}
