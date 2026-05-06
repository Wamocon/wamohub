"use client";

import { useState, useMemo } from "react";
import { Plus, Search, Trash2, Edit, ExternalLink, Waves, AppWindow, Filter, User } from "lucide-react";
import { useAppState } from "@/lib/app-state";
import { useI18n } from "@/lib/i18n";
import type { WamoconApp, WamoconWave, WamoconAppStatus } from "@/types/domain";
import { Badge, Button, Input, Textarea, Modal } from "@/components/ui";
import type { TranslationKey } from "@/lib/i18n";
import {
  createWamoconApp,
  updateWamoconApp,
  deleteWamoconApp as deleteWamoconAppAction,
  createWamoconWave,
  updateWamoconWave,
  deleteWamoconWave as deleteWamoconWaveAction,
} from "@/lib/actions";

const STATUS_COLORS: Record<WamoconAppStatus, string> = {
  PLANNED: "gray",
  IN_DEVELOPMENT: "blue",
  LIVE: "green",
  PAUSED: "yellow",
  CANCELLED: "red",
};

const STATUS_KEYS: Record<WamoconAppStatus, TranslationKey> = {
  PLANNED: "status.PLANNED",
  IN_DEVELOPMENT: "status.IN_DEVELOPMENT",
  LIVE: "status.LIVE",
  PAUSED: "status.PAUSED",
  CANCELLED: "status.CANCELLED",
};

const ALL_STATUSES: WamoconAppStatus[] = ["PLANNED", "IN_DEVELOPMENT", "LIVE", "PAUSED", "CANCELLED"];

interface AppFormData {
  name: string;
  projectOwnerId: string;
  category: string;
  industry: string;
  status: WamoconAppStatus;
  appUrl: string;
  landingPageUrl: string;
  onedriveUrl: string;
  description: string;
  waveIds: string[];
}

const EMPTY_FORM: AppFormData = {
  name: "",
  projectOwnerId: "",
  category: "",
  industry: "",
  status: "PLANNED",
  appUrl: "",
  landingPageUrl: "",
  onedriveUrl: "",
  description: "",
  waveIds: [],
};

interface WaveFormData {
  name: string;
  description: string;
}

export function WamoconAppsView() {
  const { wamoconWaves, wamoconApps, users, userPermissions, refreshData } = useAppState();
  const { t } = useI18n();
  const canManage = userPermissions.canViewAllProjects;
  const canDelete = userPermissions.canManageSystem === true;

  const [search, setSearch] = useState("");
  const [filterWaveId, setFilterWaveId] = useState<string>("all");
  const [filterOwnerId, setFilterOwnerId] = useState<string>("all");
  const [showAppModal, setShowAppModal] = useState(false);
  const [editingApp, setEditingApp] = useState<WamoconApp | null>(null);
  const [appForm, setAppForm] = useState<AppFormData>(EMPTY_FORM);

  const [showWaveModal, setShowWaveModal] = useState(false);
  const [editingWave, setEditingWave] = useState<WamoconWave | null>(null);
  const [waveForm, setWaveForm] = useState<WaveFormData>({ name: "", description: "" });

  const sortedWaves = useMemo(
    () => [...wamoconWaves].sort((a, b) => a.sortOrder - b.sortOrder),
    [wamoconWaves],
  );

  // Distinct owners for filter dropdown
  const ownerOptions = useMemo(() => {
    const ownerIds = new Set<string>();
    for (const app of wamoconApps) {
      if (app.projectOwnerId) ownerIds.add(app.projectOwnerId);
    }
    return users.filter((u) => ownerIds.has(u.id));
  }, [wamoconApps, users]);

  // Group apps by wave — an app appears in every wave it belongs to
  const appsByWave = useMemo(() => {
    const q = search.toLowerCase();
    const map = new Map<string, WamoconApp[]>();
    for (const wave of sortedWaves) {
      map.set(wave.id, []);
    }
    // Unassigned wave
    map.set("unassigned", []);

    for (const app of wamoconApps) {
      // search filter
      if (q && !app.name.toLowerCase().includes(q) && !app.category.toLowerCase().includes(q) && !app.industry.toLowerCase().includes(q) && !app.description.toLowerCase().includes(q)) {
        continue;
      }
      // owner filter
      if (filterOwnerId !== "all" && app.projectOwnerId !== filterOwnerId) {
        continue;
      }
      if (app.waveIds.length === 0) {
        map.get("unassigned")!.push(app);
      } else {
        for (const wid of app.waveIds) {
          map.get(wid)?.push(app);
        }
      }
    }
    return map;
  }, [wamoconApps, sortedWaves, search, filterOwnerId]);

  const wavesToShow = useMemo(() => {
    if (filterWaveId === "all") return sortedWaves;
    if (filterWaveId === "unassigned") return [];
    return sortedWaves.filter((w) => w.id === filterWaveId);
  }, [sortedWaves, filterWaveId]);

  const openCreateApp = () => {
    setAppForm(EMPTY_FORM);
    setEditingApp(null);
    setShowAppModal(true);
  };

  const openEditApp = (app: WamoconApp) => {
    setAppForm({
      name: app.name,
      projectOwnerId: app.projectOwnerId ?? "",
      category: app.category,
      industry: app.industry,
      status: app.status,
      appUrl: app.appUrl,
      landingPageUrl: app.landingPageUrl,
      onedriveUrl: app.onedriveUrl,
      description: app.description,
      waveIds: [...app.waveIds],
    });
    setEditingApp(app);
    setShowAppModal(true);
  };

  const saveApp = async () => {
    if (!appForm.name.trim()) return;
    try {
      if (editingApp) {
        await updateWamoconApp(editingApp.id, { ...appForm, projectOwnerId: appForm.projectOwnerId || null });
      } else {
        await createWamoconApp({ ...appForm, projectOwnerId: appForm.projectOwnerId || null });
      }
      setShowAppModal(false);
      setEditingApp(null);
      await refreshData();
    } catch (err) {
      console.error("Failed to save app:", err);
    }
  };

  const deleteApp = async (id: string) => {
    try {
      await deleteWamoconAppAction(id);
      await refreshData();
    } catch (err) {
      console.error("Failed to delete app:", err);
    }
  };

  const openCreateWave = () => {
    setWaveForm({ name: "", description: "" });
    setEditingWave(null);
    setShowWaveModal(true);
  };

  const openEditWave = (wave: WamoconWave) => {
    setWaveForm({ name: wave.name, description: wave.description });
    setEditingWave(wave);
    setShowWaveModal(true);
  };

  const saveWave = async () => {
    if (!waveForm.name.trim()) return;
    try {
      if (editingWave) {
        await updateWamoconWave(editingWave.id, { name: waveForm.name, description: waveForm.description });
      } else {
        const maxSort = sortedWaves.length > 0 ? Math.max(...sortedWaves.map((w) => w.sortOrder)) : 0;
        await createWamoconWave({ name: waveForm.name, description: waveForm.description, sortOrder: maxSort + 1 });
      }
      setShowWaveModal(false);
      setEditingWave(null);
      await refreshData();
    } catch (err) {
      console.error("Failed to save wave:", err);
    }
  };

  const deleteWave = async (id: string) => {
    try {
      await deleteWamoconWaveAction(id);
      await refreshData();
    } catch (err) {
      console.error("Failed to delete wave:", err);
    }
  };

  const toggleWaveInForm = (waveId: string) => {
    setAppForm((f) => ({
      ...f,
      waveIds: f.waveIds.includes(waveId) ? f.waveIds.filter((id) => id !== waveId) : [...f.waveIds, waveId],
    }));
  };

  const openAppDetail = (appId: string) => {
    // Use the opaque public_id (not the internal UUID) in the URL.
    const app = wamoconApps.find((a) => a.id === appId);
    if (!app) return;
    window.open(`/wamocon-app/${app.publicId}`, "_blank");
  };

  const getOwnerName = (ownerId: string | null) => {
    if (!ownerId) return "–";
    return users.find((u) => u.id === ownerId)?.name ?? ownerId;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input className="pl-9" placeholder={t("wamocon.searchApp")} value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-gray-400" />
          <select
            className="bg-gray-900 border border-gray-600 text-sm text-white rounded-lg px-2 py-2"
            value={filterWaveId}
            onChange={(e) => setFilterWaveId(e.target.value)}
          >
            <option value="all">{t("wamocon.allWaves")}</option>
            {sortedWaves.map((w) => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
            <option value="unassigned">{t("wamocon.noWave")}</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <User size={16} className="text-gray-400" />
          <select
            className="bg-gray-900 border border-gray-600 text-sm text-white rounded-lg px-2 py-2"
            value={filterOwnerId}
            onChange={(e) => setFilterOwnerId(e.target.value)}
          >
            <option value="all">{t("wamocon.allOwners")}</option>
            {ownerOptions.map((u) => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
        </div>
        {canManage && (
          <>
            <Button onClick={openCreateWave} variant="outline"><Waves size={14} /> {t("wamocon.newWave")}</Button>
            <Button onClick={openCreateApp} data-testid="wamocon-app-new"><Plus size={14} /> {t("wamocon.newApp")}</Button>
          </>
        )}
      </div>

      {/* Waves sections */}
      {wavesToShow.map((wave) => {
        const apps = appsByWave.get(wave.id) ?? [];
        return (
          <div key={wave.id} className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Waves size={18} className="text-red-500" />
                <h3 className="text-lg font-semibold text-white">{wave.name}</h3>
                <span className="text-xs text-gray-400">{wave.description}</span>
                <Badge color="gray">{apps.length} {t("wamocon.apps")}</Badge>
              </div>
              {canManage && (
                <div className="flex gap-1">
                  <button onClick={() => openEditWave(wave)} className="p-1.5 text-gray-300 hover:text-white rounded-lg hover:bg-gray-700 transition"><Edit size={14} /></button>
                  {canDelete && <button onClick={() => deleteWave(wave.id)} className="p-1.5 text-red-400 hover:text-red-300 rounded-lg hover:bg-gray-700 transition"><Trash2 size={14} /></button>}
                </div>
              )}
            </div>
            {apps.length === 0 ? (
              <div className="text-sm text-gray-500 ml-7">{t("wamocon.noAppsInWave")}</div>
            ) : (
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3 ml-7">
                {apps.map((app) => (
                  <AppCard
                    key={`${wave.id}-${app.id}`}
                    app={app}
                    waves={sortedWaves}
                    getOwnerName={getOwnerName}
                    canManage={canManage}
                    canDelete={canDelete}
                    onEdit={openEditApp}
                    onDelete={deleteApp}
                    onOpen={openAppDetail}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}

      {/* Unassigned section */}
      {(filterWaveId === "all" || filterWaveId === "unassigned") && (appsByWave.get("unassigned")?.length ?? 0) > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <AppWindow size={18} className="text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-400">{t("wamocon.noWave")}</h3>
            <Badge color="gray">{appsByWave.get("unassigned")!.length} {t("wamocon.apps")}</Badge>
          </div>
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3 ml-7">
            {appsByWave.get("unassigned")!.map((app) => (
              <AppCard
                key={`unassigned-${app.id}`}
                app={app}
                waves={sortedWaves}
                getOwnerName={getOwnerName}
                canManage={canManage}
                canDelete={canDelete}
                onEdit={openEditApp}
                onDelete={deleteApp}
                onOpen={openAppDetail}
              />
            ))}
          </div>
        </div>
      )}

      {/* App Create/Edit Modal */}
      {showAppModal && (
        <Modal open={true} title={editingApp ? t("wamocon.editApp") : t("wamocon.createApp")} onClose={() => { setShowAppModal(false); setEditingApp(null); }}>
          <div className="grid gap-3">
            <Input placeholder={`${t("app.name")} *`} value={appForm.name} onChange={(e) => setAppForm((f) => ({ ...f, name: e.target.value }))} data-testid="wamocon-app-name" />
            <div>
              <label className="text-xs text-gray-400 mb-1 block">{t("wamocon.owner")}</label>
              <select
                className="w-full bg-gray-800 border border-gray-600 text-sm text-white rounded-xl px-3 py-2"
                value={appForm.projectOwnerId}
                onChange={(e) => setAppForm((f) => ({ ...f, projectOwnerId: e.target.value }))}
              >
                <option value="">{t("wamocon.noOwner")}</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input placeholder={t("wamocon.category")} value={appForm.category} onChange={(e) => setAppForm((f) => ({ ...f, category: e.target.value }))} />
              <Input placeholder={t("wamocon.industry")} value={appForm.industry} onChange={(e) => setAppForm((f) => ({ ...f, industry: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">{t("wamocon.status")}</label>
              <select
                className="w-full bg-gray-800 border border-gray-600 text-sm text-white rounded-xl px-3 py-2"
                value={appForm.status}
                onChange={(e) => setAppForm((f) => ({ ...f, status: e.target.value as WamoconAppStatus }))}
              >
                {ALL_STATUSES.map((s) => (
                  <option key={s} value={s}>{t(STATUS_KEYS[s])}</option>
                ))}
              </select>
            </div>
            <Input placeholder={t("wamocon.appUrl")} value={appForm.appUrl} onChange={(e) => setAppForm((f) => ({ ...f, appUrl: e.target.value }))} />
            <Input placeholder={t("wamocon.landingUrl")} value={appForm.landingPageUrl} onChange={(e) => setAppForm((f) => ({ ...f, landingPageUrl: e.target.value }))} />
            <Input placeholder={t("wamocon.onedrive")} value={appForm.onedriveUrl} onChange={(e) => setAppForm((f) => ({ ...f, onedriveUrl: e.target.value }))} />
            <Textarea placeholder={t("wamocon.description")} rows={3} value={appForm.description} onChange={(e) => setAppForm((f) => ({ ...f, description: e.target.value }))} />
            <div>
              <label className="text-xs text-gray-400 mb-1 block">{t("wamocon.waves")}</label>
              <div className="flex flex-wrap gap-2">
                {sortedWaves.map((w) => (
                  <button
                    key={w.id}
                    type="button"
                    onClick={() => toggleWaveInForm(w.id)}
                    className={`px-3 py-1 text-sm rounded-full border transition ${
                      appForm.waveIds.includes(w.id)
                        ? "bg-red-600 border-red-500 text-white"
                        : "bg-gray-800 border-gray-600 text-gray-300 hover:border-gray-400"
                    }`}
                  >
                    {w.name}
                  </button>
                ))}
                {sortedWaves.length === 0 && <span className="text-xs text-gray-500">{t("wamocon.noWaves")}</span>}
              </div>
            </div>
            <Button onClick={saveApp} disabled={!appForm.name.trim()} data-testid="wamocon-app-submit">{t("wamocon.save")}</Button>
          </div>
        </Modal>
      )}

      {/* Wave Create/Edit Modal */}
      {showWaveModal && (
        <Modal open={true} title={editingWave ? t("wamocon.editWave") : t("wamocon.createWave")} onClose={() => { setShowWaveModal(false); setEditingWave(null); }}>
          <div className="grid gap-3">
            <Input placeholder={t("wamocon.waveName")} value={waveForm.name} onChange={(e) => setWaveForm((f) => ({ ...f, name: e.target.value }))} />
            <Textarea placeholder={t("wamocon.description")} rows={2} value={waveForm.description} onChange={(e) => setWaveForm((f) => ({ ...f, description: e.target.value }))} />
            <Button onClick={saveWave} disabled={!waveForm.name.trim()}>{t("wamocon.save")}</Button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function AppCard({
  app,
  waves,
  getOwnerName,
  canManage,
  canDelete,
  onEdit,
  onDelete,
  onOpen,
}: {
  app: WamoconApp;
  waves: WamoconWave[];
  getOwnerName: (id: string | null) => string;
  canManage: boolean;
  canDelete: boolean;
  onEdit: (app: WamoconApp) => void;
  onDelete: (id: string) => void;
  onOpen: (id: string) => void;
}) {
  const { t } = useI18n();
  return (
    <div className="p-4 bg-gray-800/50 border border-gray-700 rounded-2xl space-y-2 hover:border-gray-500 transition">
      <div className="flex items-start justify-between gap-2">
        <button onClick={() => onOpen(app.id)} className="text-left group">
          <div className="font-semibold text-white flex items-center gap-2 group-hover:text-red-400 transition">
            <AppWindow size={16} /> {app.name}
            <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition" />
          </div>
        </button>
        <div className="flex gap-1 shrink-0">
          <Badge color={STATUS_COLORS[app.status]}>{t(STATUS_KEYS[app.status])}</Badge>
          {canManage && <button onClick={() => onEdit(app)} className="p-1 text-gray-300 hover:text-white rounded-lg hover:bg-gray-700 transition"><Edit size={14} /></button>}
          {canDelete && <button onClick={() => onDelete(app.id)} className="p-1 text-red-400 hover:text-red-300 rounded-lg hover:bg-gray-700 transition"><Trash2 size={14} /></button>}
        </div>
      </div>
      <div className="text-xs text-gray-400 space-y-0.5">
        <div><span className="text-gray-500">{t("wamocon.responsible")}</span> {getOwnerName(app.projectOwnerId)}</div>
        {app.category && <div><span className="text-gray-500">{t("wamocon.category")}:</span> {app.category}</div>}
        {app.industry && <div><span className="text-gray-500">{t("wamocon.industry")}:</span> {app.industry}</div>}
      </div>
      {app.waveIds.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {app.waveIds.map((wid) => {
            const w = waves.find((wave) => wave.id === wid);
            return w ? <Badge key={wid} color="blue">{w.name}</Badge> : null;
          })}
        </div>
      )}
      {app.description && <div className="text-sm text-gray-300 line-clamp-2">{app.description}</div>}
    </div>
  );
}
