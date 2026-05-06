"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { setNewPasswordAction, type ActionResult } from "@/lib/auth/actions";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [state, dispatch, pending] = useActionState<ActionResult | null, FormData>(
    async (prev, formData) => {
      const res = await setNewPasswordAction(prev, formData);
      if (res.ok) {
        setTimeout(() => router.replace("/"), 1500);
      }
      return res;
    },
    null,
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 p-4">
      <form action={dispatch} className="w-full max-w-md bg-gray-900 rounded-2xl border border-gray-800 p-8 space-y-4">
        <h1 className="text-xl font-bold text-white">Neues Passwort setzen</h1>
        <p className="text-sm text-gray-400">Mindestens 8 Zeichen.</p>
        <input
          name="password"
          type="password"
          minLength={8}
          required
          autoComplete="new-password"
          placeholder="Neues Passwort"
          className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 text-white rounded-xl focus:ring-2 focus:ring-red-500"
        />
        {state && !state.ok && (
          <div className="text-sm text-red-400 bg-red-950/40 border border-red-900/60 rounded-lg px-3 py-2">{state.error}</div>
        )}
        {state && state.ok && (
          <div className="text-sm text-green-400 bg-green-950/40 border border-green-900/60 rounded-lg px-3 py-2">
            Passwort gesetzt \u2014 du wirst weitergeleitet\u2026
          </div>
        )}
        <button
          type="submit"
          disabled={pending}
          className="w-full bg-linear-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-2.5 px-4 rounded-xl font-medium transition disabled:opacity-60"
        >
          {pending ? "Speichere\u2026" : "Speichern"}
        </button>
      </form>
    </div>
  );
}
