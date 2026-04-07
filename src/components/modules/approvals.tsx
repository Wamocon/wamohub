"use client";

import { Clock, UmbrellaOff, Plane } from "lucide-react";
import { useState } from "react";
import { useAppState } from "@/lib/app-state";
import { Badge, Button, SectionCard } from "@/components/ui";

type Tab = "timesheet" | "vacation" | "travel";

export function ApprovalsView() {
  const { users, timesheets, setTimesheets, urlaubRequests, setUrlaubRequests, travelCosts, setTravelCosts, projects } = useAppState();
  const [tab, setTab] = useState<Tab>("timesheet");

  const pendingTimesheets = timesheets.filter((e) => e.status === "SUBMITTED");
  const pendingVacation = urlaubRequests.filter((v) => v.status === "PENDING");
  const pendingTravel = travelCosts.filter((t) => t.status === "PENDING");

  const tabs: { key: Tab; label: string; icon: typeof Clock; count: number }[] = [
    { key: "timesheet", label: "Zeiterfassung", icon: Clock, count: pendingTimesheets.length },
    { key: "vacation", label: "Urlaub", icon: UmbrellaOff, count: pendingVacation.length },
    { key: "travel", label: "Reisekosten", icon: Plane, count: pendingTravel.length },
  ];

  const approveTimesheet = (id: string) => setTimesheets((prev) => prev.map((e) => (e.id === id ? { ...e, status: "APPROVED" as const, reviewedBy: "admin", reviewedAt: Date.now() } : e)));
  const rejectTimesheet = (id: string) => setTimesheets((prev) => prev.map((e) => (e.id === id ? { ...e, status: "REJECTED" as const, reviewedBy: "admin", reviewedAt: Date.now() } : e)));
  const approveVacation = (id: string) => setUrlaubRequests((prev) => prev.map((v) => (v.id === id ? { ...v, status: "APPROVED" as const, reviewedBy: "admin", reviewedAt: Date.now() } : v)));
  const rejectVacation = (id: string) => setUrlaubRequests((prev) => prev.map((v) => (v.id === id ? { ...v, status: "REJECTED" as const, reviewedBy: "admin", reviewedAt: Date.now() } : v)));
  const approveTravel = (id: string) => setTravelCosts((prev) => prev.map((t) => (t.id === id ? { ...t, status: "APPROVED" as const, reviewedBy: "admin", reviewedAt: Date.now() } : t)));
  const rejectTravel = (id: string) => setTravelCosts((prev) => prev.map((t) => (t.id === id ? { ...t, status: "REJECTED" as const, reviewedBy: "admin", reviewedAt: Date.now() } : t)));

  const userName = (id: string) => users.find((u) => u.id === id)?.name ?? id;
  const projectName = (id: string) => projects.find((p) => p.id === id)?.name ?? id;

  return (
    <div className="space-y-4">
      <div className="flex gap-2 border-b border-gray-700 pb-2">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`flex items-center gap-2 px-4 py-2 rounded-t-xl text-sm font-medium transition ${tab === t.key ? "bg-gray-800 text-white border-b-2 border-red-500" : "text-gray-400 hover:text-white"}`}>
            <t.icon size={14} /> {t.label} {t.count > 0 && <Badge color="red">{t.count}</Badge>}
          </button>
        ))}
      </div>

      {tab === "timesheet" && (
        <SectionCard title="Zeiterfassung genehmigen" icon={Clock}>
          {pendingTimesheets.length === 0 && <div className="text-sm text-gray-300">Keine offenen Einträge.</div>}
          <div className="space-y-2">
            {pendingTimesheets.map((e) => (
              <div key={e.id} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-xl border border-gray-700">
                <div className="text-sm text-white">
                  <b>{userName(e.userId)}</b> — {e.date} — {projectName(e.projectId)} — {e.hours}h
                  {e.description && <span className="text-gray-400 ml-2">({e.description})</span>}
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => approveTimesheet(e.id)} className="text-xs px-3 py-1 bg-green-700 hover:bg-green-600">✓</Button>
                  <Button onClick={() => rejectTimesheet(e.id)} className="text-xs px-3 py-1 bg-red-700 hover:bg-red-600">✗</Button>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {tab === "vacation" && (
        <SectionCard title="Urlaubsanträge genehmigen" icon={UmbrellaOff}>
          {pendingVacation.length === 0 && <div className="text-sm text-gray-300">Keine offenen Anträge.</div>}
          <div className="space-y-2">
            {pendingVacation.map((v) => (
              <div key={v.id} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-xl border border-gray-700">
                <div className="text-sm text-white">
                  <b>{userName(v.userId)}</b> — {v.startDate} bis {v.endDate} ({v.days} Tage)
                  {v.reason && <span className="text-gray-400 ml-2">({v.reason})</span>}
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => approveVacation(v.id)} className="text-xs px-3 py-1 bg-green-700 hover:bg-green-600">✓</Button>
                  <Button onClick={() => rejectVacation(v.id)} className="text-xs px-3 py-1 bg-red-700 hover:bg-red-600">✗</Button>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {tab === "travel" && (
        <SectionCard title="Reisekosten genehmigen" icon={Plane}>
          {pendingTravel.length === 0 && <div className="text-sm text-gray-300">Keine offenen Einträge.</div>}
          <div className="space-y-2">
            {pendingTravel.map((t) => (
              <div key={t.id} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-xl border border-gray-700">
                <div className="text-sm text-white">
                  <b>{userName(t.userId)}</b> — {t.date} — {t.description} — {t.amount.toFixed(2)} €
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => approveTravel(t.id)} className="text-xs px-3 py-1 bg-green-700 hover:bg-green-600">✓</Button>
                  <Button onClick={() => rejectTravel(t.id)} className="text-xs px-3 py-1 bg-red-700 hover:bg-red-600">✗</Button>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      )}
    </div>
  );
}
