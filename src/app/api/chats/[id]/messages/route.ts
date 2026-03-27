import { supabaseAdmin } from "@/lib/supabase-admin";
import { createSupabaseAuthClient } from "@/lib/supabase-auth";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id: chatId } = await params;
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

    const { data: messages, error: messagesError } = await supabaseAdmin
      .from("messages")
      .select("*")
      .eq("chat_id", chatId)
      .order("created_at", { ascending: true }); 

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
export async function POST(request: Request, { params }: RouteParams) {
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
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();

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
        // TODO: Add toast
        return NextResponse.json({ error: "Limit reached" }, { status: 403 });
      }
    }

    await supabaseAdmin.from("messages").insert({
      chat_id: chatId,
      role: "user",
      content,
    });

   
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(content);
    const aiResponse = result.response.text();

    const { data: assistantMsg, error: aiSaveError } = await supabaseAdmin
      .from("messages")
      .insert({
        chat_id: chatId,
        role: "assistant",
        content: aiResponse,
      })
      .select("id, chat_id, role, content, created_at")
      .single();

    if (aiSaveError) throw aiSaveError;

    const now = new Date().toISOString();
    await supabaseAdmin
      .from("chats")
      .update({ last_message_at: now, updated_at: now })
      .eq("id", chatId);

    return NextResponse.json(assistantMsg);

  } catch (error: any) {
    console.error("Route Error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
