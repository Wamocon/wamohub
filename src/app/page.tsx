"use client";

import { useAppState } from "@/lib/app-state";
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

const MODULE_TITLES: Record<string, string> = {
  home: "Dashboard",
  consultant: "Mein Bereich",
  projekte: "Projekte",
  mentor: "Mentoring",
  organisation: "Organisation",
  admin: "Administration",
  approvals: "Genehmigungen",
  rbac: "Administration",
  notizen: "Notizen",
  academy: "Academy",
  sonstiges: "Sonstiges",
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
  const { isLoggedIn, module, sidebarOpen } = useAppState();

  if (!isLoggedIn) return <LoginScreen />;

  return (
    <div className="flex h-screen overflow-hidden bg-gray-950">
      <Sidebar />
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-16"}`}>
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6">
          <h1 className="text-2xl font-bold text-white mb-6">
            {MODULE_TITLES[module] ?? module}
          </h1>
          <ModuleRouter />
        </main>
      </div>
    </div>
  );
}
