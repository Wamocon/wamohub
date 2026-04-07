"use client";

import { Search, Bell } from "lucide-react";
import { useState } from "react";
import { Badge, Button } from "@/components/ui";
import { useAppState } from "@/lib/app-state";
import { formatLevel, canAccessModule } from "@/lib/data";

export function Topbar() {
  const { activeUser, users, activeUserId, login, logout } = useAppState();
  const [q, setQ] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    { id: 1, message: "New project assignment: QA Transformation ACME", time: "2m ago" },
    { id: 2, message: "Timesheet approval pending", time: "3h ago" },
  ];

  return (
    <div className="h-16 border-b border-gray-700 bg-gray-900 flex items-center px-4 gap-4 relative">
      <div className="font-semibold text-white text-lg">
        Willkommen, {activeUser.name}
      </div>
      <Badge>{formatLevel(activeUser.level)}</Badge>

      <div className="ml-auto flex items-center gap-3">
        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Global search…"
            className="pl-10 pr-4 py-2 rounded-xl border border-gray-600 bg-gray-800 text-white placeholder-gray-400 text-sm w-64 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
          />
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-gray-400 hover:text-white transition-colors"
          >
            <Bell size={20} />
            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {notifications.length}
              </span>
            )}
          </button>
          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-gray-800 border border-gray-700 rounded-xl shadow-xl z-50">
              <div className="p-4 border-b border-gray-700">
                <h3 className="font-semibold text-white">Notifications</h3>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {notifications.map((n) => (
                  <div key={n.id} className="p-3 border-b border-gray-700 hover:bg-gray-750 transition-colors">
                    <div className="text-sm text-gray-200">{n.message}</div>
                    <div className="text-xs text-gray-400 mt-1">{n.time}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User selector (demo) */}
        <select
          value={activeUserId}
          onChange={(e) => login(e.target.value)}
          className="text-sm border border-gray-600 bg-gray-800 text-white rounded-xl px-3 py-2 focus:ring-2 focus:ring-red-500"
        >
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </select>

        {canAccessModule(activeUser, "admin") && (
          <Button variant="ghost" onClick={() => {}}>
            Admin
          </Button>
        )}
        <Button variant="ghost" onClick={logout} className="text-red-400 hover:text-red-300">
          Logout
        </Button>
      </div>
    </div>
  );
}
