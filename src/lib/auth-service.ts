import { cookies } from "next/headers";
import { createSupabaseAuthClient } from "@/lib/supabase-auth";

export async function getAuthContext() {
  const cookieStore = await cookies();
  const guestId = cookieStore.get("guest_id")?.value ?? null;
  
  const supabaseAuth = await createSupabaseAuthClient();
  const { data: { user } } = await supabaseAuth.auth.getUser();

  const isAuthenticated = !!user;
  const isGuest = !isAuthenticated && !!guestId;

  return {
    user,
    guestId,
    isAuthenticated,
    isGuest,
    hasAnyAuth: isAuthenticated || isGuest
  };
}
