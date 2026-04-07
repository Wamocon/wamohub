"use client";

import { User, Briefcase, Target, ClipboardCheck, CheckCircle } from "lucide-react";
import { useState } from "react";
import { useAppState } from "@/lib/app-state";
import { formatLevel, shortId } from "@/lib/data";
import { Badge, Button, Input, Textarea, SectionCard } from "@/components/ui";

export function ConsultantView() {
  const {
    activeUser,
    users,
    myProjects,
    goals,
    setGoals,
    checklistTemplate,
    assessments,
    setAssessments,
    myMentor,
    myMentorTasks,
    myReflections,
  } = useAppState();

  const myGoals = goals.filter((g) => g.ownerUserId === activeUser.id && g.createdBy === "SELF");
  const mentorGoals = goals.filter((g) => g.ownerUserId === activeUser.id && g.createdBy === "MENTOR");
  const mentorName = users.find((u) => u.id === myMentor)?.name ?? null;
  const myAssessment = assessments.find((a) => a.menteeUserId === activeUser.id) ?? null;
  const myChecklist = checklistTemplate.fromLevel === activeUser.level ? checklistTemplate : null;

  const [newGoal, setNewGoal] = useState({ title: "", description: "" });

  const addGoal = () => {
    if (!newGoal.title.trim()) return;
    setGoals((prev) => [
      ...prev,
      { id: shortId(), ownerUserId: activeUser.id, createdBy: "SELF" as const, title: newGoal.title, description: newGoal.description, status: "OPEN" as const, createdAt: Date.now() },
    ]);
    setNewGoal({ title: "", description: "" });
  };

  const submitAssessment = () => {
    if (!myChecklist) return;
    if (!myAssessment) {
      setAssessments((prev) => [
        ...prev,
        { id: shortId(), menteeUserId: activeUser.id, targetLevel: myChecklist.toLevel, status: "SUBMITTED" as const, mentorConfirmedAt: null },
      ]);
    } else {
      setAssessments((prev) =>
        prev.map((a) => (a.id === myAssessment.id ? { ...a, status: "SUBMITTED" as const } : a)),
      );
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
