"use client";

import {
  Home,
  User,
  Briefcase,
  Users as UsersIcon,
  Building2,
  GraduationCap,
  StickyNote,
  Settings,
  ExternalLink,
  Shield,
  CheckCircle,
  Clock,
  Plus,
} from "lucide-react";
import { cn, canAccessModule } from "@/lib/data";
import { useAppState } from "@/lib/app-state";
import { useI18n } from "@/lib/i18n";
import type { ModuleName } from "@/types/domain";

function SideLink({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: React.ComponentType<{ size?: number }>;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2 rounded-xl mb-1 transition-all duration-300 relative overflow-hidden group",
        active
          ? "bg-linear-to-r from-red-600 to-red-700 text-white shadow-lg"
          : "hover:bg-gray-800 text-gray-300 hover:text-white",
      )}
    >
      <Icon size={18} />
      <span className="truncate relative z-10">{label}</span>
    </button>
  );
}

export function Sidebar() {
  const { module, setModule, setSubModule, activeUser, sidebarOpen, setSidebarOpen } =
    useAppState();
  const { t } = useI18n();

  const nav = (m: ModuleName) => {
    setModule(m);
    setSubModule(null);
  };

  return (
    <div
      className={cn(
        "fixed top-0 left-0 h-full z-30 transition-all border-r border-gray-700 bg-gray-900 flex flex-col",
        sidebarOpen ? "w-64" : "w-16",
      )}
    >
      {/* Header */}
      <div className="h-14 flex items-center gap-2 px-3 bg-linear-to-r from-red-600 to-red-700 shrink-0">
        <button onClick={() => setSidebarOpen((prev) => !prev)} className="flex items-center gap-3 w-full">
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0">
            R
          </div>
          {sidebarOpen && <div className="text-white font-semibold tracking-wide">RELDA</div>}
        </button>
      </div>

      {/* Navigation */}
      <nav className="p-2 text-sm flex-1 overflow-y-auto">
        <SideLink icon={Home} label={t("nav.overview")} active={module === "home"} onClick={() => nav("home")} />
        <SideLink icon={User} label={t("nav.consultant")} active={module === "consultant"} onClick={() => nav("consultant")} />
        <SideLink icon={Building2} label={t("nav.organization")} active={module === "organisation"} onClick={() => nav("organisation")} />
        <SideLink icon={Briefcase} label={t("nav.projects")} active={module === "projekte"} onClick={() => nav("projekte")} />
        {canAccessModule(activeUser, "mentor") && (
          <SideLink icon={UsersIcon} label={t("nav.mentor")} active={module === "mentor"} onClick={() => nav("mentor")} />
        )}
        <SideLink icon={GraduationCap} label={t("nav.academy")} active={module === "academy"} onClick={() => nav("academy")} />
        <SideLink icon={StickyNote} label={t("nav.notes")} active={module === "notizen"} onClick={() => nav("notizen")} />
        <SideLink icon={ExternalLink} label={t("nav.misc")} active={module === "sonstiges"} onClick={() => nav("sonstiges")} />

        {/* Quick Actions */}
        <div className="mt-4 pt-4 border-t border-gray-700">
          <div className="text-xs text-gray-300 mb-2 px-3">{t("nav.quickActions")}</div>
          <button
            onClick={() => nav("projekte")}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl mb-1 text-gray-300 hover:bg-gray-800 hover:text-white transition-all duration-300"
          >
            <Plus size={16} />
            <span className="truncate">{t("nav.newProject")}</span>
          </button>
          <button
            onClick={() => setSubModule("timesheet")}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl mb-1 text-gray-300 hover:bg-gray-800 hover:text-white transition-all duration-300"
          >
            <Clock size={16} />
            <span className="truncate">{t("nav.logTime")}</span>
          </button>
        </div>

        {/* Admin links */}
        {canAccessModule(activeUser, "admin") && (
          <div className="mt-2 pt-2 border-t border-gray-700">
            <SideLink icon={Shield} label={t("nav.usersRoles")} active={module === "rbac"} onClick={() => nav("rbac")} />
            <SideLink icon={CheckCircle} label={t("nav.approvals")} active={module === "approvals"} onClick={() => nav("approvals")} />
            <SideLink icon={Settings} label={t("nav.adminSettings")} active={module === "admin"} onClick={() => nav("admin")} />
          </div>
        )}
      </nav>
    </div>
  );
}
