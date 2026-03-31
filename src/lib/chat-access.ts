import { supabaseAdmin } from "@/lib/supabase-admin";

export async function validateChatAccess(chatId: string, auth: any) {
  const { data: chat, error } = await supabaseAdmin
    .from("chats")
    .select("id, user_id, guest_id")
    .eq("id", chatId)
    .single();

  if (error || !chat) return { error: "Чат не найден", status: 404 };

  const hasUserAccess = auth.isAuthenticated && chat.user_id === auth.user?.id;
  const hasGuestAccess = auth.isGuest && chat.guest_id === auth.guestId;

  if (!hasUserAccess && !hasGuestAccess) {
    return { error: "Forbidden: No access", status: 403 };
  }

  return { chat, error: null };
}
