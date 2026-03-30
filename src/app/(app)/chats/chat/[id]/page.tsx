"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { Virtuoso, type VirtuosoHandle } from "react-virtuoso";
import { Loader2 } from "lucide-react";
import { useMessages } from "@/hooks/use-messages";
import ChatMessage from "@/components/Chat/ChatMessage";

export default function ChatPage() {
  const params = useParams();
  const chatId = params.id as string;

  const {
    messages,
    isLoading,
    isSending,
    loadMore,
    hasMore,
    isLoadingMore,
  } = useMessages(chatId);

  const virtuosoRef = useRef<VirtuosoHandle>(null);
  const loadingMoreRef = useRef(false);
  const [firstItemIndex, setFirstItemIndex] = useState(0);
  const [isAtBottom, setIsAtBottom] = useState(true);

  const initialIndex = Math.max(0, messages.length - 1);

  useEffect(() => {
    if (messages.length > 0 && isAtBottom) {
      virtuosoRef.current?.autoscrollToBottom();
    }
      console.log(messages);
  }, [messages.length, isAtBottom]);

  if (isLoading && messages.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-background font-sans antialiased">
      <div className="flex-1 min-h-0">
        <Virtuoso
          ref={virtuosoRef}
          style={{ height: "100%" }}
          data={messages}
          computeItemKey={(index, message) => message.id}
          firstItemIndex={10000000}
          initialTopMostItemIndex={initialIndex}
          atBottomStateChange={setIsAtBottom} 
          followOutput={(isAtBottom) => (isAtBottom ? "auto" : false)}
          increaseViewportBy={{ top: 500, bottom: 500 }}
          defaultItemHeight={80}
          startReached={async () => {
            if (!hasMore || isLoading || isLoadingMore || loadingMoreRef.current) return;

            loadingMoreRef.current = true;
            try {
              const added = await loadMore?.();
              if (added && added > 0) {
                setFirstItemIndex((prev) => prev - added);
              }
            } finally {
              loadingMoreRef.current = false;
            }
          }}
          components={{
            Header: () =>
              isLoadingMore ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="size-6 animate-spin text-muted-foreground" />
                </div>
              ) : null,
            Footer: () => <div className="h-4" />,
            EmptyPlaceholder: () => (
              <p className="text-center text-muted-foreground py-20 font-medium">
                Начните диалог с Gemini...
              </p>
            ),
          }}
          itemContent={(index, msg) => (
            <div className="max-w-3xl mx-auto px-4 md:px-6 py-3 w-full">
              <ChatMessage
                msg={msg}
                isLast={index === messages.length - 1}
                isSending={isSending}
              />
            </div>
          )}
        />
      </div>
    </div>
  );
}
