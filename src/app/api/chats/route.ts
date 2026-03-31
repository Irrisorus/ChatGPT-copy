import { supabaseAdmin } from "@/lib/supabase-admin";
import { getAuthContext } from "@/lib/auth-service";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const auth = await getAuthContext();

    let query = supabaseAdmin
      .from("chats")
      .select("*")
      .order("last_message_at", { ascending: false });
      
    if (auth.isAuthenticated) {
      query = query.eq("user_id", auth.user?.id);
    } else {
      query = query.eq("guest_id", auth.guestId);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Chats GET Error:", error);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { title } = body;

    const auth = await getAuthContext();

    const chatData = {
      title: title || "Новый чат",
      user_id: auth.isAuthenticated ? auth.user?.id : null,
      guest_id: auth.isGuest ? auth.guestId : null,
    };

    const { data, error } = await supabaseAdmin
      .from("chats")
      .insert([chatData])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Chats POST Error:", error);
  }
}
