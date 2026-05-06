"use client";

import {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import type {
  User,
  Project,
  Goal,
  Note,
  MentorRelation,
  ChecklistTemplate,
  ChecklistProgress,
  Assessment,
  MentorTask,
  Reflection,
  VacationRequest,
  TravelCost,
  ExternalLink,
  Timesheet,
  RolePermissions,
  ModuleName,
  OrganizationProject,
  WamoconWave,
  WamoconApp,
} from "@/types/domain";
import {
  getUserPermissions,
  hasPermission,
  ROLE_PERMISSIONS,
} from "@/lib/data";
import { fetchAllData } from "@/lib/actions";
import { signOutAction } from "@/lib/auth/actions";
import { createClient } from "@/lib/supabase/client";

const VALID_MODULES: ModuleName[] = [
  "home", "consultant", "organisation", "projekte", "mentor",
  "academy", "notizen", "sonstiges", "rbac", "approvals", "admin",
];

interface AppState {
  // Auth (simple user selection — Supabase data backend)
  isLoggedIn: boolean;
  activeUserId: string;
  activeUser: User;
  userPermissions: RolePermissions;
  login: (userId: string) => void;
  logout: () => void;

  // Navigation
  module: ModuleName;
  setModule: (m: ModuleName) => void;
  subModule: string | null;
  setSubModule: (s: string | null) => void;

  // Domain data
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  organizationProjects: OrganizationProject[];
  allProjects: (Project | OrganizationProject)[];
  myProjects: Project[];
  goals: Goal[];
  setGoals: React.Dispatch<React.SetStateAction<Goal[]>>;
  notes: Note[];
  setNotes: React.Dispatch<React.SetStateAction<Note[]>>;
  mentorRelations: MentorRelation[];
  setMentorRelations: React.Dispatch<React.SetStateAction<MentorRelation[]>>;
  checklistTemplate: ChecklistTemplate;
  setChecklistTemplate: React.Dispatch<React.SetStateAction<ChecklistTemplate>>;
  checklistProgress: ChecklistProgress[];
  setChecklistProgress: React.Dispatch<React.SetStateAction<ChecklistProgress[]>>;
  assessments: Assessment[];
  setAssessments: React.Dispatch<React.SetStateAction<Assessment[]>>;
  mentorTasks: MentorTask[];
  setMentorTasks: React.Dispatch<React.SetStateAction<MentorTask[]>>;
  reflections: Reflection[];
  setReflections: React.Dispatch<React.SetStateAction<Reflection[]>>;
  urlaubRequests: VacationRequest[];
  setUrlaubRequests: React.Dispatch<React.SetStateAction<VacationRequest[]>>;
  travelCosts: TravelCost[];
  setTravelCosts: React.Dispatch<React.SetStateAction<TravelCost[]>>;
  timesheets: Timesheet[];
  setTimesheets: React.Dispatch<React.SetStateAction<Timesheet[]>>;
  links: Record<string, ExternalLink>;
  setLinks: React.Dispatch<React.SetStateAction<Record<string, ExternalLink>>>;
  wamoconWaves: WamoconWave[];
  setWamoconWaves: React.Dispatch<React.SetStateAction<WamoconWave[]>>;
  wamoconApps: WamoconApp[];
  setWamoconApps: React.Dispatch<React.SetStateAction<WamoconApp[]>>;

  // UI state
  sidebarOpen: boolean;
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  dataLoading: boolean;
  dataError: string | null;
  refreshData: () => Promise<void>;

  // Derived
  myMentees: User[];
  myMentor: string | null;
  myMentorTasks: MentorTask[];
  myReflections: Reflection[];
  isAdmin: boolean;
  isMentor: boolean;
  isMentee: boolean;
}

const EMPTY_TEMPLATE: ChecklistTemplate = {
  id: "",
  fromLevel: "CONSULTANT",
  toLevel: "JUNIOR_MANAGER",
  items: [],
};

const AppContext = createContext<AppState | null>(null);

export function useAppState(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppState must be used within AppProvider");
  return ctx;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeUserId, setActiveUserId] = useState("");
  const [module, setModule] = useState<ModuleName>("home");
  const [subModule, setSubModule] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [dataLoading, setDataLoading] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);
  const initialLoadDone = useRef(false);

  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [organizationProjects, setOrganizationProjects] = useState<OrganizationProject[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [mentorRelations, setMentorRelations] = useState<MentorRelation[]>([]);
  const [checklistTemplate, setChecklistTemplate] = useState<ChecklistTemplate>(EMPTY_TEMPLATE);
  const [checklistProgress, setChecklistProgress] = useState<ChecklistProgress[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [mentorTasks, setMentorTasks] = useState<MentorTask[]>([]);
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [urlaubRequests, setUrlaubRequests] = useState<VacationRequest[]>([]);
  const [travelCosts, setTravelCosts] = useState<TravelCost[]>([]);
  const [timesheets, setTimesheets] = useState<Timesheet[]>([]);
  const [links, setLinks] = useState<Record<string, ExternalLink>>({});
  const [wamoconWaves, setWamoconWaves] = useState<WamoconWave[]>([]);
  const [wamoconApps, setWamoconApps] = useState<WamoconApp[]>([]);

  const loadData = useCallback(async () => {
    if (!initialLoadDone.current) {
      setDataLoading(true);
    }
    setDataError(null);
    try {
      const data = await fetchAllData();
      setUsers(data.users);
      setProjects(data.projects);
      setOrganizationProjects(data.organizationProjects);
      setGoals(data.goals);
      setNotes(data.notes);
      setMentorRelations(data.mentorRelations);
      setChecklistTemplate(data.checklistTemplate ?? EMPTY_TEMPLATE);
      setChecklistProgress(data.checklistProgress);
      setAssessments(data.assessments);
      setMentorTasks(data.mentorTasks);
      setReflections(data.reflections);
      setTimesheets(data.timesheets);
      setUrlaubRequests(data.urlaubRequests);
      setTravelCosts(data.travelCosts);
      setLinks(data.links);
      setWamoconWaves(data.wamoconWaves);
      setWamoconApps(data.wamoconApps);
      if (data.users.length > 0) {
        // Prefer Supabase auth session user over localStorage fallback.
        const sessionUserId = data.currentAppUserId;
        const storedUserId = typeof window !== "undefined" ? localStorage.getItem("relda_user_id") : null;
        const resolvedId = sessionUserId ?? (storedUserId && data.users.some((u) => u.id === storedUserId) ? storedUserId : null);
        if (resolvedId) {
          setActiveUserId(resolvedId);
          setIsLoggedIn(true);
          if (typeof window !== "undefined") {
            localStorage.setItem("relda_user_id", resolvedId);
          }
          // Restore module from hash
          const hash = typeof window !== "undefined" ? window.location.hash.replace("#", "") : "";
          if (hash && VALID_MODULES.includes(hash as ModuleName)) {
            setModule(hash as ModuleName);
          }
        } else {
          setActiveUserId((prev) => prev || data.users[0].id);
        }
      }
    } catch (err) {
      setDataError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      initialLoadDone.current = true;
      setDataLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  // Re-load when Supabase auth state changes (sign-in / sign-out).
  useEffect(() => {
    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        void loadData();
      } else if (event === "SIGNED_OUT") {
        setIsLoggedIn(false);
        setModule("home");
        if (typeof window !== "undefined") {
          localStorage.removeItem("relda_user_id");
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [loadData]);

  // Listen for external hash changes (e.g. browser back/forward, page.goto in tests)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onHashChange = () => {
      const hash = window.location.hash.replace("#", "");
      if (hash && VALID_MODULES.includes(hash as ModuleName)) {
        setModule(hash as ModuleName);
      }
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  // Sync module to URL hash
  useEffect(() => {
    if (isLoggedIn && typeof window !== "undefined") {
      window.location.hash = module;
    }
  }, [module, isLoggedIn]);

  const activeUser = useMemo(
    () => users.find((u) => u.id === activeUserId) ?? users[0] ?? { id: "", name: "", email: "", level: "PRAKTIKANT" as const, roles: ["Mentee" as const], cvFileUrl: "" },
    [users, activeUserId],
  );

  const userPermissions = useMemo(() => {
    if (!activeUser.id) return ROLE_PERMISSIONS.Mentee;
    return getUserPermissions(activeUser);
  }, [activeUser]);

  const myProjects = useMemo(
    () => projects.filter((p) => p.members.some((m) => m.userId === activeUser.id)),
    [projects, activeUser.id],
  );

  const allProjects = useMemo(() => {
    if (activeUser.id && hasPermission(activeUser, "canViewAllProjects")) {
      return [...projects, ...organizationProjects];
    }
    return myProjects;
  }, [projects, organizationProjects, activeUser, myProjects]);

  const myMentees = useMemo(
    () =>
      mentorRelations
        .filter((r) => r.mentorUserId === activeUser.id && r.active)
        .map((r) => users.find((u) => u.id === r.menteeUserId))
        .filter((u): u is User => !!u),
    [mentorRelations, activeUser.id, users],
  );

  const myMentor = useMemo(
    () =>
      mentorRelations.find((r) => r.menteeUserId === activeUser.id && r.active)
        ?.mentorUserId ?? null,
    [mentorRelations, activeUser.id],
  );

  const myMentorTasks = useMemo(
    () => mentorTasks.filter((t) => t.menteeUserId === activeUser.id),
    [mentorTasks, activeUser.id],
  );

  const myReflections = useMemo(
    () => reflections.filter((r) => r.menteeUserId === activeUser.id),
    [reflections, activeUser.id],
  );

  const isAdmin = activeUser.id ? hasPermission(activeUser, "canViewAdmin") : false;
  const isMentor = activeUser.id ? hasPermission(activeUser, "canViewMentor") : false;
  const isMentee = activeUser.roles?.includes("Mentee") ?? false;

  const login = useCallback((userId: string) => {
    setActiveUserId(userId);
    setIsLoggedIn(true);
    if (typeof window !== "undefined") {
      localStorage.setItem("relda_user_id", userId);
      window.location.hash = "home";
    }
  }, []);

  const logout = useCallback(() => {
    setIsLoggedIn(false);
    setModule("home");
    setSubModule(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("relda_user_id");
      window.location.hash = "";
    }
    void signOutAction().then(() => {
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    });
  }, []);

  const value: AppState = {
    isLoggedIn,
    activeUserId,
    activeUser,
    userPermissions,
    login,
    logout,
    module,
    setModule,
    subModule,
    setSubModule,
    sidebarOpen,
    setSidebarOpen,
    dataLoading,
    dataError,
    refreshData: loadData,
    users,
    setUsers,
    projects,
    setProjects,
    organizationProjects,
    allProjects,
    myProjects,
    goals,
    setGoals,
    notes,
    setNotes,
    mentorRelations,
    setMentorRelations,
    checklistTemplate,
    setChecklistTemplate,
    checklistProgress,
    setChecklistProgress,
    assessments,
    setAssessments,
    mentorTasks,
    setMentorTasks,
    reflections,
    setReflections,
    urlaubRequests,
    setUrlaubRequests,
    travelCosts,
    setTravelCosts,
    timesheets,
    setTimesheets,
    links,
    setLinks,
    wamoconWaves,
    setWamoconWaves,
    wamoconApps,
    setWamoconApps,
    myMentees,
    myMentor,
    myMentorTasks,
    myReflections,
    isAdmin,
    isMentor,
    isMentee,
  };

  return <AppContext value={value}>{children}</AppContext>;
}
