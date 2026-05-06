"use client";

import { Briefcase, Plus, Search, ExternalLink, Users, Trash2, Edit } from "lucide-react";
import { useState, useMemo } from "react";
import { useAppState } from "@/lib/app-state";
import { useI18n } from "@/lib/i18n";
import type { Project } from "@/types/domain";
import { Badge, Button, Input, Textarea, Modal } from "@/components/ui";
import { WamoconAppsView } from "@/components/modules/wamocon-apps";
import {
  createProject as createProjectAction,
  updateProject as updateProjectAction,
  deleteProject as deleteProjectAction,
  updateProjectMembers,
} from "@/lib/actions";

export function ProjectsView() {
  const { activeUser, userPermissions, allProjects, users, refreshData } = useAppState();
  const { t } = useI18n();
  const canCreate = userPermissions.canViewAllProjects;
  const canEdit = userPermissions.canViewAllProjects;
  const canDelete = userPermissions.canManageSystem === true;

  const [tab, setTab] = useState<"projects" | "wamocon">("projects");
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [form, setForm] = useState({ name: "", description: "", jiraUrl: "", targetDate: "" });

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return allProjects.filter(
      (p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q),
    );
  }, [allProjects, search]);

  const openCreate = () => {
    setForm({ name: "", description: "", jiraUrl: "", targetDate: "" });
    setShowCreate(true);
  };

  const openEdit = (p: Project) => {
    setForm({ name: p.name, description: p.description, jiraUrl: p.jiraUrl, targetDate: p.targetDate });
    setEditingProject(p);
  };

  const saveProject = async () => {
    try {
      if (editingProject) {
        await updateProjectAction(editingProject.id, { name: form.name, description: form.description, jiraUrl: form.jiraUrl, targetDate: form.targetDate });
        setEditingProject(null);
      } else {
        await createProjectAction({ name: form.name, ownerUserId: activeUser.id, description: form.description, targetDate: form.targetDate, jiraUrl: form.jiraUrl, createdBy: activeUser.id, members: [{ userId: activeUser.id, roleLabel: "Lead" }] });
        setShowCreate(false);
      }
      await refreshData();
    } catch (err) {
      console.error("Failed to save project:", err);
    }
  };

  const deleteProject = async (id: string) => {
    try {
      await deleteProjectAction(id);
      await refreshData();
    } catch (err) {
      console.error("Failed to delete project:", err);
    }
  };

  const addMember = async (projectId: string, userId: string) => {
    const project = allProjects.find((p) => p.id === projectId);
    if (!project || !("members" in project) || project.members.some((m) => m.userId === userId)) return;
    try {
      await updateProjectMembers(projectId, [...project.members, { userId, roleLabel: "Mitglied" }]);
      await refreshData();
    } catch (err) {
      console.error("Failed to add member:", err);
    }
  };

  const removeMember = async (projectId: string, userId: string) => {
    const project = allProjects.find((p) => p.id === projectId);
    if (!project || !("members" in project)) return;
    try {
      await updateProjectMembers(projectId, project.members.filter((m) => m.userId !== userId));
      await refreshData();
    } catch (err) {
      console.error("Failed to remove member:", err);
    }
  };

  const isProject = (p: typeof allProjects[number]): p is Project => "members" in p;

  return (
    <div className="space-y-4">
      {/* Tab Bar */}
      <div className="flex gap-1 border-b border-gray-700 mb-2">
        <button
          onClick={() => setTab("projects")}
          className={`px-4 py-2 text-sm font-medium rounded-t-lg transition ${
            tab === "projects"
              ? "bg-gray-800 text-white border border-gray-700 border-b-transparent -mb-px"
              : "text-gray-400 hover:text-white"
          }`}
        >
          {t("projects.tab.projects")}
        </button>
        <button
          onClick={() => setTab("wamocon")}
          data-testid="projects-tab-wamocon"
          className={`px-4 py-2 text-sm font-medium rounded-t-lg transition ${
            tab === "wamocon"
              ? "bg-gray-800 text-white border border-gray-700 border-b-transparent -mb-px"
              : "text-gray-400 hover:text-white"
          }`}
        >
          {t("projects.tab.wamocon")}
        </button>
      </div>

      {tab === "wamocon" ? (
        <WamoconAppsView />
      ) : (
      <>
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input className="pl-9" placeholder={t("projects.search")} value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        {canCreate && <Button onClick={openCreate} data-testid="projects-new"><Plus size={14} /> {t("projects.newProject")}</Button>}
      </div>

      {filtered.length === 0 && <div className="text-sm text-gray-300 mt-6">{t("projects.noResults")}</div>}

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((p) => (
          <div key={p.id} data-testid={`project-card-${p.id}`} className="p-4 bg-gray-800/50 border border-gray-700 rounded-2xl space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="font-semibold text-white text-lg flex items-center gap-2"><Briefcase size={16} /> {p.name}</div>
                {"status" in p && <div className="text-xs text-gray-400">{p.status}</div>}
              </div>
              {isProject(p) && (
                <div className="flex gap-1 shrink-0">
                  {canEdit && <button onClick={() => openEdit(p)} data-testid={`project-edit-${p.id}`} className="p-1.5 text-gray-300 hover:text-white rounded-lg hover:bg-gray-700 transition"><Edit size={14} /></button>}
                  {canDelete && <button onClick={() => deleteProject(p.id)} data-testid={`project-delete-${p.id}`} className="p-1.5 text-red-400 hover:text-red-300 rounded-lg hover:bg-gray-700 transition"><Trash2 size={14} /></button>}
                </div>
              )}
            </div>
            <div className="text-sm text-gray-300">{p.description}</div>
            {isProject(p) && p.jiraUrl && (
              <a href={p.jiraUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:underline flex items-center gap-1">
                <ExternalLink size={12} /> Jira
              </a>
            )}
            {isProject(p) && (
              <div>
                <div className="text-xs text-gray-400 flex items-center gap-1 mb-1"><Users size={12} /> {t("projects.members")} ({p.members.length})</div>
                <div className="flex flex-wrap gap-1">
                  {p.members.map((m) => (
                    <Badge key={m.userId} color="gray">
                      {users.find((u) => u.id === m.userId)?.name ?? m.userId} ({m.roleLabel})
                      {canEdit && (
                        <button onClick={() => removeMember(p.id, m.userId)} className="ml-1 text-red-400 hover:text-red-300">&times;</button>
                      )}
                    </Badge>
                  ))}
                </div>
                {canEdit && (
                  <select
                    className="mt-2 bg-gray-900 border border-gray-600 text-sm text-white rounded-lg px-2 py-1 w-full"
                    defaultValue=""
                    onChange={(e) => { if (e.target.value) addMember(p.id, e.target.value); e.target.value = ""; }}
                  >
                    <option value="" disabled>{t("projects.addMember")}</option>
                    {users.filter((u) => !p.members.some((m) => m.userId === u.id)).map((u) => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Create / Edit Modal */}
      {(showCreate || editingProject) && (
        <Modal open={true} title={editingProject ? t("projects.edit") : t("projects.create")} onClose={() => { setShowCreate(false); setEditingProject(null); }}>
          <div className="grid gap-3">
            <Input placeholder={t("projects.name")} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} data-testid="project-name" />
            <Textarea placeholder={t("projects.description")} rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} data-testid="project-description" />
            <Input placeholder={t("projects.jiraUrl")} value={form.jiraUrl} onChange={(e) => setForm((f) => ({ ...f, jiraUrl: e.target.value }))} />
            <Input type="date" placeholder={t("projects.targetDate")} value={form.targetDate} onChange={(e) => setForm((f) => ({ ...f, targetDate: e.target.value }))} />
            <Button onClick={saveProject} data-testid="project-submit">{t("projects.save")}</Button>
          </div>
        </Modal>
      )}
      </>
      )}
    </div>
  );
}
