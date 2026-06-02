import { createClient } from '@supabase/supabase-js'

// Service-role client for public pages that need to bypass RLS (e.g. shared run reports).
// Never expose SUPABASE_SERVICE_ROLE_KEY to the browser — this file is server-only.
export const supabasePublic = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)
