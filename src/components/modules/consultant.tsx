"use client";

import { User, Briefcase, Target, ClipboardCheck, CheckCircle } from "lucide-react";
import { useState } from "react";
import { useAppState } from "@/lib/app-state";
import { formatLevel } from "@/lib/data";
import { Badge, Button, Input, Textarea, SectionCard } from "@/components/ui";
import { createGoal as createGoalAction, updateAssessment, createTimesheet as createTimesheetAction } from "@/lib/actions";
import type { Timesheet } from "@/types/domain";

export function ConsultantView() {
  const {
    activeUser,
    users,
    myProjects,
    goals,
    checklistTemplate,
    assessments,
    myMentor,
    myMentorTasks,
    myReflections,
    refreshData,
  } = useAppState();

  const myGoals = goals.filter((g) => g.ownerUserId === activeUser.id && g.createdBy === "SELF");
  const mentorGoals = goals.filter((g) => g.ownerUserId === activeUser.id && g.createdBy === "MENTOR");
  const mentorName = users.find((u) => u.id === myMentor)?.name ?? null;
  const myAssessment = assessments.find((a) => a.menteeUserId === activeUser.id) ?? null;
  const myChecklist = checklistTemplate.fromLevel === activeUser.level ? checklistTemplate : null;

  const [newGoal, setNewGoal] = useState({ title: "", description: "" });
  const [tsForm, setTsForm] = useState({ projectId: "", hours: "", description: "" });

  const addGoal = async () => {
    if (!newGoal.title.trim()) return;
    try {
      await createGoalAction({ ownerUserId: activeUser.id, createdBy: "SELF", title: newGoal.title, description: newGoal.description, status: "OPEN" });
      setNewGoal({ title: "", description: "" });
      await refreshData();
    } catch (err) {
      console.error("Failed to add goal:", err);
    }
  };

  const submitAssessment = async () => {
    if (!myChecklist) return;
    try {
      if (myAssessment) {
        await updateAssessment(myAssessment.id, { status: "SUBMITTED" });
      }
      // If no assessment exists, this would need a createAssessment action (future)
      await refreshData();
    } catch (err) {
      console.error("Failed to submit assessment:", err);
    }
  };

  const submitTimesheet = async () => {
    if (!tsForm.projectId || !tsForm.hours) return;
    try {
      await createTimesheetAction({
        userId: activeUser.id,
        projectId: tsForm.projectId,
        date: new Date().toISOString().slice(0, 10),
        hours: parseFloat(tsForm.hours),
        description: tsForm.description,
        taskType: "Testing" as Timesheet["taskType"],
        status: "SUBMITTED",
      });
      setTsForm({ projectId: "", hours: "", description: "" });
      await refreshData();
    } catch (err) {
      console.error("Failed to submit timesheet:", err);
    }
  };

  return (
    <div className="grid xl:grid-cols-3 gap-4">
      {/* Profile */}
      <SectionCard title="Profil" icon={User}>
        <div className="grid sm:grid-cols-2 gap-3 text-sm">
          <div><div className="text-gray-300">Name</div><div className="font-medium text-white">{activeUser.name}</div></div>
          <div><div className="text-gray-300">E-Mail</div><div className="font-medium text-white">{activeUser.email}</div></div>
          <div><div className="text-gray-300">Stufe</div><div className="font-medium"><Badge>{formatLevel(activeUser.level)}</Badge></div></div>
          <div><div className="text-gray-300">Rollen</div><div className="font-medium text-white">{activeUser.roles.join(", ")}</div></div>
          <div><div className="text-gray-300">Mentor</div><div className="font-medium text-white">{mentorName ?? <em className="text-gray-400">nicht zugewiesen</em>}</div></div>
        </div>
      </SectionCard>

      {/* Projects */}
      <SectionCard title="Meine Projekte" icon={Briefcase}>
        <div className="space-y-3">
          {myProjects.length === 0 && <div className="text-sm text-gray-300">Keine Zuweisungen.</div>}
          {myProjects.map((p) => (
            <div key={p.id} className="p-3 border border-gray-700 rounded-xl">
              <div className="font-semibold text-white">{p.name}</div>
              <div className="text-xs text-gray-300">Rolle: {p.members.find((m) => m.userId === activeUser.id)?.roleLabel ?? "—"}</div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Goals */}
      <SectionCard title="Ziele (eigene)" icon={Target} actions={<Button onClick={addGoal}><Target size={14} /> Ziel anlegen</Button>}>
        <div className="space-y-3">
          <div className="grid gap-2">
            <Input value={newGoal.title} onChange={(e) => setNewGoal((g) => ({ ...g, title: e.target.value }))} placeholder="Titel" />
            <Textarea value={newGoal.description} onChange={(e) => setNewGoal((g) => ({ ...g, description: e.target.value }))} placeholder="Beschreibung" rows={2} />
          </div>
          {myGoals.map((g) => (
            <div key={g.id} className="py-2 border-b border-gray-700 last:border-0">
              <div className="flex items-center justify-between">
                <div className="font-medium text-white">{g.title}</div>
                <Badge color="green">{g.status}</Badge>
              </div>
              {g.description && <div className="text-sm text-gray-300 mt-1">{g.description}</div>}
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Mentor goals (read-only) */}
      <SectionCard title="Ziele (vom Mentor)" icon={ClipboardCheck}>
        {mentorGoals.length === 0 && <div className="text-sm text-gray-300">Keine Mentor-Ziele.</div>}
        {mentorGoals.map((g) => (
          <div key={g.id} className="py-2 border-b border-gray-700 last:border-0">
            <div className="flex items-center justify-between">
              <div className="font-medium text-white">{g.title}</div>
              <Badge color="gray">{g.status}</Badge>
            </div>
          </div>
        ))}
      </SectionCard>

      {/* Assessment */}
      <SectionCard title="Assessmentcenter" icon={CheckCircle}>
        {!myChecklist && <div className="text-sm text-gray-300">Für deine aktuelle Stufe liegt noch keine Vorlage vor.</div>}
        {myChecklist && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-white">Zielstufe: <b>{formatLevel(myChecklist.toLevel)}</b> — Status: <b>{myAssessment?.status ?? "DRAFT"}</b></div>
            <Button onClick={submitAssessment} disabled={(myAssessment?.status ?? "DRAFT") !== "DRAFT" && myAssessment?.status !== "FAILED"}>Einreichen</Button>
          </div>
        )}
      </SectionCard>

      {/* Timesheet entry */}
      <SectionCard title="Zeiterfassung" icon={Briefcase}>
        <div className="grid gap-2">
          <select
            className="bg-gray-900 border border-gray-600 text-white rounded-lg px-3 py-2 text-sm"
            value={tsForm.projectId}
            onChange={(e) => setTsForm((f) => ({ ...f, projectId: e.target.value }))}
            data-testid="timesheet-project"
          >
            <option value="">Projekt wählen</option>
            {myProjects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <Input type="number" placeholder="Stunden" step="0.5" min="0" value={tsForm.hours} onChange={(e) => setTsForm((f) => ({ ...f, hours: e.target.value }))} data-testid="timesheet-hours" />
          <Input placeholder="Beschreibung" value={tsForm.description} onChange={(e) => setTsForm((f) => ({ ...f, description: e.target.value }))} data-testid="timesheet-description" />
          <Button onClick={submitTimesheet} disabled={!tsForm.projectId || !tsForm.hours} data-testid="timesheet-submit">Einreichen</Button>
        </div>
      </SectionCard>

      {/* Mentor Tasks (mentee view) */}
      {myMentorTasks.length > 0 && (
        <SectionCard title="Mentor Tasks" icon={ClipboardCheck}>
          <div className="space-y-3">
            {myMentorTasks.map((t) => (
              <div key={t.id} className="p-3 bg-gray-800 rounded-xl border border-gray-700">
                <div className="flex items-center justify-between mb-1">
                  <div className="font-medium text-white">{t.title}</div>
                  <div className="flex gap-1">
                    <Badge color={t.priority === "HIGH" ? "red" : t.priority === "MEDIUM" ? "yellow" : "green"}>{t.priority}</Badge>
                    <Badge color={t.status === "COMPLETED" ? "green" : t.status === "IN_PROGRESS" ? "blue" : "gray"}>{t.status}</Badge>
                  </div>
                </div>
                <div className="text-sm text-gray-400">{t.description}</div>
                <div className="text-xs text-gray-300 mt-1">Due: {t.dueDate}</div>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {/* Reflections (mentee view) */}
      {myReflections.length > 0 && (
        <SectionCard title="Reflections" icon={Target}>
          <div className="space-y-3">
            {myReflections.map((r) => (
              <div key={r.id} className="p-3 bg-gray-800 rounded-xl border border-gray-700">
                <div className="flex items-center justify-between mb-1">
                  <div className="font-medium text-white">{r.title}</div>
                  <Badge color={r.status === "COMPLETED" ? "green" : r.status === "IN_PROGRESS" ? "blue" : "gray"}>{r.status}</Badge>
                </div>
                <div className="text-sm text-gray-400">{r.description}</div>
              </div>
            ))}
          </div>
        </SectionCard>
      )}
    </div>
  );
}
