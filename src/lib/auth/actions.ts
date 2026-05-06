"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type ActionResult = { ok: true } | { ok: false; error: string };

/** Sign in with email + password. */
export async function signInAction(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { ok: false, error: "Email und Passwort erforderlich" };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { ok: false, error: friendlyAuthError(error.message) };

  // Block deactivated users defensively (RLS would also filter them).
  const admin = createAdminClient();
  const { data: row } = await admin
    .from("users")
    .select("is_active")
    .eq("email", email)
    .maybeSingle();
  if (row && row.is_active === false) {
    await supabase.auth.signOut();
    return { ok: false, error: "Konto ist deaktiviert" };
  }

  return { ok: true };
}

/** Sign out current user. Caller is responsible for navigating to /login. */
export async function signOutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
}

/** Send a password reset email. */
export async function requestPasswordResetAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email) return { ok: false, error: "Email erforderlich" };

  const supabase = await createClient();
  const redirectTo = `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/auth/reset-password`;
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
  if (error) return { ok: false, error: friendlyAuthError(error.message) };
  return { ok: true };
}

/** Set a new password (used on /auth/reset-password after clicking the email link). */
export async function setNewPasswordAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const password = String(formData.get("password") ?? "");
  if (password.length < 8) return { ok: false, error: "Passwort muss mindestens 8 Zeichen haben" };

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { ok: false, error: friendlyAuthError(error.message) };
  return { ok: true };
}

/**
 * Admin invites a new user by email. Creates an auth user with a temporary
 * password, links to public.users (creates row if missing), and sends the
 * standard password-reset email so the invitee can set their own password.
 */
export async function inviteUserAction(data: {
  name: string;
  email: string;
  level: string;
  roles: string[];
}): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user: caller } } = await supabase.auth.getUser();
  if (!caller) return { ok: false, error: "Nicht authentifiziert" };

  const admin = createAdminClient();
  // Authorization: caller must be admin
  const { data: callerRow } = await admin
    .from("users")
    .select("roles, is_active")
    .eq("auth_user_id", caller.id)
    .maybeSingle();
  if (!callerRow || !callerRow.is_active || !(callerRow.roles as string[]).includes("Admin")) {
    return { ok: false, error: "Nur Administratoren d\u00fcrfen User einladen" };
  }

  const email = data.email.trim().toLowerCase();
  if (!email || !data.name.trim()) return { ok: false, error: "Name und Email erforderlich" };

  const redirectTo = `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/auth/reset-password`;
  const { data: inviteData, error: inviteError } = await admin.auth.admin.inviteUserByEmail(email, {
    redirectTo,
  });
  if (inviteError || !inviteData.user) {
    return { ok: false, error: friendlyAuthError(inviteError?.message ?? "Einladung fehlgeschlagen") };
  }

  const authUserId = inviteData.user.id;

  // Upsert public.users row linked to auth user
  const { error: upsertError } = await admin.from("users").upsert(
    {
      name: data.name.trim(),
      email,
      level: data.level,
      roles: data.roles,
      cv_file_url: "",
      auth_user_id: authUserId,
      is_active: true,
    },
    { onConflict: "email" },
  );
  if (upsertError) return { ok: false, error: upsertError.message };

  return { ok: true };
}

/** Soft-delete (deactivate) a user. Admin-only. */
export async function setUserActiveAction(userId: string, isActive: boolean): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user: caller } } = await supabase.auth.getUser();
  if (!caller) return { ok: false, error: "Nicht authentifiziert" };

  const admin = createAdminClient();
  const { data: callerRow } = await admin
    .from("users")
    .select("roles, is_active")
    .eq("auth_user_id", caller.id)
    .maybeSingle();
  if (!callerRow || !callerRow.is_active || !(callerRow.roles as string[]).includes("Admin")) {
    return { ok: false, error: "Nur Administratoren d\u00fcrfen User deaktivieren" };
  }

  const { data: target, error: tErr } = await admin
    .from("users")
    .select("id, auth_user_id")
    .eq("id", userId)
    .maybeSingle();
  if (tErr || !target) return { ok: false, error: tErr?.message ?? "User nicht gefunden" };

  const { error } = await admin.from("users").update({ is_active: isActive }).eq("id", userId);
  if (error) return { ok: false, error: error.message };

  // Best-effort: ban/unban the auth user so they can't log in either.
  if (target.auth_user_id) {
    await admin.auth.admin.updateUserById(target.auth_user_id as string, {
      ban_duration: isActive ? "none" : "876000h", // ~100 years
    });
  }

  return { ok: true };
}

function friendlyAuthError(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes("invalid login")) return "Email oder Passwort falsch";
  if (m.includes("email not confirmed")) return "Bitte best\u00e4tige zuerst deine Email-Adresse";
  if (m.includes("user already")) return "Ein User mit dieser Email existiert bereits";
  return msg;
}
