"use client";

import { Award, BookOpen, Send } from "lucide-react";
import { useState } from "react";
import { Badge, Button, Input, SectionCard } from "@/components/ui";

/* Academy is largely static / mock in the SIT version */
const COURSES = [
  { id: "c1", title: "React & Next.js Masterclass", category: "Frontend", status: "Verfügbar" },
  { id: "c2", title: "Cloud Architecture (AWS)", category: "Cloud", status: "Verfügbar" },
  { id: "c3", title: "Agile Leadership", category: "Soft Skills", status: "Laufend" },
  { id: "c4", title: "TypeScript Deep Dive", category: "Frontend", status: "Abgeschlossen" },
  { id: "c5", title: "Data Engineering Basics", category: "Data", status: "Verfügbar" },
];

const CERTIFICATES = [
  { id: "z1", title: "AWS Solutions Architect Associate", date: "2024-03-15" },
  { id: "z2", title: "Scrum Master PSM I", date: "2023-11-22" },
];

export function AcademyView() {
  const [search, setSearch] = useState("");
  const [requestText, setRequestText] = useState("");
  const [requested, setRequested] = useState(false);

  const filtered = COURSES.filter((c) => c.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="grid xl:grid-cols-2 gap-4">
      <SectionCard title="Kurse" icon={BookOpen}>
        <Input placeholder="Kurs suchen …" value={search} onChange={(e) => setSearch(e.target.value)} className="mb-3" />
        <div className="space-y-2">
          {filtered.map((c) => (
            <div key={c.id} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-xl border border-gray-700">
              <div>
                <div className="font-medium text-white">{c.title}</div>
                <div className="text-xs text-gray-400">{c.category}</div>
              </div>
              <Badge color={c.status === "Abgeschlossen" ? "green" : c.status === "Laufend" ? "blue" : "gray"}>{c.status}</Badge>
            </div>
          ))}
        </div>
      </SectionCard>

      <div className="space-y-4">
        <SectionCard title="Zertifikate" icon={Award}>
          {CERTIFICATES.map((z) => (
            <div key={z.id} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-xl border border-gray-700 mb-2 last:mb-0">
              <div className="font-medium text-white">{z.title}</div>
              <div className="text-xs text-gray-400">{z.date}</div>
            </div>
          ))}
        </SectionCard>

        <SectionCard title="Schulungsantrag" icon={Send}>
          {requested ? (
            <div className="text-sm text-green-400">Anfrage gesendet ✓</div>
          ) : (
            <div className="space-y-2">
              <Input placeholder="Gewünschte Schulung / Kurs" value={requestText} onChange={(e) => setRequestText(e.target.value)} />
              <Button onClick={() => { if (requestText.trim()) setRequested(true); }}><Send size={14} /> Anfrage senden</Button>
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
