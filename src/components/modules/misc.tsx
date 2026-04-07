"use client";

import { Link2, FileText, UmbrellaOff, Calendar } from "lucide-react";
import { useAppState } from "@/lib/app-state";
import { SectionCard } from "@/components/ui";

export function MiscView() {
  const { activeUser, links, urlaubRequests } = useAppState();
  const myVacation = urlaubRequests.filter((v) => v.userId === activeUser.id);
  const linkList = Object.values(links);

  return (
    <div className="grid xl:grid-cols-2 gap-4">
      {/* Quick links */}
      <SectionCard title="Quick Links" icon={Link2}>
        <div className="grid sm:grid-cols-2 gap-2">
          {linkList.map((l) => (
            <a key={l.key} href={l.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-2 bg-gray-800/50 rounded-lg border border-gray-700 text-sm text-blue-400 hover:text-blue-300 hover:bg-gray-700 transition">
              <Link2 size={14} /> {l.label}
            </a>
          ))}
        </div>
      </SectionCard>

      {/* Documents (static mock) */}
      <SectionCard title="Dokumente" icon={FileText}>
        <div className="space-y-2 text-sm text-gray-300">
          <div className="p-3 bg-gray-800/50 rounded-xl border border-gray-700 flex items-center gap-2"><FileText size={14} className="text-gray-400" /> Arbeitsvertrag.pdf</div>
          <div className="p-3 bg-gray-800/50 rounded-xl border border-gray-700 flex items-center gap-2"><FileText size={14} className="text-gray-400" /> Handbook_2024.pdf</div>
          <div className="p-3 bg-gray-800/50 rounded-xl border border-gray-700 flex items-center gap-2"><FileText size={14} className="text-gray-400" /> Reisekostenrichtlinie.pdf</div>
        </div>
      </SectionCard>

      {/* Vacation overview */}
      <SectionCard title="Urlaubskonto" icon={UmbrellaOff}>
        <div className="grid sm:grid-cols-3 gap-4 text-center mb-4">
          <div className="p-3 bg-gray-800/50 rounded-xl border border-gray-700">
            <div className="text-2xl font-bold text-white">30</div>
            <div className="text-xs text-gray-400">Tage gesamt</div>
          </div>
          <div className="p-3 bg-gray-800/50 rounded-xl border border-gray-700">
            <div className="text-2xl font-bold text-green-400">{30 - myVacation.filter((v) => v.status === "APPROVED").reduce((s, v) => s + v.days, 0)}</div>
            <div className="text-xs text-gray-400">Noch verfügbar</div>
          </div>
          <div className="p-3 bg-gray-800/50 rounded-xl border border-gray-700">
            <div className="text-2xl font-bold text-yellow-400">{myVacation.filter((v) => v.status === "PENDING").length}</div>
            <div className="text-xs text-gray-400">Ausstehend</div>
          </div>
        </div>
      </SectionCard>

      {/* Calendar placeholder */}
      <SectionCard title="Kalender" icon={Calendar}>
        <div className="text-sm text-gray-400 text-center py-8">
          Kalenderintegration ist für Phase 3 (Supabase-Anbindung) vorgesehen.
        </div>
      </SectionCard>
    </div>
  );
}
