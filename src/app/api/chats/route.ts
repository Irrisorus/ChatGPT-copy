import { supabaseAdmin } from "@/lib/supabase-admin";
import { createSupabaseAuthClient } from "@/lib/supabase-auth";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const guestId = cookieStore.get("guest_id")?.value ?? null;

    const supabaseAuth = await createSupabaseAuthClient();
    const { data: { user } } = await supabaseAuth.auth.getUser();

    const isAuthenticated = !!user;
    const isGuest = !isAuthenticated && !!guestId;

    if (!isAuthenticated && !isGuest) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let query = supabaseAdmin
      .from("chats")
      .select("*")
      .order("last_message_at", { ascending: false });

    if (isAuthenticated) {
      query = query.eq("user_id", user.id);
    } else {
      query = query.eq("guest_id", guestId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { title } = body;

    const cookieStore = await cookies();
    const guestId = cookieStore.get("guest_id")?.value ?? null;

    const supabaseAuth = await createSupabaseAuthClient();
    const { data: { user } } = await supabaseAuth.auth.getUser();

    const isAuthenticated = !!user;
    const isGuest = !isAuthenticated && !!guestId;

    if (!isAuthenticated && !isGuest) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const chatData = {
      title: title || "Новый чат",
      user_id: isAuthenticated ? user.id : null,
      guest_id: isGuest ? guestId : null,
    };

    const { data, error } = await supabaseAdmin
      .from("chats")
      .insert([chatData])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
