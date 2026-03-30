import { Message } from "@/types";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";

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

  const messages = useMemo(() => {
    const flat = data?.pages.flat() || [];
    // Важно: если API отдает DESC, reverse() делает порядок хронологическим (0 = старое, length-1 = новое)
    return [...flat].reverse(); 
  }, [data?.pages]);

  const loadMore = async () => {
    const prevCount = data?.pages.flat().length ?? 0;
    const result = await fetchNextPage();
    const nextCount = result.data?.pages.flat().length ?? prevCount;
    return nextCount - prevCount;
  };

  const sendMessage = async ({ chatId, content, files }: { chatId: string; content: string; files?: File[] }) => {
    if ((!content.trim() && (!files || files.length === 0)) || isSending) return;

    setIsSending(true);
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
      
      // Добавляем в начало первой страницы (так как потом мы делаем reverse)
      // В итоге в массиве messages это будет в самом конце
      newPages[0] = [
        {
          id: assistantMsgId,
          chat_id: chatId,
          role: "assistant",
          content: "", // Пустота для триггера Loader2
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

    try {
      const formData = new FormData();
      formData.append("content", content);
      if (files) files.forEach((f) => formData.append("files", f));

      const response = await fetch(`/api/chats/${chatId}/messages`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed");
      if (!response.body) return;

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        accumulatedText += chunk;

        // ОПТИМИЗИРОВАННОЕ ОБНОВЛЕНИЕ СТРИМА
        queryClient.setQueryData(["messages", chatId], (old: any) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page: Message[], i: number) => {
              // Обновляем сообщение только в той странице, где оно есть (обычно в первой)
              if (i !== 0) return page; 
              return page.map((msg) =>
                msg.id === assistantMsgId ? { ...msg, content: accumulatedText } : msg
              );
            }),
          };
        });
      }
      queryClient.invalidateQueries({ queryKey: ["chats"] });
    } catch (error) {
      if (previousState) queryClient.setQueryData(["messages", chatId], previousState);
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
    hasMore:!!hasNextPage,
    isLoadingMore:
    isFetchingNextPage };
}
