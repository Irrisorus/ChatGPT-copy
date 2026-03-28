import { useAuth } from "@/components/providers/auth-provider";
import { supabaseBrowser } from "@/lib/supabase-client";
import { Chat } from "@/types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { getCookie } from "cookies-next"

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
  const { user } = useAuth();
  const guestId = getCookie("guest_id"); 

  const chatsQuery = useQuery({
    queryKey: ["chats", user?.id ?? guestId],
    queryFn: fetchChats,
    enabled: !!user || !!guestId,
  });

  useEffect(() => {
    const channelFilter = user 
      ? `user_id=eq.${user.id}` 
      : `guest_id=eq.${guestId}`;

    const channel = supabaseBrowser
      .channel("realtime_chats")
      .on(
        "postgres_changes",
        {
          event: "*", 
          schema: "public",
          table: "chats",
          filter: channelFilter,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["chats", user?.id ?? guestId] });
        }
      )
      .subscribe();

    return () => {
      supabaseBrowser.removeChannel(channel);
    };
  }, [user?.id, guestId, queryClient]);

  const createChatMutation = useMutation({
    mutationFn: createChat,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chats", user?.id ?? guestId] });
    },
  });

  return {
    chats: chatsQuery.data,
    isLoading: chatsQuery.isLoading,
    createChat: createChatMutation.mutate,
    isCreating: createChatMutation.isPending,
  };
}
