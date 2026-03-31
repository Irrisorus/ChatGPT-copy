"use client";

import { useRef, useCallback, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { Virtuoso, type VirtuosoHandle } from "react-virtuoso";
import { Loader2 } from "lucide-react";

import { useMessages } from "@/hooks/use-messages";
import { useInitialMessage } from "@/hooks/use-initial-message";
import { chunkArray } from "@/lib/utils";

import ChatMessage from "@/components/Chat/ChatMessage";
import ScrollToBottom from "@/components/ScrollToBottom";
import { useChatStore } from "@/store/message.store";
import { VIRTUOSO_CONFIG } from "@/constants/chat";

export default function ChatPage() {
  const { id: chatId } = useParams() as { id: string };
  const virtuosoRef = useRef<VirtuosoHandle>(null);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);

  const { isSending: isGlobalSending } = useChatStore();
  const { messages, isLoading, loadMore, hasMore, isLoadingMore, sendMessage } = useMessages(chatId);

  useInitialMessage(chatId, isLoading, sendMessage);

  const messageChunks = useMemo(
    () => chunkArray(messages, VIRTUOSO_CONFIG.CHUNK_SIZE),
    [messages]
  );

  const virtuosoContext = useMemo(() => ({
    isSending: isGlobalSending,
    lastMessageId: messages[messages.length - 1]?.id
  }), [isGlobalSending, messages]);

  const handleScrollToBottomClick = useCallback(() => {
    virtuosoRef.current?.scrollToIndex({
      index: messageChunks.length - 1,
      behavior: "smooth",
      align: "end"
    });
  }, [messageChunks.length]);

  const handleStartReached = useCallback(async () => {
    if (hasMore && !isLoadingMore && !isLoading) {
      await loadMore();
    }
  }, [hasMore, isLoadingMore, isLoading, loadMore]);

  if (isLoading && messages.length === 0) {
    return <div className="flex h-full items-center justify-center"><Loader2 className="animate-spin" /></div>;
  }

  return (
    <div className="flex h-full w-full flex-col bg-background relative font-sans">
      <div className="flex-1 min-h-0">
        <Virtuoso
          ref={virtuosoRef}
          data={messageChunks}
          context={virtuosoContext}
          firstItemIndex={Math.max(0, VIRTUOSO_CONFIG.START_INDEX - messageChunks.length)}
          initialTopMostItemIndex={VIRTUOSO_CONFIG.START_INDEX - 1}
          increaseViewportBy={VIRTUOSO_CONFIG.VIEWPORT_ADJUSTMENT}
          atBottomThreshold={VIRTUOSO_CONFIG.AT_BOTTOM_THRESHOLD}
          startReached={handleStartReached}
          atBottomStateChange={(atBottom) => setShowScrollToBottom(!atBottom)}
          itemContent={(index, chunk, context) => (
            <div className="flex flex-col w-full">
              {chunk.map((msg) => (
                <div key={msg.id} className="max-w-3xl mx-auto px-4 md:px-6 py-3 w-full">
                  <ChatMessage 
                    msg={msg} 
                    isLast={msg.id === context.lastMessageId} 
                    isSending={msg.id === context.lastMessageId ? context.isSending : false} 
                  />
                </div>
              ))}
            </div>
          )}
        />
      </div>
      <ScrollToBottom isVisible={showScrollToBottom} onClick={handleScrollToBottomClick} />
    </div>
  );
}
