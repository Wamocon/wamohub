import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { config as loadEnv } from "dotenv";
import { resolve } from "node:path";

// Load .env.local for tests (Next.js loads it automatically for the dev server,
// but the Playwright runner itself needs it explicitly).
loadEnv({ path: resolve(process.cwd(), ".env.local") });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  throw new Error(
    "E2E setup: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local",
  );
}

const schema = (process.env.SUPABASE_DB_SCHEMA as "public") || "public";

export const adminDb: SupabaseClient = createClient(url, serviceKey, {
  db: { schema },
  auth: { autoRefreshToken: false, persistSession: false },
});

/**
 * Test data prefix strategy.
 *
 * Each test calls `makePrefix()` once and uses it for every row it inserts.
 * `cleanupByPrefix(prefix)` then deletes anything created during that test.
 *
 * Pattern: `e2e-<workerIndex>-<timestamp>-<random>-`
 */
export function makePrefix(label = "test"): string {
  if (label.startsWith("e2e")) {
    throw new Error("Test prefix label must not start with 'e2e' — the helper adds it.");
  }
  const ts = Date.now().toString(36);
  const rnd = Math.random().toString(36).slice(2, 8);
  return `e2e-${label}-${ts}-${rnd}-`;
}

/**
 * SAFETY GUARDS — cleanup must NEVER touch seed data.
 *
 * Both must hold for any prefix that this helper accepts:
 *   - it starts with the literal `e2e-`,
 *   - it does not match any demo email domain or demo UUID prefix.
 */
const PROTECTED_EMAIL_DOMAINS = ["@wamocon.de"];
const PROTECTED_UUID_PREFIXES = [
  "a0000000-",
  "b0000000-",
  "c0000000-",
  "d0000000-",
  "e0000000-",
  "f0000000-",
  "fa000000-",
  "fa100000-",
];

function assertSafePrefix(prefix: string): void {
  if (!prefix.startsWith("e2e-")) {
    throw new Error(`Refusing to cleanup with non-e2e prefix: ${prefix}`);
  }
  for (const dom of PROTECTED_EMAIL_DOMAINS) {
    if (prefix.includes(dom)) {
      throw new Error(`Refusing cleanup — prefix collides with demo domain ${dom}`);
    }
  }
  for (const u of PROTECTED_UUID_PREFIXES) {
    if (prefix.startsWith(u)) {
      throw new Error(`Refusing cleanup — prefix collides with demo UUID block ${u}`);
    }
  }
}

const TABLES_WITH_NAME = ["projects", "wamocon_apps", "wamocon_waves"] as const;
const TABLES_WITH_TITLE = ["goals", "mentor_tasks", "reflections"] as const;
const TABLES_WITH_BODY = ["notes"] as const;
const TABLES_WITH_DESCRIPTION = ["timesheets", "travel_costs"] as const;
const USERS_BY_EMAIL = "users";

/**
 * Delete every row across known tables whose human-readable column begins with
 * the given prefix. Best-effort: errors are swallowed so test-cleanup never
 * masks the actual failure.
 */
export async function cleanupByPrefix(prefix: string): Promise<void> {
  assertSafePrefix(prefix);

  const ops: Promise<unknown>[] = [];
  for (const table of TABLES_WITH_NAME) {
    ops.push(Promise.resolve(adminDb.from(table).delete().like("name", `${prefix}%`)));
  }
  for (const table of TABLES_WITH_TITLE) {
    ops.push(Promise.resolve(adminDb.from(table).delete().like("title", `${prefix}%`)));
  }
  for (const table of TABLES_WITH_BODY) {
    ops.push(Promise.resolve(adminDb.from(table).delete().like("body", `${prefix}%`)));
  }
  for (const table of TABLES_WITH_DESCRIPTION) {
    ops.push(Promise.resolve(adminDb.from(table).delete().like("description", `${prefix}%`)));
  }
  ops.push(Promise.resolve(adminDb.from("vacation_requests").delete().like("reason", `${prefix}%`)));
  ops.push(Promise.resolve(adminDb.from(USERS_BY_EMAIL).delete().like("email", `${prefix}%`)));
  ops.push(Promise.resolve(adminDb.from("external_links").delete().like("key", `${prefix.toUpperCase()}%`)));

  const results = await Promise.allSettled(ops);
  const failures = results.filter((r) => r.status === "rejected");
  if (failures.length > 0 && process.env.E2E_DEBUG === "1") {
    console.warn(`[e2e cleanup] ${failures.length} delete ops failed for prefix ${prefix}`);
  }
}
