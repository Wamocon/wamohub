import { createClient } from "@supabase/supabase-js";

export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      db: { schema: (process.env.SUPABASE_DB_SCHEMA as "public") || "public" },
      auth: { autoRefreshToken: false, persistSession: false },
    },
  );
}
