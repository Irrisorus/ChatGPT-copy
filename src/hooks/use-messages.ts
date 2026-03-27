import { Message } from "@/types"; 
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

async function fetchMessages(chatId: string): Promise<Message[]> {
  const res = await fetch(`/api/chats/${chatId}/messages`);
  if (!res.ok) throw new Error("Failed to fetch messages");
  return res.json();
}

async function sendMessage({ chatId, content }: { chatId: string, content: string }): Promise<Message> {
  const res = await fetch(`/api/chats/${chatId}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || "Failed to send message");
  }

  return res.json();
}

export function useMessages(chatId: string) {
  const queryClient = useQueryClient();

  const messagesQuery = useQuery({
    queryKey: ["messages", chatId],
    queryFn: () => fetchMessages(chatId),
    enabled: !!chatId,
  });

  const sendMessageMutation = useMutation({
    mutationFn: sendMessage,
    
    onMutate: async (newMessage) => {
      await queryClient.cancelQueries({ queryKey: ["messages", chatId] });
      const previousMessages = queryClient.getQueryData<Message[]>(["messages", chatId]);
      queryClient.setQueryData<Message[]>(["messages", chatId], (old = []) => [
        ...old,
        {
          id: crypto.randomUUID(),
          chat_id: chatId,
          role: "user",
          content: newMessage.content,
          created_at: new Date().toISOString(),
        } as Message,
      ]);

      return { previousMessages };
    },

    onError: (err, newMessage, context) => {
      if (context?.previousMessages) {
        queryClient.setQueryData(["messages", chatId], context.previousMessages);
      }
      // TODO: add toast
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", chatId] });
      queryClient.invalidateQueries({ queryKey: ["chats"] });
    },
  });

  return {
    messages: messagesQuery.data || [],
    isLoading: messagesQuery.isLoading,
    sendMessage: sendMessageMutation.mutate,
    isSending: sendMessageMutation.isPending,
  };
}
