import { createClient } from '@supabase/supabase-js'

export const supabaseBrowser = createClient(
  process.env.SUPABASE_URL!,
  process.env.NEXT_PUBLIC_ANON_KEY!
)
