import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export async function createSupabaseAuthClient() {
  // В Next.js 15 cookies() — это Promise
  const cookieStore = await cookies();

  return createServerClient(
    process.env.SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // В Route Handlers установка кук может не сработать, если заголовки уже отправлены
          }
        },
      },
    }
  );
}
