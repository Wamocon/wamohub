/**
 * Seeds Supabase Auth users for the 10 WAMOCON team accounts and links them
 * to the matching public.users row via `auth_user_id`.
 *
 * Run after `npm run db:reset`:
 *   npm run db:seed:auth
 *
 * Demo passwords (NEVER use these patterns in production):
 *   waleri.moretz@wamocon.com    / Demo1234!   (Admin + Mentor + Ausbilder, GF)
 *   olga.moretz@wamocon.com      / Demo1234!   (Admin, Assistenz GF)
 *   daniel.moretz@wamocon.com    / Demo1234!   (Ausbilder, ISTQB-Trainer)
 *   nikolaj.schefner@wamocon.com / Demo1234!   (Mentee)
 *   nurzhan.kukeyev@wamocon.com  / Demo1234!   (Mentee)
 *   leon.moretz@wamocon.com      / Demo1234!   (Mentee, Azubi)
 *   erwin.moretz@wamocon.com     / Demo1234!   (Mentee)
 *   elias.felsing@wamocon.com    / Demo1234!   (Mentee, Azubi)
 *   yash.bhesaniya@wamocon.com   / Demo1234!   (Mentee)
 *   maanik.garg@wamocon.com      / Demo1234!   (Mentee)
 *
 * Idempotent: re-running updates passwords + re-links rows.
 */
import { createClient } from "@supabase/supabase-js";
import { config as loadEnv } from "dotenv";
import { resolve } from "node:path";

loadEnv({ path: resolve(process.cwd(), ".env.local") });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const admin = createClient(url, serviceKey, {
  db: { schema: (process.env.SUPABASE_DB_SCHEMA as "public") || "public" },
  auth: { autoRefreshToken: false, persistSession: false },
});

const DEMO_USERS = [
  { email: "waleri.moretz@wamocon.com",    password: "Demo1234!" },
  { email: "olga.moretz@wamocon.com",      password: "Demo1234!" },
  { email: "daniel.moretz@wamocon.com",    password: "Demo1234!" },
  { email: "nikolaj.schefner@wamocon.com", password: "Demo1234!" },
  { email: "nurzhan.kukeyev@wamocon.com",  password: "Demo1234!" },
  { email: "leon.moretz@wamocon.com",      password: "Demo1234!" },
  { email: "erwin.moretz@wamocon.com",     password: "Demo1234!" },
  { email: "elias.felsing@wamocon.com",    password: "Demo1234!" },
  { email: "yash.bhesaniya@wamocon.com",   password: "Demo1234!" },
  { email: "maanik.garg@wamocon.com",      password: "Demo1234!" },
] as const;

async function findAuthUserByEmail(email: string) {
  let page = 1;
  // listUsers paginates; demo footprint is small so this is fine.
  while (page < 20) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const found = data.users.find((u) => u.email?.toLowerCase() === email);
    if (found) return found;
    if (data.users.length < 200) return null;
    page += 1;
  }
  return null;
}

async function ensureAuthUser(email: string, password: string) {
  const existing = await findAuthUserByEmail(email);
  if (existing) {
    const { error } = await admin.auth.admin.updateUserById(existing.id, {
      password,
      email_confirm: true,
      ban_duration: "none",
    });
    if (error) throw error;
    return existing.id;
  }
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error) throw error;
  return data.user!.id;
}

async function linkPublicUser(email: string, authUserId: string) {
  const { error } = await admin.from("users").update({ auth_user_id: authUserId }).eq("email", email);
  if (error) throw error;
}

async function main() {
  console.log(`[seed-auth-users] target: ${url}`);
  for (const u of DEMO_USERS) {
    process.stdout.write(`  • ${u.email} … `);
    try {
      const authId = await ensureAuthUser(u.email, u.password);
      await linkPublicUser(u.email, authId);
      console.log("OK");
    } catch (err) {
      console.log("FAIL");
      console.error(err);
      process.exit(1);
    }
  }
  console.log("\nDone. All 10 demo accounts can log in with password 'Demo1234!'.");
}

main();
