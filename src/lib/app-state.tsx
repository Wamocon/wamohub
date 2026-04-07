"use client";

import {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
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
} from "@/types/domain";
import {
  initialUsers,
  demoProjects,
  initialGoals,
  initialNotes,
  initialMentorRelations,
  defaultChecklistTemplate,
  initialChecklistProgress,
  initialAssessments,
  initialMentorTasks,
  initialReflections,
  initialUrlaubRequests,
  initialTravelCosts,
  initialTimesheets,
  DEFAULT_LINKS,
  getUserPermissions,
  hasPermission,
  organizationProjects,
} from "@/lib/data";

interface AppState {
  // Auth (mock)
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
  allProjects: (Project | { id: string; name: string; description: string; status?: string })[];
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

  // UI state
  sidebarOpen: boolean;
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;

  // Derived
  myMentees: User[];
  myMentor: string | null;
  myMentorTasks: MentorTask[];
  myReflections: Reflection[];
  isAdmin: boolean;
  isMentor: boolean;
  isMentee: boolean;
}

const AppContext = createContext<AppState | null>(null);

export function useAppState(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppState must be used within AppProvider");
  return ctx;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeUserId, setActiveUserId] = useState("u1");
  const [module, setModule] = useState<ModuleName>("home");
  const [subModule, setSubModule] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [users, setUsers] = useState<User[]>(initialUsers);
  const [projects, setProjects] = useState<Project[]>(demoProjects);
  const [goals, setGoals] = useState<Goal[]>(initialGoals);
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [mentorRelations, setMentorRelations] = useState<MentorRelation[]>(initialMentorRelations);
  const [checklistTemplate, setChecklistTemplate] = useState<ChecklistTemplate>(defaultChecklistTemplate);
  const [checklistProgress, setChecklistProgress] = useState<ChecklistProgress[]>(initialChecklistProgress);
  const [assessments, setAssessments] = useState<Assessment[]>(initialAssessments);
  const [mentorTasks, setMentorTasks] = useState<MentorTask[]>(initialMentorTasks);
  const [reflections, setReflections] = useState<Reflection[]>(initialReflections);
  const [urlaubRequests, setUrlaubRequests] = useState<VacationRequest[]>(initialUrlaubRequests);
  const [travelCosts, setTravelCosts] = useState<TravelCost[]>(initialTravelCosts);
  const [timesheets, setTimesheets] = useState<Timesheet[]>(initialTimesheets);
  const [links, setLinks] = useState<Record<string, ExternalLink>>(DEFAULT_LINKS);

  const activeUser = useMemo(
    () => users.find((u) => u.id === activeUserId) ?? users[0],
    [users, activeUserId],
  );

  const userPermissions = useMemo(() => getUserPermissions(activeUser), [activeUser]);

  const myProjects = useMemo(
    () => projects.filter((p) => p.members.some((m) => m.userId === activeUser.id)),
    [projects, activeUser.id],
  );

  const allProjects = useMemo(() => {
    if (hasPermission(activeUser, "canViewAllProjects")) {
      return [...projects, ...organizationProjects];
    }
    return myProjects;
  }, [projects, activeUser, myProjects]);

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

  const isAdmin = hasPermission(activeUser, "canViewAdmin");
  const isMentor = hasPermission(activeUser, "canViewMentor");
  const isMentee = activeUser.roles.includes("Mentee");

  const login = useCallback((userId: string) => {
    setActiveUserId(userId);
    setIsLoggedIn(true);
  }, []);

  const logout = useCallback(() => {
    setIsLoggedIn(false);
    setModule("home");
    setSubModule(null);
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
    users,
    setUsers,
    projects,
    setProjects,
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
