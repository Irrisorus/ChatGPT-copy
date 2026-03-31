import { getAuthContext } from "@/lib/auth-service";
import { validateChatAccess } from "@/lib/chat-access";
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

    const auth = await getAuthContext();
    if (!auth.hasAnyAuth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { chat, error, status } = await validateChatAccess(chatId, auth);
    if (error) return NextResponse.json({ error }, { status });

    const { data: messages, error: messagesError } = await supabaseAdmin
      .from("messages")
      .select("*, message_attachments(*)") 
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

    const formData = await request.formData();
    const content = (formData.get("content") as string) || "";
    const files = formData.getAll("files") as File[];

    if (!content.trim() && files.length === 0) {
      return NextResponse.json({ error: "Сообщение пустое" }, { status: 400 });
    }

    //--- auth ---
   const auth = await getAuthContext();
    if (!auth.hasAnyAuth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { chat, error, status } = await validateChatAccess(chatId, auth);
    if (error) return NextResponse.json({ error }, { status });

    if (auth.isGuest) {
      const { count } = await supabaseAdmin
        .from("messages")
        .select("*", { count: "exact", head: true })
        .eq("chat_id", chatId)
        .eq("role", "user");

      if ((count ?? 0) >= 3) return NextResponse.json({ error: "Limit reached" }, { status: 403 });
    }

    const { data: userMsg, error: userMsgError } = await supabaseAdmin
      .from("messages")
      .insert({ chat_id: chatId, role: "user", content })
      .select("id")
      .single();

    if (userMsgError) throw userMsgError;

    //--- attachments ---
    const aiAttachments = [];
    const dbAttachments = [];

    for (const file of files) {
      const fileExt = file.name.split(".").pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `${chatId}/${fileName}`;

      const { error: uploadError } = await supabaseAdmin.storage
        .from("chat-attachments")
        .upload(filePath, file);

      if (uploadError) {
        console.error("Upload error:", uploadError);
        continue;
      }

      const { data: { publicUrl } } = supabaseAdmin.storage
        .from("chat-attachments")
        .getPublicUrl(filePath);

      dbAttachments.push({
        message_id: userMsg.id,
        file_url: publicUrl,
        file_name: file.name,
        file_type: file.type,
      });

      const buffer = Buffer.from(await file.arrayBuffer());
      aiAttachments.push({
        data: buffer.toString("base64"),
        contentType: file.type,
      });
    }

    if (dbAttachments.length > 0) {
      await supabaseAdmin.from("message_attachments").insert(dbAttachments);
    }

    const result = await streamText({
      model: google("gemini-3-flash-preview"), 
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: content },
            ...aiAttachments.map((a) => 
              a.contentType.startsWith("image/") 
                ? { type: "image" as const, image: a.data }
                : { type: "file" as const, data: a.data, mimeType: a.contentType,mediaType:a.contentType }
            ),

          ],
        },
      ],
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
          console.error("Ошибка сохранения ответа ИИ:", e);
        }
      },
    });

    return result.toTextStreamResponse();

  } catch (error: any) {
    console.error("Route Error:", error);
    return NextResponse.json({ error: error?.message || "Internal Error" }, { status: 500 });
  }
}
