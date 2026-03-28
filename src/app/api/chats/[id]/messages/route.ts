import { supabaseAdmin } from "@/lib/supabase-admin";
import { createSupabaseAuthClient } from "@/lib/supabase-auth";
import { google } from "@ai-sdk/google";
import { streamText } from "ai";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id: chatId } = await params;
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "0");
    const limit = parseInt(url.searchParams.get("limit") || "10");

    const from = page * limit;
    const to = from + limit - 1;

    const cookieStore = await cookies();
    const guestId = cookieStore.get("guest_id")?.value ?? null;
    const supabaseAuth = await createSupabaseAuthClient();
    const { data: { user } } = await supabaseAuth.auth.getUser();

    const isAuthenticated = !!user;
    const isGuest = !isAuthenticated && !!guestId;

    if (!isAuthenticated && !isGuest) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: chat, error: chatError } = await supabaseAdmin
      .from("chats")
      .select("id, user_id, guest_id")
      .eq("id", chatId)
      .single();

    if (chatError || !chat) {
      return NextResponse.json({ error: "Чат не найден" }, { status: 404 });
    }

    const hasUserAccess = isAuthenticated && chat.user_id === user?.id;
    const hasGuestAccess = isGuest && chat.guest_id === guestId;

    if (!hasUserAccess && !hasGuestAccess) {
      return NextResponse.json({ error: "Forbidden: No access" }, { status: 403 });
    }
  

    //messages request
    const { data: messages, error: messagesError } = await supabaseAdmin
      .from("messages")
      .select("*")
      .eq("chat_id", chatId)
      .order("created_at", { ascending: false })
      .range(from, to);

    if (messagesError) {
      console.error("Ошибка БД при получении сообщений:", messagesError);
      return NextResponse.json({ error: "Ошибка при получении сообщений" }, { status: 500 });
    }

    return NextResponse.json(messages);

  } catch (error: any) {
    console.error("Route Error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: chatId } = await params;
    const cookieStore = await cookies();

    const body = await request.json().catch(() => null);
    if (!body || typeof body.content !== "string" || !body.content.trim()) {
      return NextResponse.json({ error: "Сообщение не передано" }, { status: 400 });
    }
    const content = body.content.trim();

    const guestId = cookieStore.get("guest_id")?.value ?? null;
    const supabaseAuth = await createSupabaseAuthClient();
    const { data: { user } } = await supabaseAuth.auth.getUser();

    const isAuthenticated = !!user;
    const isGuest = !isAuthenticated && !!guestId;

    if (!isAuthenticated && !isGuest) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: chat, error: chatError } = await supabaseAdmin
      .from("chats")
      .select("id, user_id, guest_id")
      .eq("id", chatId)
      .single();

    if (chatError || !chat) {
      return NextResponse.json({ error: "Чат не найден" }, { status: 404 });
    }

    const hasUserAccess = isAuthenticated && chat.user_id === user?.id;
    const hasGuestAccess = isGuest && chat.guest_id === guestId;

    if (!hasUserAccess && !hasGuestAccess) {
      return NextResponse.json({ error: "Forbidden: No access" }, { status: 403 });
    }

    if (hasGuestAccess) {
      const { count } = await supabaseAdmin
        .from("messages")
        .select("*", { count: "exact", head: true })
        .eq("chat_id", chatId)
        .eq("role", "user");

      if ((count ?? 0) >= 3) {
        return NextResponse.json({ error: "Limit reached" }, { status: 403 });
      }
    }

    await supabaseAdmin.from("messages").insert({
      chat_id: chatId,
      role: "user",
      content,
    });

    const result = await streamText({
      model: google("gemini-2.5-flash"), 
      prompt: content,
      onFinish: async ({ text }) => {
        try {
          const now = new Date().toISOString();
          await supabaseAdmin.from("messages").insert({
            chat_id: chatId,
            role: "assistant",
            content: text,
          });

          await supabaseAdmin
            .from("chats")
            .update({ last_message_at: now, updated_at: now })
            .eq("id", chatId);

        } catch (e) {
          console.error("Ошибка при сохранении ответа ИИ:", e);
        }
      },
    });

   
    return result.toTextStreamResponse();

  } catch (error: any) {
    console.error("Route Error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
