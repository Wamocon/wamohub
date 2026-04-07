"use client";

import { Clock, Plus, Trash2, Plane, UmbrellaOff } from "lucide-react";
import { useState } from "react";
import { useAppState } from "@/lib/app-state";
import { shortId } from "@/lib/data";
import type { Timesheet, VacationRequest, TravelCost } from "@/types/domain";
import { Badge, Button, Input, SectionCard } from "@/components/ui";

type Tab = "timesheet" | "vacation" | "travel";

export function OrganizationView() {

  const [tab, setTab] = useState<Tab>("timesheet");
  const tabs: { key: Tab; label: string; icon: typeof Clock }[] = [
    { key: "timesheet", label: "Zeiterfassung", icon: Clock },
    { key: "vacation", label: "Urlaub", icon: UmbrellaOff },
    { key: "travel", label: "Reisekosten", icon: Plane },
  ];

  return (
    <div className="space-y-4">
      <div className="flex gap-2 border-b border-gray-700 pb-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-t-xl text-sm font-medium transition ${
              tab === t.key ? "bg-gray-800 text-white border-b-2 border-red-500" : "text-gray-400 hover:text-white"
            }`}
          >
            <t.icon size={14} /> {t.label}
          </button>
        ))}
      </div>

      {tab === "timesheet" && <TimesheetTab />}
      {tab === "vacation" && <VacationTab />}
      {tab === "travel" && <TravelTab />}
    </div>
  );
}

/* ═══ Timesheet Tab ═══ */
function TimesheetTab() {
  const { activeUser, timesheets, setTimesheets, projects } = useAppState();
  const myEntries = timesheets.filter((e) => e.userId === activeUser.id);

  const [form, setForm] = useState({ date: "", projectId: "", hours: "", description: "", taskType: "Testing" as Timesheet["taskType"] });

  const addEntry = () => {
    if (!form.date || !form.projectId || !form.hours) return;
    const entry: Timesheet = {
      id: shortId(),
      userId: activeUser.id,
      projectId: form.projectId,
      date: form.date,
      hours: parseFloat(form.hours),
      description: form.description,
      taskType: form.taskType,
      status: "DRAFT",
      submittedAt: null,
      reviewedBy: null,
      reviewedAt: null,
      createdAt: Date.now(),
    };
    setTimesheets((prev) => [...prev, entry]);
    setForm({ date: "", projectId: "", hours: "", description: "", taskType: "Testing" });
  };

  const submitEntry = (id: string) => {
    setTimesheets((prev) => prev.map((e) => (e.id === id ? { ...e, status: "SUBMITTED" as const, submittedAt: Date.now() } : e)));
  };

  const deleteEntry = (id: string) => {
    setTimesheets((prev) => prev.filter((e) => e.id !== id));
  };

  const totalHours = myEntries.reduce((s, e) => s + e.hours, 0);

  return (
    <SectionCard title="Zeiterfassung" icon={Clock}>
      <div className="grid sm:grid-cols-5 gap-2 mb-4">
        <Input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
        <select
          className="bg-gray-900 border border-gray-600 text-white rounded-lg px-3 py-2 text-sm"
          value={form.projectId}
          onChange={(e) => setForm((f) => ({ ...f, projectId: e.target.value }))}
        >
          <option value="">Projekt wählen</option>
          {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <Input type="number" placeholder="Stunden" step="0.5" min="0" value={form.hours} onChange={(e) => setForm((f) => ({ ...f, hours: e.target.value }))} />
        <Input placeholder="Beschreibung" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
        <Button onClick={addEntry}><Plus size={14} /> Eintrag</Button>
      </div>

      <div className="text-sm text-gray-300 mb-2">Gesamt: <b className="text-white">{totalHours}h</b></div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-gray-400 border-b border-gray-700">
            <tr><th className="p-2">Datum</th><th className="p-2">Projekt</th><th className="p-2">Std.</th><th className="p-2">Beschreibung</th><th className="p-2">Status</th><th className="p-2" /></tr>
          </thead>
          <tbody>
            {myEntries.map((e) => (
              <tr key={e.id} className="border-b border-gray-800 text-white">
                <td className="p-2">{e.date}</td>
                <td className="p-2">{projects.find((p) => p.id === e.projectId)?.name ?? e.projectId}</td>
                <td className="p-2">{e.hours}</td>
                <td className="p-2 text-gray-300">{e.description}</td>
                <td className="p-2"><Badge color={e.status === "APPROVED" ? "green" : e.status === "SUBMITTED" ? "blue" : "gray"}>{e.status}</Badge></td>
                <td className="p-2 flex gap-1">
                  {e.status === "DRAFT" && <Button onClick={() => submitEntry(e.id)} className="text-xs px-2 py-1">Submit</Button>}
                  {e.status === "DRAFT" && <button onClick={() => deleteEntry(e.id)} className="text-red-400 hover:text-red-300 p-1"><Trash2 size={14} /></button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
}

/* ═══ Vacation Tab ═══ */
function VacationTab() {
  const { activeUser, urlaubRequests, setUrlaubRequests } = useAppState();
  const myRequests = urlaubRequests.filter((v) => v.userId === activeUser.id);

  const [form, setForm] = useState({ from: "", to: "", reason: "" });

  const addRequest = () => {
    if (!form.from || !form.to) return;
    const start = new Date(form.from);
    const end = new Date(form.to);
    const diffDays = Math.max(1, Math.round((end.getTime() - start.getTime()) / 86400000));
    const req: VacationRequest = {
      id: shortId(),
      userId: activeUser.id,
      startDate: form.from,
      endDate: form.to,
      days: diffDays,
      status: "PENDING",
      reason: form.reason,
      submittedAt: Date.now(),
      reviewedBy: null,
      reviewedAt: null,
      comments: "",
    };
    setUrlaubRequests((prev) => [...prev, req]);
    setForm({ from: "", to: "", reason: "" });
  };

  return (
    <SectionCard title="Urlaubsanträge" icon={UmbrellaOff}>
      <div className="grid sm:grid-cols-4 gap-2 mb-4">
        <Input type="date" value={form.from} onChange={(e) => setForm((f) => ({ ...f, from: e.target.value }))} placeholder="Von" />
        <Input type="date" value={form.to} onChange={(e) => setForm((f) => ({ ...f, to: e.target.value }))} placeholder="Bis" />
        <Input placeholder="Grund (optional)" value={form.reason} onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))} />
        <Button onClick={addRequest}><Plus size={14} /> Beantragen</Button>
      </div>
      <div className="space-y-2">
        {myRequests.map((v) => (
          <div key={v.id} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-xl border border-gray-700">
            <div className="text-sm text-white">{v.startDate} — {v.endDate} ({v.days} Tage) {v.reason && <span className="text-gray-400 ml-2">({v.reason})</span>}</div>
            <Badge color={v.status === "APPROVED" ? "green" : v.status === "REJECTED" ? "red" : "yellow"}>{v.status}</Badge>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

/* ═══ Travel Cost Tab ═══ */
function TravelTab() {
  const { activeUser, travelCosts, setTravelCosts } = useAppState();
  const myCosts = travelCosts.filter((t) => t.userId === activeUser.id);

  const [form, setForm] = useState({ date: "", description: "", amount: "" });

  const addCost = () => {
    if (!form.date || !form.amount) return;
    const tc: TravelCost = {
      id: shortId(),
      userId: activeUser.id,
      date: form.date,
      description: form.description,
      amount: parseFloat(form.amount),
      category: "Other",
      status: "PENDING",
      submittedAt: Date.now(),
      reviewedBy: null,
      reviewedAt: null,
      comments: "",
    };
    setTravelCosts((prev) => [...prev, tc]);
    setForm({ date: "", description: "", amount: "" });
  };

  return (
    <SectionCard title="Reisekosten" icon={Plane}>
      <div className="grid sm:grid-cols-4 gap-2 mb-4">
        <Input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
        <Input placeholder="Beschreibung" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
        <Input type="number" placeholder="Betrag (€)" step="0.01" min="0" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} />
        <Button onClick={addCost}><Plus size={14} /> Einreichen</Button>
      </div>
      <div className="space-y-2">
        {myCosts.map((t) => (
          <div key={t.id} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-xl border border-gray-700">
            <div className="text-sm text-white">{t.date} — {t.description} — <b>{t.amount.toFixed(2)} €</b></div>
            <Badge color={t.status === "APPROVED" ? "green" : t.status === "REJECTED" ? "red" : "yellow"}>{t.status}</Badge>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
