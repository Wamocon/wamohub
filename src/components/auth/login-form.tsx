"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { LogIn, Mail, KeyRound } from "lucide-react";
import { signInAction, requestPasswordResetAction, type ActionResult } from "@/lib/auth/actions";
import { useAppState } from "@/lib/app-state";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/";
  const [mode, setMode] = useState<"signin" | "reset">("signin");
  const { refreshData } = useAppState();

  const [signInState, signInDispatch, signingIn] = useActionState<ActionResult | null, FormData>(
    async (prev, formData) => {
      const res = await signInAction(prev, formData);
      if (res.ok) {
        await refreshData();
        router.replace(next);
      }
      return res;
    },
    null,
  );

  const [resetState, resetDispatch, resetting] = useActionState<ActionResult | null, FormData>(
    requestPasswordResetAction,
    null,
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-950 via-gray-900 to-gray-950 p-4">
      <div className="w-full max-w-md bg-gray-900/80 backdrop-blur rounded-2xl shadow-2xl p-8 border border-gray-800">
        <div className="text-center mb-8">
          <div className="mx-auto w-14 h-14 bg-red-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-red-900/40">
            <span className="text-white font-bold text-2xl">R</span>
          </div>
          <h1 className="text-2xl font-bold text-white">RELDA</h1>
          <p className="text-sm text-gray-400 mt-1">Quality &amp; Testing Command Center</p>
        </div>

        {mode === "signin" ? (
          <form action={signInDispatch} className="space-y-4" data-testid="login-form">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  data-testid="login-email"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-800 border border-gray-700 text-white rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition placeholder-gray-500"
                  placeholder="name@wamocon.com"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Passwort</label>
              <div className="relative">
                <KeyRound size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  minLength={8}
                  data-testid="login-password"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-800 border border-gray-700 text-white rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition placeholder-gray-500"
                  placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"
                />
              </div>
            </div>

            {signInState && !signInState.ok && (
              <div className="text-sm text-red-400 bg-red-950/40 border border-red-900/60 rounded-lg px-3 py-2" data-testid="login-error">
                {signInState.error}
              </div>
            )}

            <button
              type="submit"
              disabled={signingIn}
              data-testid="login-submit"
              className="w-full bg-linear-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-2.5 px-4 rounded-xl font-medium shadow-lg shadow-red-900/30 transition flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {signingIn ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Anmeldung\u2026
                </>
              ) : (
                <>
                  <LogIn size={16} /> Anmelden
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setMode("reset")}
              className="w-full text-xs text-gray-400 hover:text-white transition mt-2"
              data-testid="login-forgot"
            >
              Passwort vergessen?
            </button>
          </form>
        ) : (
          <form action={resetDispatch} className="space-y-4">
            <p className="text-sm text-gray-400">
              Wir senden dir einen Link zum Zur\u00fccksetzen deines Passworts.
            </p>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-800 border border-gray-700 text-white rounded-xl focus:ring-2 focus:ring-red-500 transition"
                />
              </div>
            </div>

            {resetState && !resetState.ok && (
              <div className="text-sm text-red-400 bg-red-950/40 border border-red-900/60 rounded-lg px-3 py-2">
                {resetState.error}
              </div>
            )}
            {resetState && resetState.ok && (
              <div className="text-sm text-green-400 bg-green-950/40 border border-green-900/60 rounded-lg px-3 py-2">
                Email gesendet \u2014 bitte Posteingang pr\u00fcfen.
              </div>
            )}

            <button
              type="submit"
              disabled={resetting}
              className="w-full bg-gray-800 hover:bg-gray-700 text-white py-2.5 px-4 rounded-xl font-medium transition disabled:opacity-60"
            >
              {resetting ? "Sende\u2026" : "Reset-Email senden"}
            </button>
            <button
              type="button"
              onClick={() => setMode("signin")}
              className="w-full text-xs text-gray-400 hover:text-white transition"
            >
              Zur\u00fcck zur Anmeldung
            </button>
          </form>
        )}

        <div className="mt-8 pt-6 border-t border-gray-800 text-center text-xs text-gray-500">
          Demo:&nbsp;
          <code className="text-gray-400">waleri.moretz@wamocon.com</code> / <code className="text-gray-400">Demo1234!</code>
          <div className="mt-2">
            <Link href="/legal/imprint" className="hover:text-gray-300">Impressum</Link>
            <span className="mx-2">\u00b7</span>
            <Link href="/legal/privacy" className="hover:text-gray-300">Datenschutz</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
