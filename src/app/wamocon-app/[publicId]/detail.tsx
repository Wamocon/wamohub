"use client";

import { ExternalLink, ArrowLeft, AppWindow, User, Tag, Building2, Globe, FileText, FolderOpen } from "lucide-react";
import type { WamoconApp, WamoconWave, WamoconAppStatus } from "@/types/domain";
import { Badge } from "@/components/ui";

const STATUS_COLORS: Record<WamoconAppStatus, string> = {
  PLANNED: "gray",
  IN_DEVELOPMENT: "blue",
  LIVE: "green",
  PAUSED: "yellow",
  CANCELLED: "red",
};

const STATUS_LABELS: Record<WamoconAppStatus, string> = {
  PLANNED: "Geplant",
  IN_DEVELOPMENT: "In Entwicklung",
  LIVE: "Live",
  PAUSED: "Pausiert",
  CANCELLED: "Abgebrochen",
};

export function WamoconAppDetail({
  app,
  waves,
  users,
}: {
  app: WamoconApp;
  waves: WamoconWave[];
  users: { id: string; name: string }[];
}) {
  const ownerName = app.projectOwnerId
    ? users.find((u) => u.id === app.projectOwnerId)?.name ?? "Unbekannt"
    : "–";

  const appWaves = waves.filter((w) => app.waveIds.includes(w.id));

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="bg-linear-to-r from-red-600 to-red-700 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <button
            onClick={() => window.close()}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex-1">
            <div className="text-sm text-red-200">WAMOCON 50 Apps</div>
            <h1 className="text-2xl font-bold flex items-center gap-3">
              <AppWindow size={24} /> {app.name}
            </h1>
          </div>
          <Badge color={STATUS_COLORS[app.status]}>{STATUS_LABELS[app.status]}</Badge>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Info Grid */}
        <div className="grid md:grid-cols-2 gap-4">
          <InfoCard icon={User} label="Projektverantwortlicher" value={ownerName} />
          <InfoCard icon={Tag} label="Kategorie" value={app.category || "–"} />
          <InfoCard icon={Building2} label="Branche" value={app.industry || "–"} />
          <InfoCard
            label="Welle(n)"
            value={
              appWaves.length > 0
                ? appWaves.map((w) => w.name).join(", ")
                : "Keine Welle zugewiesen"
            }
          />
        </div>

        {/* Links */}
        <div className="bg-gray-900 rounded-2xl border border-gray-700 p-6 space-y-3">
          <h2 className="text-lg font-semibold flex items-center gap-2"><Globe size={18} className="text-red-500" /> Links</h2>
          <div className="grid gap-2">
            <LinkRow label="App-URL" url={app.appUrl} />
            <LinkRow label="Landingpage-URL" url={app.landingPageUrl} />
            <LinkRow label="Ablage OneDrive" url={app.onedriveUrl} icon={FolderOpen} />
          </div>
        </div>

        {/* Description */}
        <div className="bg-gray-900 rounded-2xl border border-gray-700 p-6 space-y-3">
          <h2 className="text-lg font-semibold flex items-center gap-2"><FileText size={18} className="text-red-500" /> Beschreibung</h2>
          <p className="text-gray-300 whitespace-pre-wrap">{app.description || "Keine Beschreibung vorhanden."}</p>
        </div>

        {/* Waves detail */}
        {appWaves.length > 0 && (
          <div className="bg-gray-900 rounded-2xl border border-gray-700 p-6 space-y-3">
            <h2 className="text-lg font-semibold">Zugewiesene Wellen</h2>
            <div className="space-y-2">
              {appWaves.map((w) => (
                <div key={w.id} className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-xl border border-gray-700">
                  <Badge color="blue">{w.name}</Badge>
                  <span className="text-sm text-gray-400">{w.description}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Metadata */}
        <div className="text-xs text-gray-500 flex gap-4">
          <span>Erstellt: {new Date(app.createdAt).toLocaleDateString("de-DE")}</span>
          <span>Aktualisiert: {new Date(app.updatedAt).toLocaleDateString("de-DE")}</span>
        </div>
      </div>
    </div>
  );
}

function InfoCard({
  icon: Icon,
  label,
  value,
}: {
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="p-4 bg-gray-900 rounded-xl border border-gray-700">
      <div className="text-xs text-gray-400 mb-1 flex items-center gap-1">
        {Icon && <Icon size={12} className="text-gray-500" />}
        {label}
      </div>
      <div className="text-white font-medium">{value}</div>
    </div>
  );
}

function LinkRow({
  label,
  url,
  icon: Icon = ExternalLink,
}: {
  label: string;
  url: string;
  icon?: React.ComponentType<{ size?: number }>;
}) {
  if (!url) {
    return (
      <div className="flex items-center gap-3 text-sm">
        <span className="text-gray-500 w-40">{label}:</span>
        <span className="text-gray-600">–</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="text-gray-400 w-40">{label}:</span>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-400 hover:underline flex items-center gap-1"
      >
        <Icon size={14} /> {url}
      </a>
    </div>
  );
}
