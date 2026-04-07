"use client";

import { Users, Link2, ClipboardList, Plus, Trash2, UserPlus } from "lucide-react";
import { useState } from "react";
import { useAppState } from "@/lib/app-state";
import { shortId, formatLevel, LEVELS } from "@/lib/data";
import type { User, RoleName, Level } from "@/types/domain";
import { Badge, Button, Input, SectionCard, Modal } from "@/components/ui";

type AdminTab = "users" | "mentors" | "links" | "checklist";

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
      <div className="flex gap-2 border-b border-gray-700 pb-2">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`flex items-center gap-2 px-4 py-2 rounded-t-xl text-sm font-medium transition ${tab === t.key ? "bg-gray-800 text-white border-b-2 border-red-500" : "text-gray-400 hover:text-white"}`}>
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

/* ═══ User Management ═══ */
function UserManagement() {
  const { users, setUsers } = useAppState();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", role: "Mentee" as RoleName, level: LEVELS[2] as Level });

  const ROLES: RoleName[] = ["Mentee", "Mentor", "Admin"];

  const addUser = () => {
    if (!form.name.trim() || !form.email.trim()) return;
    const u: User = { id: shortId(), name: form.name, email: form.email, level: form.level, roles: [form.role], cvFileUrl: "" };
    setUsers((prev) => [...prev, u]);
    setShowCreate(false);
  };

  const updateRole = (id: string, role: RoleName) => setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, roles: [role] } : u)));
  const updateLevel = (id: string, level: Level) => setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, level } : u)));
  const deleteUser = (id: string) => setUsers((prev) => prev.filter((u) => u.id !== id));

  return (
    <SectionCard title="Benutzerverwaltung" icon={Users} actions={<Button onClick={() => setShowCreate(true)}><Plus size={14} /> Neuer Benutzer</Button>}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-gray-400 border-b border-gray-700">
            <tr><th className="p-2">Name</th><th className="p-2">E-Mail</th><th className="p-2">Rolle</th><th className="p-2">Stufe</th><th className="p-2" /></tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-gray-800 text-white">
                <td className="p-2 font-medium">{u.name}</td>
                <td className="p-2 text-gray-300">{u.email}</td>
                <td className="p-2">
                  <select className="bg-gray-900 border border-gray-600 text-white rounded px-2 py-1 text-xs" value={u.roles[0]} onChange={(e) => updateRole(u.id, e.target.value as RoleName)}>
                    {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </td>
                <td className="p-2">
                  <select className="bg-gray-900 border border-gray-600 text-white rounded px-2 py-1 text-xs" value={u.level} onChange={(e) => updateLevel(u.id, e.target.value as Level)}>
                    {LEVELS.map((l) => <option key={l} value={l}>{formatLevel(l)}</option>)}
                  </select>
                </td>
                <td className="p-2"><button onClick={() => deleteUser(u.id)} className="text-red-400 hover:text-red-300"><Trash2 size={14} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showCreate && (
        <Modal open={true} title="Neuer Benutzer" onClose={() => setShowCreate(false)}>
          <div className="grid gap-3">
            <Input placeholder="Name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            <Input placeholder="E-Mail" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
            <select className="bg-gray-900 border border-gray-600 text-white rounded-lg px-3 py-2" value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as RoleName }))}>
              {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
            <select className="bg-gray-900 border border-gray-600 text-white rounded-lg px-3 py-2" value={form.level} onChange={(e) => setForm((f) => ({ ...f, level: e.target.value as Level }))}>
              {LEVELS.map((l) => <option key={l} value={l}>{formatLevel(l)}</option>)}
            </select>
            <Button onClick={addUser}>Erstellen</Button>
          </div>
        </Modal>
      )}
    </SectionCard>
  );
}

/* ═══ Mentor Assignment ═══ */
function MentorAssignment() {
  const { users, mentorRelations, setMentorRelations } = useAppState();

  const assignMentor = (menteeId: string, mentorId: string | null) => {
    setMentorRelations((prev) => {
      const without = prev.map((r) => (r.menteeUserId === menteeId ? { ...r, active: false } : r));
      if (!mentorId) return without;
      return [...without, { mentorUserId: mentorId, menteeUserId: menteeId, since: Date.now(), active: true }];
    });
  };

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
            <tr><th className="p-2">Berater</th><th className="p-2">Stufe</th><th className="p-2">Mentor</th></tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-gray-800 text-white">
                <td className="p-2 font-medium">{u.name}</td>
                <td className="p-2"><Badge>{formatLevel(u.level)}</Badge></td>
                <td className="p-2">
                  <select
                    className="bg-gray-900 border border-gray-600 text-white rounded px-2 py-1 text-xs w-full"
                    value={getMentor(u.id)}
                    onChange={(e) => assignMentor(u.id, e.target.value || null)}
                  >
                    <option value="">— kein Mentor —</option>
                    {mentors.filter((m) => m.id !== u.id).map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
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

/* ═══ Link Management ═══ */
function LinkManagement() {
  const { links, setLinks } = useAppState();
  const [form, setForm] = useState({ label: "", url: "", key: "" });

  const linkList = Object.values(links);

  const addLink = () => {
    if (!form.label.trim() || !form.url.trim()) return;
    const key = form.key.trim().toUpperCase() || form.label.toUpperCase().replace(/\s/g, "_");
    setLinks((prev) => ({ ...prev, [key]: { key, url: form.url, label: form.label } }));
    setForm({ label: "", url: "", key: "" });
  };

  const deleteLink = (key: string) => setLinks((prev) => {
    const next = { ...prev };
    delete next[key];
    return next;
  });

  return (
    <SectionCard title="Default Links" icon={Link2} actions={<Button onClick={addLink}><Plus size={14} /> Link</Button>}>
      <div className="grid sm:grid-cols-3 gap-2 mb-4">
        <Input placeholder="Label" value={form.label} onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))} />
        <Input placeholder="URL" value={form.url} onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))} />
        <Input placeholder="Key (optional)" value={form.key} onChange={(e) => setForm((f) => ({ ...f, key: e.target.value }))} />
      </div>
      <div className="space-y-2">
        {linkList.map((l) => (
          <div key={l.key} className="flex items-center justify-between p-2 bg-gray-800/50 rounded-lg border border-gray-700">
            <div className="text-sm"><span className="text-white font-medium">{l.label}</span> <span className="text-gray-400">({l.key})</span></div>
            <div className="flex items-center gap-2">
              <a href={l.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 text-xs hover:underline">{l.url}</a>
              <button onClick={() => deleteLink(l.key)} className="text-red-400 hover:text-red-300"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

/* ═══ Checklist Template ═══ */
function ChecklistManagement() {
  const { checklistTemplate } = useAppState();

  return (
    <SectionCard title="Assessment-Checkliste" icon={ClipboardList}>
      <div className="text-sm text-gray-300 space-y-2">
        <div>Von: <Badge>{formatLevel(checklistTemplate.fromLevel)}</Badge> → Nach: <Badge>{formatLevel(checklistTemplate.toLevel)}</Badge></div>
        <div className="font-medium text-white mt-3 mb-1">Kriterien:</div>
        <ul className="list-disc list-inside text-gray-300">
          {checklistTemplate.items.map((item) => <li key={item.id}>{item.label} — {item.description}</li>)}
        </ul>
      </div>
    </SectionCard>
  );
}
