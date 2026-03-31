"use client";

import { useRef, useCallback, useState, useMemo, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Virtuoso, type VirtuosoHandle } from "react-virtuoso";
import { Loader2 } from "lucide-react";
import { useMessages } from "@/hooks/use-messages";
import ChatMessage from "@/components/Chat/ChatMessage";
import ScrollToBottom from "@/components/ScrollToBottom";

const START_INDEX = 10000;
const CHUNK_SIZE = 10;

export default function ChatPage() {
  const searchParams = useSearchParams();
  const params = useParams();
  const chatId = params.id as string;
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);

  const {
    messages,
    isLoading,
    isSending,
    loadMore,
    hasMore,
    isLoadingMore,
    sendMessage
  } = useMessages(chatId);

  const hasSentFirstMsg = useRef(false);

  useEffect(() => {
    const firstMsg = searchParams.get("firstMsg");
    
    if (firstMsg && !hasSentFirstMsg.current && !isLoading) {
      hasSentFirstMsg.current = true;

      sendMessage({
        chatId,
        content: decodeURIComponent(firstMsg),
      });

      const newPath = window.location.pathname;
      window.history.replaceState(null, "", newPath);
    }
  }, [searchParams, chatId, sendMessage, isLoading]);


  const virtuosoRef = useRef<VirtuosoHandle>(null);

  
  const virtuosoContext = useMemo(() => ({
    isSending,
    lastMessageId: messages[messages.length - 1]?.id
  }), [isSending, messages]);



  const messageChunks = useMemo(() => {
    const chunks = [];
    for (let i = 0; i < messages.length; i += CHUNK_SIZE) {
      chunks.push(messages.slice(i, i + CHUNK_SIZE));
    }
    return chunks;
  }, [messages]);

  const handleScrollToBottomClick = useCallback(() => {
    if (messageChunks.length > 0) {
      virtuosoRef.current?.scrollToIndex({
        index: messageChunks.length - 1,
        behavior: "smooth",
        align: "end"
      });
    }
  }, [messageChunks.length]);


  const firstItemIndex = Math.max(0, START_INDEX - messageChunks.length);


  const handleStartReached = useCallback(async () => {
    if (!hasMore || isLoadingMore || isLoading) return;
    await loadMore();
  }, [hasMore, isLoadingMore, isLoading, loadMore]);

  const [initialTopIndex] = useState(() => START_INDEX - 1);

  if (isLoading && messages.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col bg-background relative font-sans">
      <div className="flex-1 min-h-0">
        <Virtuoso
          ref={virtuosoRef}
          style={{ height: "100%", overflowAnchor: "none" }}
          data={messageChunks}
          computeItemKey={(_, chunk) => `chunk-${chunk[0]?.id}`}
          firstItemIndex={firstItemIndex}
          initialTopMostItemIndex={initialTopIndex}
          context={virtuosoContext}
          defaultItemHeight={2500}
          followOutput={(isAtBottom) => (isAtBottom ? "auto" : false)}
          startReached={handleStartReached}
          increaseViewportBy={{ top: 2000, bottom: 500 }}
          atBottomThreshold={200}
          atBottomStateChange={(atBottom) => {
            setShowScrollToBottom(!atBottom)
          }}

          components={{
            Header: () => (
              <div className="h-14 flex items-center justify-center">
                {isLoadingMore && <Loader2 className="size-5 animate-spin text-muted-foreground" />}
              </div>
            ),
            Footer: () => <div className="h-6" />,
            EmptyPlaceholder: () => (
              <p className="text-center text-muted-foreground py-20 font-medium">
                Начните диалог с Gemini...
              </p>
            ),
          }}

          itemContent={(index, chunk, context) => (
            <div className="flex flex-col w-full">
              {chunk.map((msg) => {
                const isLastInChat = msg.id === context.lastMessageId;
                const isMsgSending = isLastInChat ? context.isSending : false;

                return (
                  <div key={msg.id} className="max-w-3xl mx-auto px-4 md:px-6 py-3 w-full">
                    <ChatMessage
                      msg={msg}
                      isLast={isLastInChat}
                      isSending={isMsgSending}
                    />
                  </div>
                );
              })}
            </div>
          )}
        />
      </div>
      <ScrollToBottom
        isVisible={showScrollToBottom}
        onClick={handleScrollToBottomClick}
      />
    </div>

  );
}
