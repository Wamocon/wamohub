"use client";

import { StickyNote, Plus, Trash2, Search, Edit } from "lucide-react";
import { useState, useMemo } from "react";
import { useAppState } from "@/lib/app-state";
import type { Note } from "@/types/domain";
import { Button, Input, Textarea, Modal } from "@/components/ui";
import {
  createNote as createNoteAction,
  updateNote as updateNoteAction,
  deleteNote as deleteNoteAction,
} from "@/lib/actions";

export function NotesView() {
  const { activeUser, notes, refreshData } = useAppState();
  const myNotes = notes.filter((n) => n.ownerUserId === activeUser.id && n.scope === "GENERAL");

  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Note | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ body: "" });

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return myNotes.filter((n) => n.body.toLowerCase().includes(q));
  }, [myNotes, search]);

  const openCreate = () => {
    setForm({ body: "" });
    setShowCreate(true);
  };

  const openEdit = (n: Note) => {
    setForm({ body: n.body });
    setEditing(n);
  };

  const save = async () => {
    try {
      if (editing) {
        await updateNoteAction(editing.id, { body: form.body });
        setEditing(null);
      } else {
        if (!form.body.trim()) return;
        await createNoteAction({ ownerUserId: activeUser.id, scope: "GENERAL", refId: null, visibility: "PRIVATE_SELF", body: form.body });
        setShowCreate(false);
      }
      await refreshData();
    } catch (err) {
      console.error("Failed to save note:", err);
    }
  };

  const deleteNote = async (id: string) => {
    try {
      await deleteNoteAction(id);
      await refreshData();
    } catch (err) {
      console.error("Failed to delete note:", err);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input className="pl-9" placeholder="Notizen suchen …" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Button onClick={openCreate} data-testid="notes-new"><Plus size={14} /> Neue Notiz</Button>
      </div>

      {filtered.length === 0 && <div className="text-gray-300 text-sm text-center py-8">Keine Notizen gefunden.</div>}

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((n) => (
          <div key={n.id} className="p-4 bg-gray-800/50 border border-gray-700 rounded-2xl space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="font-semibold text-white flex items-center gap-2"><StickyNote size={14} /> Notiz</div>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => openEdit(n)} className="p-1 text-gray-400 hover:text-white"><Edit size={14} /></button>
                <button onClick={() => deleteNote(n.id)} className="p-1 text-red-400 hover:text-red-300"><Trash2 size={14} /></button>
              </div>
            </div>
            <div className="text-sm text-gray-300 whitespace-pre-wrap line-clamp-6">{n.body}</div>
            <div className="text-xs text-gray-500">{new Date(n.createdAt).toLocaleString("de-DE")}</div>
          </div>
        ))}
      </div>

      {(showCreate || editing) && (
        <Modal open={true} title={editing ? "Notiz bearbeiten" : "Neue Notiz"} onClose={() => { setShowCreate(false); setEditing(null); }}>
          <div className="grid gap-3">
            <Textarea placeholder="Inhalt" rows={8} value={form.body} onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))} data-testid="notes-body" />
            <Button onClick={save} data-testid="notes-submit">Speichern</Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
