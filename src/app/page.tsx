"use client";

import { useAppState } from "@/lib/app-state";
import { useI18n } from "@/lib/i18n";
import { LoginScreen } from "@/components/login";
import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";
import { DashboardView } from "@/components/modules/dashboard";
import { ConsultantView } from "@/components/modules/consultant";
import { ProjectsView } from "@/components/modules/projects";
import { MentorView } from "@/components/modules/mentor";
import { OrganizationView } from "@/components/modules/organization";
import { AdminView } from "@/components/modules/admin";
import { ApprovalsView } from "@/components/modules/approvals";
import { NotesView } from "@/components/modules/notes";
import { AcademyView } from "@/components/modules/academy";
import { MiscView } from "@/components/modules/misc";
import type { TranslationKey } from "@/lib/i18n";

const MODULE_TITLE_KEYS: Record<string, TranslationKey> = {
  home: "module.home",
  consultant: "module.consultant",
  projekte: "module.projekte",
  mentor: "module.mentor",
  organisation: "module.organisation",
  admin: "module.admin",
  approvals: "module.approvals",
  rbac: "module.rbac",
  notizen: "module.notizen",
  academy: "module.academy",
  sonstiges: "module.sonstiges",
};

function ModuleRouter() {
  const { module } = useAppState();
  switch (module) {
    case "home":
      return <DashboardView />;
    case "consultant":
      return <ConsultantView />;
    case "projekte":
      return <ProjectsView />;
    case "mentor":
      return <MentorView />;
    case "organisation":
      return <OrganizationView />;
    case "admin":
    case "rbac":
      return <AdminView />;
    case "approvals":
      return <ApprovalsView />;
    case "notizen":
      return <NotesView />;
    case "academy":
      return <AcademyView />;
    case "sonstiges":
      return <MiscView />;
    default:
      return <DashboardView />;
  }
}

export default function Home() {
  const { isLoggedIn, module, sidebarOpen, dataLoading, dataError } = useAppState();
  const { t } = useI18n();

  if (dataLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-950">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-gray-600 border-t-white" />
          <p className="text-sm text-gray-400">{t("app.loading")}</p>
        </div>
      </div>
    );
  }

  if (dataError) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-950">
        <div className="max-w-md rounded-lg bg-red-950/50 p-6 text-center">
          <p className="mb-2 text-lg font-semibold text-red-400">{t("app.connectionError")}</p>
          <p className="text-sm text-red-300">{dataError}</p>
          <p className="mt-4 text-xs text-gray-500">
            {t("app.supabaseHint")} <code className="text-gray-400">npx supabase start</code>
          </p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) return <LoginScreen />;

  const titleKey = MODULE_TITLE_KEYS[module];

  return (
    <div className="flex h-screen overflow-hidden bg-gray-950">
      <Sidebar />
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-16"}`}>
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6">
          <h1 className="text-2xl font-bold text-white mb-6">
            {titleKey ? t(titleKey) : module}
          </h1>
          <ModuleRouter />
        </main>
      </div>
    </div>
  );
}
