"use client";

import { useState } from "react";
import { User, LogIn } from "lucide-react";
import { useAppState } from "@/lib/app-state";
import { useI18n } from "@/lib/i18n";
import type { User as UserType } from "@/types/domain";

export function LoginScreen() {
  const { users, login } = useAppState();
  const { t } = useI18n();
  const [selectedUserId, setSelectedUserId] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = () => {
    if (!selectedUserId) return;
    setIsLoading(true);
    // Simulate login delay (will be replaced by Supabase Auth in Phase 2)
    setTimeout(() => {
      login(selectedUserId);
      setIsLoading(false);
    }, 600);
  };

  return (
    <div className="h-screen w-screen bg-linear-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl shadow-2xl p-8 w-full max-w-md border border-gray-700">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">R</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">RELDA</h1>
          <p className="text-gray-400">{t("app.tagline")}</p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <User size={16} className="inline mr-2" />
              {t("login.selectUser")}
            </label>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full px-4 py-3 border border-gray-600 bg-gray-800 text-white rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
            >
              <option value="">{t("login.chooseUser")}</option>
              {users.map((user: UserType) => (
                <option key={user.id} value={user.id}>
                  {user.name} – {user.roles[0]}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleLogin}
            disabled={!selectedUserId || isLoading}
            className="w-full bg-linear-to-r from-red-600 to-red-700 text-white py-3 px-4 rounded-xl font-medium hover:from-red-700 hover:to-red-800 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2 shadow-lg"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {t("login.loggingIn")}
              </>
            ) : (
              <>
                <LogIn size={16} />
                {t("login.button")}
              </>
            )}
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-700">
          <div className="text-xs text-gray-400 text-center">
            <p className="mb-2">{t("login.demoUsers")}</p>
            <div className="space-y-1">
              {users.map((user: UserType) => (
                <div key={user.id} className="flex justify-between">
                  <span>{user.name}</span>
                  <span className="text-gray-400">{user.roles[0]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
