"use client";

import { Clock, UmbrellaOff, Plane } from "lucide-react";
import { useState, useTransition } from "react";
import { useAppState } from "@/lib/app-state";
import { Badge, Button, SectionCard } from "@/components/ui";
import {
  updateTimesheet,
  updateVacationRequest,
  updateTravelCost,
} from "@/lib/actions";

type Tab = "timesheet" | "vacation" | "travel";

export function ApprovalsView() {
  const {
    activeUser,
    users,
    timesheets,
    urlaubRequests,
    travelCosts,
    projects,
    refreshData,
  } = useAppState();
  const [tab, setTab] = useState<Tab>("timesheet");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const pendingTimesheets = timesheets.filter((e) => e.status === "SUBMITTED");
  const pendingVacation = urlaubRequests.filter((v) => v.status === "PENDING");
  const pendingTravel = travelCosts.filter((t) => t.status === "PENDING");

  const tabs: { key: Tab; label: string; icon: typeof Clock; count: number }[] = [
    { key: "timesheet", label: "Zeiterfassung", icon: Clock, count: pendingTimesheets.length },
    { key: "vacation", label: "Urlaub", icon: UmbrellaOff, count: pendingVacation.length },
    { key: "travel", label: "Reisekosten", icon: Plane, count: pendingTravel.length },
  ];

  const reviewerId = activeUser.id;

  const wrap = (fn: () => Promise<void>) =>
    startTransition(async () => {
      setError(null);
      try {
        await fn();
        await refreshData();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Aktion fehlgeschlagen");
      }
    });

  const approveTimesheet = (id: string) =>
    wrap(() => updateTimesheet(id, { status: "APPROVED", reviewedBy: reviewerId }));
  const rejectTimesheet = (id: string) =>
    wrap(() => updateTimesheet(id, { status: "REJECTED", reviewedBy: reviewerId }));
  const approveVacation = (id: string) =>
    wrap(() => updateVacationRequest(id, { status: "APPROVED", reviewedBy: reviewerId }));
  const rejectVacation = (id: string) =>
    wrap(() => updateVacationRequest(id, { status: "REJECTED", reviewedBy: reviewerId }));
  const approveTravel = (id: string) =>
    wrap(() => updateTravelCost(id, { status: "APPROVED", reviewedBy: reviewerId }));
  const rejectTravel = (id: string) =>
    wrap(() => updateTravelCost(id, { status: "REJECTED", reviewedBy: reviewerId }));

  const userName = (id: string) => users.find((u) => u.id === id)?.name ?? id;
  const projectName = (id: string) => projects.find((p) => p.id === id)?.name ?? id;

  return (
    <div className="space-y-4">
      <div className="flex gap-2 border-b border-gray-700 pb-2 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            data-testid={`approvals-tab-${t.key}`}
            className={`flex items-center gap-2 px-4 py-2 rounded-t-xl text-sm font-medium transition shrink-0 ${
              tab === t.key
                ? "bg-gray-800 text-white border-b-2 border-red-500"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <t.icon size={14} /> {t.label} {t.count > 0 && <Badge color="red">{t.count}</Badge>}
          </button>
        ))}
      </div>

      {error && (
        <div className="text-sm text-red-400 bg-red-950/40 border border-red-900 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      {tab === "timesheet" && (
        <SectionCard title="Zeiterfassung genehmigen" icon={Clock}>
          {pendingTimesheets.length === 0 && (
            <div className="text-sm text-gray-300" data-testid="approvals-timesheet-empty">
              Keine offenen Einträge.
            </div>
          )}
          <div className="space-y-2">
            {pendingTimesheets.map((e) => (
              <div
                key={e.id}
                className="flex items-center justify-between p-3 bg-gray-800/50 rounded-xl border border-gray-700"
                data-testid={`approvals-timesheet-row-${e.id}`}
              >
                <div className="text-sm text-white">
                  <b>{userName(e.userId)}</b> — {e.date} — {projectName(e.projectId)} — {e.hours}h
                  {e.description && <span className="text-gray-400 ml-2">({e.description})</span>}
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => approveTimesheet(e.id)}
                    disabled={pending}
                    className="text-xs px-3 py-1 bg-green-700 hover:bg-green-600"
                    data-testid={`approvals-timesheet-approve-${e.id}`}
                  >
                    ✓
                  </Button>
                  <Button
                    onClick={() => rejectTimesheet(e.id)}
                    disabled={pending}
                    className="text-xs px-3 py-1 bg-red-700 hover:bg-red-600"
                    data-testid={`approvals-timesheet-reject-${e.id}`}
                  >
                    ✗
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {tab === "vacation" && (
        <SectionCard title="Urlaubsanträge genehmigen" icon={UmbrellaOff}>
          {pendingVacation.length === 0 && (
            <div className="text-sm text-gray-300" data-testid="approvals-vacation-empty">
              Keine offenen Anträge.
            </div>
          )}
          <div className="space-y-2">
            {pendingVacation.map((v) => (
              <div
                key={v.id}
                className="flex items-center justify-between p-3 bg-gray-800/50 rounded-xl border border-gray-700"
                data-testid={`approvals-vacation-row-${v.id}`}
              >
                <div className="text-sm text-white">
                  <b>{userName(v.userId)}</b> — {v.startDate} bis {v.endDate} ({v.days} Tage)
                  {v.reason && <span className="text-gray-400 ml-2">({v.reason})</span>}
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => approveVacation(v.id)}
                    disabled={pending}
                    className="text-xs px-3 py-1 bg-green-700 hover:bg-green-600"
                    data-testid={`approvals-vacation-approve-${v.id}`}
                  >
                    ✓
                  </Button>
                  <Button
                    onClick={() => rejectVacation(v.id)}
                    disabled={pending}
                    className="text-xs px-3 py-1 bg-red-700 hover:bg-red-600"
                    data-testid={`approvals-vacation-reject-${v.id}`}
                  >
                    ✗
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {tab === "travel" && (
        <SectionCard title="Reisekosten genehmigen" icon={Plane}>
          {pendingTravel.length === 0 && (
            <div className="text-sm text-gray-300" data-testid="approvals-travel-empty">
              Keine offenen Einträge.
            </div>
          )}
          <div className="space-y-2">
            {pendingTravel.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between p-3 bg-gray-800/50 rounded-xl border border-gray-700"
                data-testid={`approvals-travel-row-${t.id}`}
              >
                <div className="text-sm text-white">
                  <b>{userName(t.userId)}</b> — {t.date} — {t.description} — {t.amount.toFixed(2)} €
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => approveTravel(t.id)}
                    disabled={pending}
                    className="text-xs px-3 py-1 bg-green-700 hover:bg-green-600"
                    data-testid={`approvals-travel-approve-${t.id}`}
                  >
                    ✓
                  </Button>
                  <Button
                    onClick={() => rejectTravel(t.id)}
                    disabled={pending}
                    className="text-xs px-3 py-1 bg-red-700 hover:bg-red-600"
                    data-testid={`approvals-travel-reject-${t.id}`}
                  >
                    ✗
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      )}
    </div>
  );
}
