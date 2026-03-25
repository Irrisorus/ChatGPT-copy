import { Chat } from "@/types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

async function fetchChats(): Promise<Chat[]> {
  const res = await fetch("/api/chats");

  if (!res.ok) {
    throw new Error("Failed to fetch chats");
  }

  return res.json();
}

async function createChat(title?: string): Promise<Chat> {
  const res = await fetch("/api/chats", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ title }),
  });

  if (!res.ok) {
    throw new Error("Failed to create chat");
  }

  return res.json();
}

export function useChats() {
  const queryClient = useQueryClient();

  const chatsQuery = useQuery({
    queryKey: ["chats"],
    queryFn: fetchChats,
  });

  const createChatMutation = useMutation({
    mutationFn: createChat,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chats"] });
    },
  });

  return {
    chats: chatsQuery.data,
    isLoading: chatsQuery.isLoading,
    createChat: createChatMutation.mutate,
    isCreating: createChatMutation.isPending,
  };
}
