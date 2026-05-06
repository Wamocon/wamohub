"use client";

import { Users, Link2, ClipboardList, Plus, Trash2, UserPlus, UserCheck, UserX } from "lucide-react";
import { useState, useTransition } from "react";
import { useAppState } from "@/lib/app-state";
import { formatLevel, LEVELS } from "@/lib/data";
import type { RoleName, Level } from "@/types/domain";
import { Badge, Button, Input, SectionCard, Modal } from "@/components/ui";
import { useToast } from "@/components/ui/toast";
import { inviteUserAction, setUserActiveAction } from "@/lib/auth/actions";
import {
  updateUser,
  createMentorRelation,
  updateMentorRelation,
  createExternalLink,
  updateExternalLink,
  deleteExternalLink,
} from "@/lib/actions";

type AdminTab = "users" | "mentors" | "links" | "checklist";

const ROLES: RoleName[] = ["Mentee", "Mentor", "Admin"];

export function AdminView() {
  const [tab, setTab] = useState<AdminTab>("users");

  const tabs: { key: AdminTab; label: string; icon: typeof Users }[] = [
    { key: "users", label: "Benutzer", icon: Users },
    { key: "mentors", label: "Mentoren", icon: UserPlus },
    { key: "links", label: "Links", icon: Link2 },
    { key: "checklist", label: "Checklist-Vorlage", icon: ClipboardList },
  ];

  return (
    <div className="space-y-4">
      <div className="flex gap-2 border-b border-gray-700 pb-2 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            data-testid={`admin-tab-${t.key}`}
            className={`flex items-center gap-2 px-4 py-2 rounded-t-xl text-sm font-medium transition shrink-0 ${
              tab === t.key
                ? "bg-gray-800 text-white border-b-2 border-red-500"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <t.icon size={14} /> {t.label}
          </button>
        ))}
      </div>
      {tab === "users" && <UserManagement />}
      {tab === "mentors" && <MentorAssignment />}
      {tab === "links" && <LinkManagement />}
      {tab === "checklist" && <ChecklistManagement />}
    </div>
  );
}

function UserManagement() {
  const { users, refreshData } = useAppState();
  const toast = useToast();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "Mentee" as RoleName,
    level: LEVELS[2] as Level,
  });
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const inviteUser = () => {
    if (!form.name.trim() || !form.email.trim()) return;
    setError(null);
    startTransition(async () => {
      const res = await inviteUserAction({
        name: form.name.trim(),
        email: form.email.trim(),
        level: form.level,
        roles: [form.role],
      });
      if (!res.ok) {
        setError(res.error);
        toast.show(res.error, "error");
        return;
      }
      toast.show(`Einladung gesendet an ${form.email}`, "success");
      setForm({ name: "", email: "", role: "Mentee", level: LEVELS[2] });
      setShowCreate(false);
      await refreshData();
    });
  };

  const toggleActive = (id: string, isActive: boolean) =>
    startTransition(async () => {
      const res = await setUserActiveAction(id, isActive);
      if (!res.ok) {
        toast.show(res.error, "error");
        return;
      }
      toast.show(isActive ? "User aktiviert" : "User deaktiviert", "success");
      await refreshData();
    });

  const changeRole = (id: string, role: RoleName) =>
    startTransition(async () => {
      await updateUser(id, { roles: [role] });
      await refreshData();
    });

  const changeLevel = (id: string, level: Level) =>
    startTransition(async () => {
      await updateUser(id, { level });
      await refreshData();
    });

  return (
    <SectionCard
      title="Benutzerverwaltung"
      icon={Users}
      actions={
        <Button onClick={() => setShowCreate(true)} data-testid="admin-user-new">
          <UserPlus size={14} /> User einladen
        </Button>
      }
    >
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-gray-400 border-b border-gray-700">
            <tr>
              <th className="p-2">Name</th>
              <th className="p-2">E-Mail</th>
              <th className="p-2">Rolle</th>
              <th className="p-2">Stufe</th>
              <th className="p-2" />
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr
                key={u.id}
                className="border-b border-gray-800 text-white"
                data-testid={`admin-user-row-${u.email}`}
              >
                <td className="p-2 font-medium">{u.name}</td>
                <td className="p-2 text-gray-300">{u.email}</td>
                <td className="p-2">
                  <select
                    className="bg-gray-900 border border-gray-600 text-white rounded px-2 py-1 text-xs"
                    value={u.roles[0]}
                    onChange={(e) => changeRole(u.id, e.target.value as RoleName)}
                    disabled={pending}
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="p-2">
                  <select
                    className="bg-gray-900 border border-gray-600 text-white rounded px-2 py-1 text-xs"
                    value={u.level}
                    onChange={(e) => changeLevel(u.id, e.target.value as Level)}
                    disabled={pending}
                  >
                    {LEVELS.map((l) => (
                      <option key={l} value={l}>
                        {formatLevel(l)}
                      </option>
                    ))}
                  </select>
                </td>
                <td
                  className="p-2"
                >
                  {u.isActive ? (
                    <button
                      onClick={() => toggleActive(u.id, false)}
                      disabled={pending}
                      title="Deaktivieren (Soft-Delete)"
                      data-testid={`admin-user-deactivate-${u.email}`}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs text-yellow-300 hover:bg-yellow-950/40 disabled:opacity-50"
                    >
                      <UserX size={14} /> Deaktivieren
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Badge color="bg-yellow-900 text-yellow-200">inaktiv</Badge>
                      <button
                        onClick={() => toggleActive(u.id, true)}
                        disabled={pending}
                        title="Reaktivieren"
                        data-testid={`admin-user-reactivate-${u.email}`}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs text-green-300 hover:bg-green-950/40 disabled:opacity-50"
                      >
                        <UserCheck size={14} /> Aktivieren
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showCreate && (
        <Modal open={true} title="User einladen" onClose={() => setShowCreate(false)}>
          <div className="grid gap-3">
            <p className="text-xs text-gray-400">
              Der Eingeladene erhält eine Email mit einem Link, um sein Passwort zu setzen.
            </p>
            <Input
              placeholder="Name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              data-testid="admin-user-name"
            />
            <Input
              placeholder="E-Mail"
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              data-testid="admin-user-email"
            />
            <select
              className="bg-gray-900 border border-gray-600 text-white rounded-lg px-3 py-2"
              value={form.role}
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as RoleName }))}
              data-testid="admin-user-role"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            <select
              className="bg-gray-900 border border-gray-600 text-white rounded-lg px-3 py-2"
              value={form.level}
              onChange={(e) => setForm((f) => ({ ...f, level: e.target.value as Level }))}
              data-testid="admin-user-level"
            >
              {LEVELS.map((l) => (
                <option key={l} value={l}>
                  {formatLevel(l)}
                </option>
              ))}
            </select>
            {error && <div className="text-xs text-red-400">{error}</div>}
            <Button onClick={inviteUser} disabled={pending} data-testid="admin-user-submit">
              {pending ? "Sende…" : "Einladung senden"}
            </Button>
          </div>
        </Modal>
      )}
    </SectionCard>
  );
}

function MentorAssignment() {
  const { users, mentorRelations, refreshData } = useAppState();
  const [pending, startTransition] = useTransition();

  const assignMentor = (menteeId: string, mentorId: string | null) =>
    startTransition(async () => {
      const existing = mentorRelations.filter(
        (r) => r.menteeUserId === menteeId && r.active,
      );
      for (const rel of existing) {
        await updateMentorRelation(rel.mentorUserId, menteeId, false);
      }
      if (mentorId) {
        const previous = mentorRelations.find(
          (r) => r.menteeUserId === menteeId && r.mentorUserId === mentorId,
        );
        if (previous) {
          await updateMentorRelation(mentorId, menteeId, true);
        } else {
          await createMentorRelation({ mentorUserId: mentorId, menteeUserId: menteeId });
        }
      }
      await refreshData();
    });

  const mentors = users.filter((u) => u.roles.includes("Mentor") || u.roles.includes("Admin"));

  const getMentor = (userId: string) => {
    const rel = mentorRelations.find((r) => r.menteeUserId === userId && r.active);
    return rel?.mentorUserId ?? "";
  };

  return (
    <SectionCard title="Mentor-Zuweisungen" icon={UserPlus}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-gray-400 border-b border-gray-700">
            <tr>
              <th className="p-2">Berater</th>
              <th className="p-2">Stufe</th>
              <th className="p-2">Mentor</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-gray-800 text-white">
                <td className="p-2 font-medium">{u.name}</td>
                <td className="p-2">
                  <Badge>{formatLevel(u.level)}</Badge>
                </td>
                <td className="p-2">
                  <select
                    className="bg-gray-900 border border-gray-600 text-white rounded px-2 py-1 text-xs w-full"
                    value={getMentor(u.id)}
                    onChange={(e) => assignMentor(u.id, e.target.value || null)}
                    disabled={pending}
                    data-testid={`admin-mentor-select-${u.email}`}
                  >
                    <option value="">— kein Mentor —</option>
                    {mentors
                      .filter((m) => m.id !== u.id)
                      .map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name}
                        </option>
                      ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
}

function LinkManagement() {
  const { links, refreshData } = useAppState();
  const [form, setForm] = useState({ label: "", url: "", key: "" });
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const linkList = Object.values(links);

  const addLink = () => {
    if (!form.label.trim() || !form.url.trim()) return;
    const key = (form.key.trim() || form.label).toUpperCase().replace(/\s+/g, "_");
    setError(null);
    startTransition(async () => {
      try {
        if (links[key]) {
          await updateExternalLink(key, { url: form.url, label: form.label });
        } else {
          await createExternalLink({ key, url: form.url, label: form.label });
        }
        setForm({ label: "", url: "", key: "" });
        await refreshData();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Fehler beim Speichern");
      }
    });
  };

  const removeLink = (key: string) =>
    startTransition(async () => {
      await deleteExternalLink(key);
      await refreshData();
    });

  return (
    <SectionCard
      title="Default Links"
      icon={Link2}
      actions={
        <Button onClick={addLink} disabled={pending} data-testid="admin-link-submit">
          <Plus size={14} /> Link
        </Button>
      }
    >
      <div className="grid sm:grid-cols-3 gap-2 mb-4">
        <Input
          placeholder="Label"
          value={form.label}
          onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
          data-testid="admin-link-label"
        />
        <Input
          placeholder="URL"
          value={form.url}
          onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
          data-testid="admin-link-url"
        />
        <Input
          placeholder="Key (optional)"
          value={form.key}
          onChange={(e) => setForm((f) => ({ ...f, key: e.target.value }))}
          data-testid="admin-link-key"
        />
      </div>
      {error && <div className="text-xs text-red-400 mb-2">{error}</div>}
      <div className="space-y-2">
        {linkList.map((l) => (
          <div
            key={l.key}
            className="flex items-center justify-between p-2 bg-gray-800/50 rounded-lg border border-gray-700"
            data-testid={`admin-link-row-${l.key}`}
          >
            <div className="text-sm">
              <span className="text-white font-medium">{l.label}</span>{" "}
              <span className="text-gray-400">({l.key})</span>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={l.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 text-xs hover:underline truncate max-w-xs"
              >
                {l.url}
              </a>
              <button
                onClick={() => removeLink(l.key)}
                className="text-red-400 hover:text-red-300"
                disabled={pending}
                aria-label={`Link ${l.key} löschen`}
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

function ChecklistManagement() {
  const { checklistTemplate } = useAppState();

  return (
    <SectionCard title="Assessment-Checkliste" icon={ClipboardList}>
      <div className="text-sm text-gray-300 space-y-2">
        <div>
          Von: <Badge>{formatLevel(checklistTemplate.fromLevel)}</Badge> → Nach:{" "}
          <Badge>{formatLevel(checklistTemplate.toLevel)}</Badge>
        </div>
        <div className="font-medium text-white mt-3 mb-1">Kriterien:</div>
        <ul className="list-disc list-inside text-gray-300">
          {checklistTemplate.items.map((item) => (
            <li key={item.id}>
              {item.label} — {item.description}
            </li>
          ))}
        </ul>
      </div>
    </SectionCard>
  );
}
