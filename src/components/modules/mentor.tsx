"use client";

import { Users, Target, ClipboardCheck, Plus, CheckCircle, BookOpen, Pencil } from "lucide-react";
import { useState } from "react";
import { useAppState } from "@/lib/app-state";
import { shortId, formatLevel } from "@/lib/data";
import type { MentorTask } from "@/types/domain";
import { Badge, Button, Input, Textarea, SectionCard, Modal } from "@/components/ui";

export function MentorView() {
  const {
    activeUser,
    users,
    myMentees,
    goals,
    setGoals,
    notes,
    assessments,
    setAssessments,
    mentorTasks,
    setMentorTasks,
    reflections,
    setReflections,
  } = useAppState();

  const [selectedMenteeId, setSelectedMenteeId] = useState<string | null>(myMentees[0]?.id ?? null);
  const selectedMentee = users.find((u) => u.id === selectedMenteeId) ?? null;

  const menteeGoals = goals.filter((g) => g.ownerUserId === selectedMenteeId);
  const menteeAssessment = assessments.find((a) => a.menteeUserId === selectedMenteeId) ?? null;
  const menteeTasks = mentorTasks.filter((t) => t.menteeUserId === selectedMenteeId);
  const menteeReflections = reflections.filter((r) => r.menteeUserId === selectedMenteeId);
  const menteeNotes = notes.filter((n) => n.scope === "MENTEE_PRIVATE" && n.refId === selectedMenteeId);

  const [newGoal, setNewGoal] = useState({ title: "", description: "" });
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskForm, setTaskForm] = useState({ title: "", description: "", priority: "MEDIUM" as MentorTask["priority"], dueDate: "" });

  if (myMentees.length === 0) {
    return <div className="text-gray-300 text-center py-12">Keine Mentees zugewiesen.</div>;
  }

  const addMentorGoal = () => {
    if (!newGoal.title.trim() || !selectedMenteeId) return;
    setGoals((prev) => [
      ...prev,
      { id: shortId(), ownerUserId: selectedMenteeId, createdBy: "MENTOR" as const, title: newGoal.title, description: newGoal.description, status: "OPEN" as const, createdAt: Date.now() },
    ]);
    setNewGoal({ title: "", description: "" });
  };

  const confirmAssessment = () => {
    if (!menteeAssessment) return;
    setAssessments((prev) =>
      prev.map((a) => (a.id === menteeAssessment.id ? { ...a, status: "MENTOR_CONFIRMED" as const, mentorConfirmedAt: Date.now() } : a)),
    );
  };

  const rejectAssessment = () => {
    if (!menteeAssessment) return;
    setAssessments((prev) =>
      prev.map((a) => (a.id === menteeAssessment.id ? { ...a, status: "FAILED" as const } : a)),
    );
  };

  const addMentorTask = () => {
    if (!taskForm.title.trim() || !selectedMenteeId) return;
    setMentorTasks((prev) => [
      ...prev,
      {
        id: shortId(),
        menteeUserId: selectedMenteeId,
        mentorUserId: activeUser.id,
        title: taskForm.title,
        description: taskForm.description,
        priority: taskForm.priority,
        status: "PENDING" as const,
        dueDate: taskForm.dueDate || new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
        createdAt: Date.now(),
      },
    ]);
    setTaskForm({ title: "", description: "", priority: "MEDIUM", dueDate: "" });
    setShowTaskModal(false);
  };

  const updateTaskStatus = (taskId: string, status: MentorTask["status"]) => {
    setMentorTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status } : t)));
  };

  const addReflection = () => {
    if (!selectedMenteeId) return;
    setReflections((prev) => [
      ...prev,
      {
        id: shortId(),
        menteeUserId: selectedMenteeId,
        mentorUserId: activeUser.id,
        title: `Reflection ${new Date().toLocaleDateString("de-DE")}`,
        description: "",
        status: "PENDING" as const,
        dueDate: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
        createdAt: Date.now(),
      },
    ]);
  };

  return (
    <div className="space-y-4">
      {/* Mentee selector */}
      <div className="flex flex-wrap gap-2">
        {myMentees.map((m) => (
          <button
            key={m.id}
            onClick={() => setSelectedMenteeId(m.id)}
            className={`px-4 py-2 rounded-xl border text-sm font-medium transition ${
              m.id === selectedMenteeId ? "bg-red-600 border-red-500 text-white" : "bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700"
            }`}
          >
            <Users size={14} className="inline mr-1" /> {m.name}
          </button>
        ))}
      </div>

      {selectedMentee && (
        <div className="grid xl:grid-cols-3 gap-4">
          {/* Mentee info */}
          <SectionCard title={selectedMentee.name} icon={Users}>
            <div className="text-sm space-y-1">
              <div className="text-gray-300">Stufe: <Badge>{formatLevel(selectedMentee.level)}</Badge></div>
              <div className="text-gray-300">E-Mail: <span className="text-white">{selectedMentee.email}</span></div>
            </div>
          </SectionCard>

          {/* Goals */}
          <SectionCard title="Ziele" icon={Target} actions={<Button onClick={addMentorGoal}><Plus size={14} /> Ziel</Button>}>
            <div className="space-y-2 mb-3">
              <Input placeholder="Titel" value={newGoal.title} onChange={(e) => setNewGoal((g) => ({ ...g, title: e.target.value }))} />
              <Textarea placeholder="Beschreibung" rows={2} value={newGoal.description} onChange={(e) => setNewGoal((g) => ({ ...g, description: e.target.value }))} />
            </div>
            {menteeGoals.map((g) => (
              <div key={g.id} className="py-2 border-b border-gray-700 last:border-0 flex items-center justify-between">
                <div>
                  <div className="font-medium text-white">{g.title}</div>
                  <div className="text-xs text-gray-400">{g.createdBy === "MENTOR" ? "Von dir" : "Eigeninitiative"}</div>
                </div>
                <Badge color={g.status === "DONE" ? "green" : g.status === "IN_PROGRESS" ? "blue" : "gray"}>{g.status}</Badge>
              </div>
            ))}
          </SectionCard>

          {/* Assessment */}
          <SectionCard title="Assessment" icon={CheckCircle}>
            {!menteeAssessment && <div className="text-sm text-gray-300">Kein Assessment vorhanden.</div>}
            {menteeAssessment && (
              <div className="space-y-3">
                <div className="text-sm text-white">Status: <Badge color={menteeAssessment.status === "MENTOR_CONFIRMED" ? "green" : menteeAssessment.status === "SUBMITTED" ? "blue" : "gray"}>{menteeAssessment.status}</Badge></div>
                {menteeAssessment.status === "SUBMITTED" && (
                  <div className="flex gap-2">
                    <Button onClick={confirmAssessment}>Bestätigen</Button>
                    <Button onClick={rejectAssessment} className="bg-red-700 hover:bg-red-600">Ablehnen</Button>
                  </div>
                )}
              </div>
            )}
          </SectionCard>

          {/* Mentor Tasks */}
          <SectionCard title="Tasks" icon={ClipboardCheck} actions={<Button onClick={() => setShowTaskModal(true)}><Plus size={14} /> Task</Button>}>
            {menteeTasks.length === 0 && <div className="text-sm text-gray-300">Keine Tasks.</div>}
            {menteeTasks.map((t) => (
              <div key={t.id} className="py-2 border-b border-gray-700 last:border-0">
                <div className="flex items-center justify-between mb-1">
                  <div className="font-medium text-white">{t.title}</div>
                  <div className="flex gap-1">
                    <Badge color={t.priority === "HIGH" ? "red" : t.priority === "MEDIUM" ? "yellow" : "green"}>{t.priority}</Badge>
                    <Badge color={t.status === "COMPLETED" ? "green" : t.status === "IN_PROGRESS" ? "blue" : "gray"}>{t.status}</Badge>
                  </div>
                </div>
                <div className="text-sm text-gray-400">{t.description}</div>
                <div className="flex gap-1 mt-1">
                  {(["PENDING", "IN_PROGRESS", "COMPLETED"] as const).map((s) => (
                    <button key={s} onClick={() => updateTaskStatus(t.id, s)} className={`text-xs px-2 py-0.5 rounded ${t.status === s ? "bg-red-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"}`}>{s}</button>
                  ))}
                </div>
              </div>
            ))}
          </SectionCard>

          {/* Reflections */}
          <SectionCard title="Reflections" icon={BookOpen} actions={<Button onClick={addReflection}><Plus size={14} /> Reflection</Button>}>
            {menteeReflections.length === 0 && <div className="text-sm text-gray-300">Keine Reflections.</div>}
            {menteeReflections.map((r) => (
              <div key={r.id} className="py-2 border-b border-gray-700 last:border-0">
                <div className="flex items-center justify-between">
                  <div className="font-medium text-white">{r.title}</div>
                  <Badge color={r.status === "COMPLETED" ? "green" : "gray"}>{r.status}</Badge>
                </div>
                <div className="text-sm text-gray-400">{r.description || "—"}</div>
              </div>
            ))}
          </SectionCard>

          {/* Notes about mentee */}
          <SectionCard title="Notizen zum Mentee" icon={Pencil}>
            {menteeNotes.length === 0 && <div className="text-sm text-gray-300">Keine Notizen.</div>}
            {menteeNotes.map((n) => (
              <div key={n.id} className="py-2 border-b border-gray-700 last:border-0">
                <div className="text-sm text-gray-400 whitespace-pre-wrap">{n.body}</div>
              </div>
            ))}
          </SectionCard>
        </div>
      )}

      {/* Task Modal */}
      {showTaskModal && (
        <Modal open={true} title="Neuer Task" onClose={() => setShowTaskModal(false)}>
          <div className="grid gap-3">
            <Input placeholder="Titel" value={taskForm.title} onChange={(e) => setTaskForm((f) => ({ ...f, title: e.target.value }))} />
            <Textarea placeholder="Beschreibung" rows={2} value={taskForm.description} onChange={(e) => setTaskForm((f) => ({ ...f, description: e.target.value }))} />
            <select className="bg-gray-900 border border-gray-600 text-white rounded-lg px-3 py-2" value={taskForm.priority} onChange={(e) => setTaskForm((f) => ({ ...f, priority: e.target.value as MentorTask["priority"] }))}>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
            <Input type="date" value={taskForm.dueDate} onChange={(e) => setTaskForm((f) => ({ ...f, dueDate: e.target.value }))} />
            <Button onClick={addMentorTask}>Erstellen</Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
