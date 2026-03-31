import { useChatStore } from "@/store/message.store";
import { Message } from "@/types";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";

const LIMIT = 20;

async function fetchMessages(chatId: string, page: number): Promise<Message[]> {
  const res = await fetch(`/api/chats/${chatId}/messages?page=${page}&limit=${LIMIT}`);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const error = new Error(data.error || "Ошибка") as any;
    error.status = res.status;
    throw error;
  };
  return res.json();
}

export function useMessages(chatId: string) {
  const queryClient = useQueryClient();
  const { isSending, setIsSending } = useChatStore();

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


  const messages = useMemo(() => {
    const flat = data?.pages.flat() || [];
    return [...flat].reverse();
  }, [data?.pages]);


  const loadMore = async () => {
    try {
      const result = await fetchNextPage();

      if (result.isError) {
        throw new Error("Не удалось загрузить старые сообщения");
      }

      const newPage = result.data?.pages?.at(-1);

      const length = newPage?.length ?? 0;
      console.log(length);

      return length;
    } catch (error) {
      toast.error("Ошибка при загрузке истории");
      return 0;
    }
  };

  const sendMessage = async ({ chatId, content, files }: { chatId: string; content: string; files?: File[] }) => {
    if ((!content.trim() && (!files || files.length === 0)) || isSending) return;

    setIsSending(true);
    console.log(isSending, '-----------------');

    const userMsgId = crypto.randomUUID();
    const assistantMsgId = crypto.randomUUID();
    const previousState = queryClient.getQueryData(["messages", chatId]);

    const optimisticAttachments = files?.map((file) => ({
      id: crypto.randomUUID(),
      file_url: URL.createObjectURL(file),
      file_name: file.name,
      file_type: file.type,
    })) || [];

    // ОПТИМИСТИЧНОЕ ОБНОВЛЕНИЕ
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
        },
        {
          id: userMsgId,
          chat_id: chatId,
          role: "user",
          content,
          created_at: new Date().toISOString(),
          message_attachments: optimisticAttachments,
        },
        ...newPages[0],
      ];

      return { ...old, pages: newPages };
    });

    console.log("Current Cache:", queryClient.getQueryData(["messages", chatId]));
    try {
      const formData = new FormData();
      formData.append("content", content);
      if (files) files.forEach((f) => formData.append("files", f));

      const response = await fetch(`/api/chats/${chatId}/messages`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        const error = new Error(data.error || "Ошибка") as any;
        error.status = response.status;
        throw error;
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
            pages: old.pages.map((page: any, i: number) => {
              if (i !== 0) return page;
              return page.map((msg: any) =>
                msg.id === assistantMsgId ? { ...msg, content: accumulatedText } : msg
              );
            }),
          };
        });
      }
    } catch (error: any) {
      console.error("Stream error:", error);
      toast.error(error.message || "Ошибка");
      queryClient.setQueryData(["messages", chatId], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page: any, i: number) => {
            if (i !== 0) return page;
            return page.filter((m: any) => m.id !== assistantMsgId);
          }),
        };
      });
    } finally {
      setIsSending(false);
    }

  };


  return {
    messages,
    isLoading,
    isSending,
    sendMessage,
    loadMore,
    hasMore: !!hasNextPage,
    isLoadingMore: isFetchingNextPage
  };
}
