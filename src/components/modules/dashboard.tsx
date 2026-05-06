"use client";

import {
  Briefcase,
  Target,
  StickyNote,
  Clock,
  ClipboardCheck,
  Users as UsersIcon,
  Shield,
  Settings,
  User,
} from "lucide-react";
import { useMemo } from "react";
import { useAppState } from "@/lib/app-state";
import { formatLevel, canAccessModule } from "@/lib/data";
import { Tile } from "@/components/ui";

export function DashboardView() {
  const {
    activeUser,
    allProjects,
    goals,
    notes,
    timesheets,
    myMentorTasks,
    myMentees,
    isAdmin,
    isMentor,
    isMentee,
    setModule,
    users,
  } = useAppState();

  // Derive recent activity from real data
  const recentActivity = useMemo(() => {
    const items: { action: string; detail: string; time: number; dot: string }[] = [];

    for (const n of notes.filter((n) => n.ownerUserId === activeUser.id).slice(0, 3)) {
      items.push({ action: "Note created", detail: n.body.slice(0, 50), time: n.createdAt, dot: "bg-blue-400" });
    }
    for (const g of goals.filter((g) => g.ownerUserId === activeUser.id).slice(0, 3)) {
      items.push({ action: `Goal: ${g.title}`, detail: g.status, time: g.createdAt, dot: "bg-green-400" });
    }
    for (const t of timesheets.filter((t) => t.userId === activeUser.id).slice(0, 3)) {
      items.push({ action: `Timesheet: ${t.hours}h`, detail: t.description, time: t.createdAt, dot: "bg-yellow-400" });
    }

    return items.sort((a, b) => b.time - a.time).slice(0, 5);
  }, [notes, goals, timesheets, activeUser.id]);

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <div className="bg-linear-to-r from-gray-900 to-gray-800 rounded-2xl p-6 border border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Welcome back, {activeUser.name}!
              {isAdmin && <span className="text-red-400 ml-2">(Admin)</span>}
              {isMentor && !isAdmin && <span className="text-blue-400 ml-2">(Mentor)</span>}
              {isMentee && <span className="text-green-400 ml-2">(Mentee)</span>}
            </h1>
            <p className="text-gray-400">
              {isAdmin && "System administration and user management dashboard"}
              {isMentor && !isAdmin && "Mentor dashboard — guide your mentees' development"}
              {isMentee && !isMentor && !isAdmin && "Your personal development workspace"}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm text-gray-400">Current Level</div>
              <div className="text-xl font-bold text-red-400">{formatLevel(activeUser.level)}</div>
              <div className="text-xs text-gray-300 mt-1">
                {activeUser.roles.map((role) => (
                  <span key={role} className="inline-block bg-gray-700 text-gray-300 px-2 py-1 rounded text-xs mr-1">
                    {role}
                  </span>
                ))}
              </div>
            </div>
            <div className="w-16 h-16 bg-linear-to-r from-red-600 to-red-700 rounded-2xl flex items-center justify-center">
              <span className="text-white font-bold text-2xl">{activeUser.name.charAt(0)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard icon={Briefcase} label="Projects" value={allProjects.length} color="blue" />
        {isMentee && (
          <StatCard icon={ClipboardCheck} label="Mentor Tasks" value={myMentorTasks.length} color="orange" />
        )}
        {isMentor && (
          <StatCard icon={UsersIcon} label="Mentees" value={myMentees.length} color="purple" />
        )}
        <StatCard icon={Target} label="Goals" value={goals.filter((g) => g.ownerUserId === activeUser.id).length} color="green" />
        <StatCard icon={StickyNote} label="Notes" value={notes.filter((n) => n.ownerUserId === activeUser.id && n.scope === "GENERAL").length} color="yellow" />
        {isAdmin && (
          <StatCard icon={Shield} label="Total Users" value={users.length} color="red" />
        )}
      </div>

      {/* Nav tiles */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Tile icon={User} title="Consultant" subtitle="Profil, Projekte, Ziele" onClick={() => setModule("consultant")} />
        <Tile icon={Briefcase} title="Projekte" subtitle={`${allProjects.length} Projekte`} onClick={() => setModule("projekte")} />
        {canAccessModule(activeUser, "mentor") && (
          <Tile icon={UsersIcon} title="Mentor" subtitle={`${myMentees.length} Mentees`} onClick={() => setModule("mentor")} />
        )}
        <Tile icon={StickyNote} title="Notizen" subtitle={`${notes.filter((n) => n.ownerUserId === activeUser.id && n.scope === "GENERAL").length} persönliche Notizen`} onClick={() => setModule("notizen")} />
        {canAccessModule(activeUser, "admin") && (
          <Tile icon={Settings} title="Admin/Settings" subtitle="System-Verwaltung" onClick={() => setModule("admin")} />
        )}
      </div>

      {/* Activity */}
      <div className="bg-gray-900 rounded-2xl p-6 border border-gray-700">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-900 rounded-lg">
            <Clock size={20} className="text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
        </div>
        <div className="space-y-3">
          {recentActivity.length === 0 && (
            <div className="text-sm text-gray-400 text-center py-4">No recent activity.</div>
          )}
          {recentActivity.map((a, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-gray-800 rounded-xl">
              <div className={`w-2 h-2 rounded-full ${a.dot}`} />
              <div className="flex-1">
                <div className="text-sm text-gray-200">{a.action}</div>
                <div className="text-xs text-gray-400">{a.detail}</div>
              </div>
              <div className="text-xs text-gray-300">{new Date(a.time).toLocaleDateString("de-DE")}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: number;
  color: string;
}) {
  const colors: Record<string, string> = {
    blue: "bg-blue-900 text-blue-400",
    orange: "bg-orange-900 text-orange-400",
    purple: "bg-purple-900 text-purple-400",
    green: "bg-green-900 text-green-400",
    yellow: "bg-yellow-900 text-yellow-400",
    red: "bg-red-900 text-red-400",
  };
  return (
    <div className="bg-gray-900 p-4 rounded-xl border border-gray-700 hover:border-red-500/50 transition-colors">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${colors[color] ?? colors.blue}`}>
          <Icon size={20} />
        </div>
        <div>
          <div className="text-2xl font-bold text-white">{value}</div>
          <div className="text-sm text-gray-400">{label}</div>
        </div>
      </div>
    </div>
  );
}
