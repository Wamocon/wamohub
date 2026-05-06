"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

export type Locale = "de" | "en";

const translations = {
  // App-wide
  "app.name": { de: "RELDA", en: "RELDA" },
  "app.tagline": { de: "Quality & Testing Command Center", en: "Quality & Testing Command Center" },
  "app.loading": { de: "Daten werden geladen…", en: "Loading data…" },
  "app.connectionError": { de: "Verbindungsfehler", en: "Connection Error" },
  "app.supabaseHint": { de: "Stelle sicher, dass die lokale Supabase läuft:", en: "Make sure local Supabase is running:" },

  // Login
  "login.selectUser": { de: "Benutzer auswählen", en: "Select User" },
  "login.chooseUser": { de: "Benutzer wählen…", en: "Choose a user…" },
  "login.button": { de: "Anmelden bei RELDA", en: "Login to RELDA" },
  "login.loggingIn": { de: "Anmeldung…", en: "Logging in…" },
  "login.demoUsers": { de: "Verfügbare Demo-Benutzer:", en: "Demo Users Available:" },

  // Topbar
  "topbar.welcome": { de: "Willkommen,", en: "Welcome," },
  "topbar.globalSearch": { de: "Globale Suche…", en: "Global search…" },
  "topbar.notifications": { de: "Benachrichtigungen", en: "Notifications" },
  "topbar.logout": { de: "Abmelden", en: "Logout" },

  // Sidebar
  "nav.overview": { de: "Übersicht", en: "Overview" },
  "nav.consultant": { de: "Consultant", en: "Consultant" },
  "nav.organization": { de: "Organisation", en: "Organization" },
  "nav.projects": { de: "Projekte", en: "Projects" },
  "nav.mentor": { de: "Mentor", en: "Mentor" },
  "nav.academy": { de: "Academy", en: "Academy" },
  "nav.notes": { de: "Notizen", en: "Notes" },
  "nav.misc": { de: "Sonstiges", en: "Miscellaneous" },
  "nav.quickActions": { de: "Quick Actions", en: "Quick Actions" },
  "nav.newProject": { de: "Neues Projekt", en: "New Project" },
  "nav.logTime": { de: "Zeit erfassen", en: "Log Time" },
  "nav.usersRoles": { de: "Benutzer & Rollen", en: "Users & Roles" },
  "nav.approvals": { de: "Genehmigungen", en: "Approvals" },
  "nav.adminSettings": { de: "Admin/Einstellungen", en: "Admin/Settings" },

  // Module titles
  "module.home": { de: "Dashboard", en: "Dashboard" },
  "module.consultant": { de: "Mein Bereich", en: "My Area" },
  "module.projekte": { de: "Projekte", en: "Projects" },
  "module.mentor": { de: "Mentoring", en: "Mentoring" },
  "module.organisation": { de: "Organisation", en: "Organization" },
  "module.admin": { de: "Administration", en: "Administration" },
  "module.approvals": { de: "Genehmigungen", en: "Approvals" },
  "module.rbac": { de: "Administration", en: "Administration" },
  "module.notizen": { de: "Notizen", en: "Notes" },
  "module.academy": { de: "Academy", en: "Academy" },
  "module.sonstiges": { de: "Sonstiges", en: "Miscellaneous" },

  // Projects tab
  "projects.tab.projects": { de: "Projekte", en: "Projects" },
  "projects.tab.wamocon": { de: "WAMOCON 50 Apps", en: "WAMOCON 50 Apps" },
  "projects.search": { de: "Projekt suchen …", en: "Search project …" },
  "projects.newProject": { de: "Neues Projekt", en: "New Project" },
  "projects.noResults": { de: "Keine Projekte gefunden.", en: "No projects found." },
  "projects.members": { de: "Mitglieder", en: "Members" },
  "projects.addMember": { de: "Mitglied hinzufügen …", en: "Add member …" },
  "projects.edit": { de: "Projekt bearbeiten", en: "Edit Project" },
  "projects.create": { de: "Neues Projekt", en: "New Project" },
  "projects.name": { de: "Projektname", en: "Project Name" },
  "projects.description": { de: "Beschreibung", en: "Description" },
  "projects.jiraUrl": { de: "Jira URL (optional)", en: "Jira URL (optional)" },
  "projects.targetDate": { de: "Zieldatum", en: "Target Date" },
  "projects.save": { de: "Speichern", en: "Save" },

  // WAMOCON Apps
  "wamocon.searchApp": { de: "App suchen …", en: "Search app …" },
  "wamocon.allWaves": { de: "Alle Wellen", en: "All Waves" },
  "wamocon.noWave": { de: "Ohne Welle", en: "No Wave" },
  "wamocon.allOwners": { de: "Alle Verantwortlichen", en: "All Owners" },
  "wamocon.newWave": { de: "Neue Welle", en: "New Wave" },
  "wamocon.newApp": { de: "Neue App", en: "New App" },
  "wamocon.noAppsInWave": { de: "Keine Apps in dieser Welle.", en: "No apps in this wave." },
  "wamocon.apps": { de: "Apps", en: "Apps" },
  "wamocon.editApp": { de: "App bearbeiten", en: "Edit App" },
  "wamocon.createApp": { de: "Neue App", en: "New App" },
  "wamocon.owner": { de: "Projektverantwortlicher", en: "Project Owner" },
  "wamocon.noOwner": { de: "– Kein Verantwortlicher –", en: "– No Owner –" },
  "wamocon.category": { de: "Kategorie", en: "Category" },
  "wamocon.industry": { de: "Branche", en: "Industry" },
  "wamocon.status": { de: "Status", en: "Status" },
  "wamocon.appUrl": { de: "App-URL", en: "App URL" },
  "wamocon.landingUrl": { de: "Landingpage-URL", en: "Landing Page URL" },
  "wamocon.onedrive": { de: "Ablage OneDrive", en: "OneDrive Storage" },
  "wamocon.description": { de: "Beschreibung", en: "Description" },
  "wamocon.waves": { de: "Welle(n)", en: "Wave(s)" },
  "wamocon.noWaves": { de: "Keine Wellen vorhanden. Erstelle zuerst eine Welle.", en: "No waves available. Create a wave first." },
  "wamocon.save": { de: "Speichern", en: "Save" },
  "wamocon.editWave": { de: "Welle bearbeiten", en: "Edit Wave" },
  "wamocon.createWave": { de: "Neue Welle", en: "New Wave" },
  "wamocon.waveName": { de: "Name der Welle *", en: "Wave Name *" },
  "wamocon.responsible": { de: "Verantwortlich:", en: "Owner:" },

  // Status labels
  "status.PLANNED": { de: "Geplant", en: "Planned" },
  "status.IN_DEVELOPMENT": { de: "In Entwicklung", en: "In Development" },
  "status.LIVE": { de: "Live", en: "Live" },
  "status.PAUSED": { de: "Pausiert", en: "Paused" },
  "status.CANCELLED": { de: "Abgebrochen", en: "Cancelled" },

  // Detail page
  "detail.back": { de: "Zurück", en: "Back" },
  "detail.links": { de: "Links", en: "Links" },
  "detail.description": { de: "Beschreibung", en: "Description" },
  "detail.noDescription": { de: "Keine Beschreibung vorhanden.", en: "No description available." },
  "detail.assignedWaves": { de: "Zugewiesene Wellen", en: "Assigned Waves" },
  "detail.noWaveAssigned": { de: "Keine Welle zugewiesen", en: "No wave assigned" },
  "detail.created": { de: "Erstellt:", en: "Created:" },
  "detail.updated": { de: "Aktualisiert:", en: "Updated:" },
  "detail.notFound": { de: "App nicht gefunden", en: "App not found" },
  "detail.notFoundDesc": { de: "Die angeforderte WAMOCON App existiert nicht.", en: "The requested WAMOCON App does not exist." },

  // Theme
  "theme.light": { de: "Hell", en: "Light" },
  "theme.dark": { de: "Dunkel", en: "Dark" },
} as const;

export type TranslationKey = keyof typeof translations;

interface I18nState {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: TranslationKey) => string;
}

const I18nContext = createContext<I18nState | null>(null);

export function useI18n(): I18nState {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>("de");

  const t = useCallback(
    (key: TranslationKey): string => {
      const entry = translations[key];
      return entry?.[locale] ?? key;
    },
    [locale],
  );

  return (
    <I18nContext value={{ locale, setLocale, t }}>
      {children}
    </I18nContext>
  );
}
