import { Message } from "@/types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

async function fetchMessages(chatId: string): Promise<Message[]> {
  const res = await fetch(`/api/chats/${chatId}/messages`);
  if (!res.ok) throw new Error("Failed to fetch messages");
  return res.json();
}

export function useMessages(chatId: string) {
  const queryClient = useQueryClient();
  const [isSending, setIsSending] = useState(false);

  const messagesQuery = useQuery({
    queryKey: ["messages", chatId],
    queryFn: () => fetchMessages(chatId),
    enabled: !!chatId,
  });

  const sendMessage = async ({ chatId, content }: { chatId: string; content: string }) => {
    if (!content.trim() || isSending) return;

    setIsSending(true);

    const userMsgId = crypto.randomUUID();
    const assistantMsgId = crypto.randomUUID();
    const previousMessages = queryClient.getQueryData<Message[]>(["messages", chatId]);

    queryClient.setQueryData<Message[]>(["messages", chatId], (old = []) => [
      ...old,
      {
        id: userMsgId,
        chat_id: chatId,
        role: "user",
        content: content,
        created_at: new Date().toISOString(),
      } as Message,
      {
        id: assistantMsgId,
        chat_id: chatId,
        role: "assistant",
        content: "", //will be updated later
        created_at: new Date().toISOString(),
      } as Message,
    ]);

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

      //streaming
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        accumulatedText += chunk;

        queryClient.setQueryData<Message[]>(["messages", chatId], (old = []) =>
          old.map((msg) =>
            msg.id === assistantMsgId ? { ...msg, content: accumulatedText } : msg
          )
        );
      }

      // queryClient.invalidateQueries({ queryKey: ["messages", chatId] });
      queryClient.invalidateQueries({ queryKey: ["chats"] });

    } catch (error) {
      console.error("Streaming error:", error);
      //add toast
      if (previousMessages) {
        queryClient.setQueryData(["messages", chatId], previousMessages);
      }
    } finally {
      setIsSending(false);
    }
  };

  return {
    messages: messagesQuery.data || [],
    isLoading: messagesQuery.isLoading,
    sendMessage,
    isSending,
  };
}
