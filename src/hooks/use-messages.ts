import { Message } from "@/types";
import { useInfiniteQuery, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

const LIMIT = 10;

async function fetchMessages(chatId: string, page: number): Promise<Message[]> {
  const res = await fetch(`/api/chats/${chatId}/messages?page=${page}&limit=${LIMIT}`);
  if (!res.ok) throw new Error("Failed to fetch messages");
  return res.json();
}

export function useMessages(chatId: string) {
  const queryClient = useQueryClient();
  const [isSending, setIsSending] = useState(false);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading
  } = useInfiniteQuery({
    queryKey: ["messages", chatId],
    queryFn: ({ pageParam = 0 }) => fetchMessages(chatId, pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === LIMIT ? allPages.length : undefined;
    },
    enabled: !!chatId,
  });

  const messages = data?.pages.flat() || [];

  const sendMessage = async ({ chatId, content }: { chatId: string; content: string }) => {
    if (!content.trim() || isSending) return;

    setIsSending(true);

    const userMsgId = crypto.randomUUID();
    const assistantMsgId = crypto.randomUUID();

    const previousState = queryClient.getQueryData(["messages", chatId]);

    queryClient.setQueryData(["messages", chatId], (old: any) => {
      if (!old || !old.pages) return old;
      
      const newPages = [...old.pages];
      newPages[0] = [
        {
          id: assistantMsgId,
          chat_id: chatId,
          role: "assistant",
          content: "",
          created_at: new Date().toISOString(),
        } as Message,
        {
          id: userMsgId,
          chat_id: chatId,
          role: "user",
          content: content,
          created_at: new Date().toISOString(),
        } as Message,
        ...newPages[0],
      ];

      return { ...old, pages: newPages };
    });

    try {
      const response = await fetch(`/api/chats/${chatId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to send message");
      }

      if (!response.body) return;

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        accumulatedText += chunk;

        queryClient.setQueryData(["messages", chatId], (old: any) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page: Message[]) =>
              page.map((msg) =>
                msg.id === assistantMsgId ? { ...msg, content: accumulatedText } : msg
              )
            ),
          };
        });
      }

      queryClient.invalidateQueries({ queryKey: ["chats"] });

    } catch (error) {
      console.error("Streaming error:", error);
      if (previousState) {
        queryClient.setQueryData(["messages", chatId], previousState);
      }
    } finally {
      setIsSending(false);
    }
  };

  return {
    messages,
    isLoading,
    isSending,
    sendMessage,
    loadMore: fetchNextPage,
    hasMore: !!hasNextPage,
    isLoadingMore: isFetchingNextPage,
  };
}
