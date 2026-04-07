import type {
  User,
  RolePermissions,
  RoleName,
  MentorRelation,
  Project,
  OrganizationProject,
  Goal,
  Note,
  ChecklistTemplate,
  ChecklistProgress,
  Assessment,
  MentorTask,
  Reflection,
  VacationRequest,
  TravelCost,
  ExternalLink,
  Timesheet,
} from "@/types/domain";

// ---------------------------------------------------------------------------
// Role-Based Permissions
// ---------------------------------------------------------------------------

export const ROLE_PERMISSIONS: Record<RoleName, RolePermissions> = {
  Mentee: {
    canViewAllProjects: true,
    canViewOrganization: true,
    canCreateNotes: true,
    canViewOwnGoals: true,
    canViewMentorGoals: true,
    canSubmitAssessment: true,
    canViewTimesheet: true,
    canLogTime: true,
    canViewAcademy: true,
    canViewMentor: false,
    canViewAdmin: false,
    canManageUsers: false,
    canAssignMentors: false,
    canViewAllData: false,
  },
  Mentor: {
    canViewAllProjects: true,
    canViewOrganization: true,
    canCreateNotes: true,
    canViewOwnGoals: true,
    canViewMentorGoals: true,
    canSubmitAssessment: true,
    canViewTimesheet: true,
    canLogTime: true,
    canViewAcademy: true,
    canViewMentor: true,
    canViewAdmin: false,
    canManageUsers: false,
    canAssignMentors: false,
    canViewAllData: false,
    canAssignTasks: true,
    canTriggerReflection: true,
    canViewMenteeProgress: true,
    canCreateMentorGoals: true,
    canApproveAssessments: true,
  },
  Admin: {
    canViewAllProjects: true,
    canViewOrganization: true,
    canCreateNotes: true,
    canViewOwnGoals: true,
    canViewMentorGoals: true,
    canSubmitAssessment: true,
    canViewTimesheet: true,
    canLogTime: true,
    canViewAcademy: true,
    canViewMentor: true,
    canViewAdmin: true,
    canManageUsers: true,
    canAssignMentors: true,
    canViewAllData: true,
    canAssignTasks: true,
    canTriggerReflection: true,
    canViewMenteeProgress: true,
    canCreateMentorGoals: true,
    canApproveAssessments: true,
    canManageSystem: true,
    canConfigureLinks: true,
    canManageTemplates: true,
  },
};

export function getUserPermissions(user: User): RolePermissions {
  const permissions: RolePermissions = { ...ROLE_PERMISSIONS.Mentee };
  for (const role of user.roles) {
    const rp = ROLE_PERMISSIONS[role];
    if (rp) Object.assign(permissions, rp);
  }
  return permissions;
}

export function hasPermission(
  user: User,
  permission: keyof RolePermissions,
): boolean {
  return getUserPermissions(user)[permission] === true;
}

export function canAccessModule(
  user: User,
  mod: "mentor" | "admin" | "rbac",
): boolean {
  switch (mod) {
    case "mentor":
      return hasPermission(user, "canViewMentor");
    case "admin":
    case "rbac":
      return hasPermission(user, "canViewAdmin");
    default:
      return true;
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export const LEVELS = [
  "PRAKTIKANT",
  "JUNIOR_CONSULTANT",
  "CONSULTANT",
  "JUNIOR_MANAGER",
  "MANAGER",
  "SENIOR_MANAGER",
  "ADMIN",
] as const;

export const TASK_TYPES = [
  "Testing",
  "Development",
  "Management",
  "Documentation",
  "Training",
  "Meeting",
  "Other",
] as const;

export function formatLevel(lvl: string): string {
  return lvl
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/(^|\s)\S/g, (t) => t.toUpperCase());
}

export function shortId(): string {
  return Math.random().toString(36).slice(2, 9);
}

export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

// ---------------------------------------------------------------------------
// Mock Data — serves as placeholder until Supabase integration (Phase 3)
// ---------------------------------------------------------------------------

export const initialUsers: User[] = [
  {
    id: "u1",
    name: "Alice Mentee",
    email: "alice@example.com",
    level: "CONSULTANT",
    roles: ["Mentee"],
    cvFileUrl: "https://files.example.com/cv/alice.pdf",
  },
  {
    id: "u2",
    name: "Bob Mentor",
    email: "bob@example.com",
    level: "MANAGER",
    roles: ["Mentor"],
    cvFileUrl: "https://files.example.com/cv/bob.pdf",
  },
  {
    id: "u3",
    name: "Chris Admin",
    email: "admin@example.com",
    level: "ADMIN",
    roles: ["Admin"],
    cvFileUrl: "https://files.example.com/cv/chris.pdf",
  },
];

export const demoProjects: Project[] = [
  {
    id: "p1",
    name: "QA Transformation ACME",
    ownerUserId: "u2",
    description: "Teststrategie & Automatisierung einführen",
    targetDate: "2025-12-31",
    jiraUrl: "https://jira.example.com/browse/ACME",
    members: [
      { userId: "u2", roleLabel: "Projektleiter" },
      { userId: "u1", roleLabel: "Testautomatisierer" },
    ],
    createdBy: "u2",
    createdAt: Date.now() - 86400000 * 10,
    updatedAt: Date.now() - 86400000 * 3,
  },
  {
    id: "p2",
    name: "SAP Testmanagement",
    ownerUserId: "u3",
    description: "Einführung Testprozesse für SAP S/4",
    targetDate: "2026-03-31",
    jiraUrl: "",
    members: [
      { userId: "u3", roleLabel: "Sponsor" },
      { userId: "u1", roleLabel: "Tester" },
    ],
    createdBy: "u3",
    createdAt: Date.now() - 86400000 * 30,
    updatedAt: Date.now() - 86400000 * 2,
  },
  {
    id: "p3",
    name: "Mobile App Testing",
    ownerUserId: "u1",
    description: "Comprehensive testing for new mobile application",
    targetDate: "2025-08-15",
    jiraUrl: "https://jira.example.com/browse/MOBILE",
    members: [
      { userId: "u1", roleLabel: "Lead Tester" },
      { userId: "u2", roleLabel: "Test Manager" },
    ],
    createdBy: "u1",
    createdAt: Date.now() - 86400000 * 20,
    updatedAt: Date.now() - 86400000 * 2,
  },
];

export const organizationProjects: OrganizationProject[] = [
  {
    id: "org1",
    name: "Company Digital Transformation",
    description: "Organization-wide digital transformation initiative",
    status: "ACTIVE",
    visibility: "ORGANIZATION",
    startDate: "2025-01-01",
    endDate: "2025-12-31",
  },
  {
    id: "org2",
    name: "Quality Standards Implementation",
    description: "Implement new quality standards across all projects",
    status: "PLANNING",
    visibility: "ORGANIZATION",
    startDate: "2025-03-01",
    endDate: "2025-08-31",
  },
];

export const initialGoals: Goal[] = [
  {
    id: "g1",
    ownerUserId: "u1",
    createdBy: "SELF",
    title: "CTFL Zertifizierung",
    description: "Prüfung Q4 bestehen",
    status: "IN_PROGRESS",
    createdAt: Date.now() - 1000000,
  },
  {
    id: "g2",
    ownerUserId: "u1",
    createdBy: "MENTOR",
    title: "Projektleitung übernehmen",
    description: "Teilprojekt im ACME Projekt",
    status: "OPEN",
    createdAt: Date.now() - 2000000,
  },
];

export const initialNotes: Note[] = [
  {
    id: "n1",
    ownerUserId: "u1",
    scope: "GENERAL",
    refId: null,
    visibility: "PRIVATE_SELF",
    body: "Ideen für Testdatenstrategie notieren.",
    createdAt: Date.now() - 500000,
  },
  {
    id: "n2",
    ownerUserId: "u1",
    scope: "PROJECT",
    refId: "p1",
    visibility: "PRIVATE_SELF",
    body: "Smoke-Tests für Checkout priorisieren.",
    createdAt: Date.now() - 150000,
  },
  {
    id: "n3",
    ownerUserId: "u3",
    scope: "MENTEE_PRIVATE",
    refId: "u1",
    visibility: "PRIVATE_MENTOR",
    body: "Alice: Sehr proaktiv, Fokus auf CTFL unterstützen.",
    createdAt: Date.now() - 250000,
  },
];

export const initialMentorRelations: MentorRelation[] = [
  {
    mentorUserId: "u2",
    menteeUserId: "u1",
    since: Date.now() - 86400000 * 120,
    active: true,
  },
];

export const defaultChecklistTemplate: ChecklistTemplate = {
  id: "ct1",
  fromLevel: "CONSULTANT",
  toLevel: "JUNIOR_MANAGER",
  items: [
    {
      id: "i1",
      label: "CTFL bestanden",
      description: "Zertifikat nachweisen",
    },
    {
      id: "i2",
      label: "Projektleitungserfahrung (3 Monate)",
      description: "Rolle und Ergebnis dokumentiert",
    },
    {
      id: "i3",
      label: "Community-Beitrag",
      description: "Mind. 1 interner Talk/Artikel",
    },
  ],
};

export const initialChecklistProgress: ChecklistProgress[] = [
  {
    id: "cp1",
    userId: "u1",
    templateId: "ct1",
    itemId: "i1",
    status: "PROVEN",
    notes: ["Anmeldung 15.10"],
  },
  {
    id: "cp2",
    userId: "u1",
    templateId: "ct1",
    itemId: "i2",
    status: "OPEN",
    notes: [],
  },
  {
    id: "cp3",
    userId: "u1",
    templateId: "ct1",
    itemId: "i3",
    status: "OPEN",
    notes: [],
  },
];

export const initialAssessments: Assessment[] = [
  {
    id: "a1",
    menteeUserId: "u1",
    targetLevel: "JUNIOR_MANAGER",
    status: "DRAFT",
    mentorConfirmedAt: null,
  },
];

export const initialMentorTasks: MentorTask[] = [
  {
    id: "mt1",
    menteeUserId: "u1",
    mentorUserId: "u2",
    title: "Complete CTFL certification",
    description: "Study and pass the CTFL exam by end of Q2",
    dueDate: "2025-06-30",
    status: "PENDING",
    priority: "HIGH",
    createdAt: Date.now() - 86400000 * 7,
  },
  {
    id: "mt2",
    menteeUserId: "u1",
    mentorUserId: "u2",
    title: "Lead a project retrospective",
    description: "Facilitate a retrospective meeting for the ACME project",
    dueDate: "2025-02-15",
    status: "IN_PROGRESS",
    priority: "MEDIUM",
    createdAt: Date.now() - 86400000 * 3,
  },
];

export const initialReflections: Reflection[] = [
  {
    id: "r1",
    menteeUserId: "u1",
    mentorUserId: "u2",
    title: "Q1 Performance Review",
    description:
      "Reflect on your performance and growth in Q1",
    status: "PENDING",
    dueDate: "2025-03-31",
    createdAt: Date.now() - 86400000 * 5,
  },
  {
    id: "r2",
    menteeUserId: "u1",
    mentorUserId: "u2",
    title: "CTFL Certification Progress",
    description:
      "Review progress on CTFL certification preparation",
    status: "IN_PROGRESS",
    dueDate: "2025-04-15",
    createdAt: Date.now() - 86400000 * 3,
  },
];

export const initialUrlaubRequests: VacationRequest[] = [
  {
    id: "ur1",
    userId: "u1",
    startDate: "2025-03-15",
    endDate: "2025-03-22",
    days: 6,
    reason: "Family vacation",
    status: "PENDING",
    submittedAt: Date.now() - 86400000 * 2,
    reviewedBy: null,
    reviewedAt: null,
    comments: "",
  },
  {
    id: "ur2",
    userId: "u2",
    startDate: "2025-04-01",
    endDate: "2025-04-03",
    days: 3,
    reason: "Medical appointment",
    status: "APPROVED",
    submittedAt: Date.now() - 86400000 * 5,
    reviewedBy: "u3",
    reviewedAt: Date.now() - 86400000,
    comments: "Approved for medical reasons",
  },
];

export const initialTravelCosts: TravelCost[] = [
  {
    id: "tc1",
    userId: "u1",
    date: "2025-01-15",
    amount: 45.5,
    description: "Train ticket to client meeting",
    category: "Transportation",
    status: "PENDING",
    submittedAt: Date.now() - 86400000,
    reviewedBy: null,
    reviewedAt: null,
    comments: "",
  },
  {
    id: "tc2",
    userId: "u2",
    date: "2025-01-14",
    amount: 89.0,
    description: "Hotel accommodation for training",
    category: "Accommodation",
    status: "APPROVED",
    submittedAt: Date.now() - 86400000 * 3,
    reviewedBy: "u3",
    reviewedAt: Date.now() - 86400000,
    comments: "Approved for training purposes",
  },
];

export const initialTimesheets: Timesheet[] = [
  {
    id: "ts1",
    userId: "u1",
    projectId: "p1",
    date: "2025-01-15",
    hours: 8,
    description: "QA Testing for ACME project",
    taskType: "Testing",
    status: "SUBMITTED",
    submittedAt: Date.now() - 86400000 * 3,
    reviewedBy: null,
    reviewedAt: null,
    createdAt: Date.now() - 86400000 * 5,
  },
  {
    id: "ts2",
    userId: "u1",
    projectId: "p2",
    date: "2025-01-14",
    hours: 6,
    description: "SAP Test case development",
    taskType: "Development",
    status: "DRAFT",
    submittedAt: null,
    reviewedBy: null,
    reviewedAt: null,
    createdAt: Date.now() - 86400000 * 6,
  },
];

export const DEFAULT_LINKS: Record<string, ExternalLink> = {
  STARTSMART: {
    key: "STARTSMART",
    url: "https://example.com/startsmart",
    label: "StartSmart",
  },
  DITELE: {
    key: "DITELE",
    url: "https://ditele.example.com",
    label: "DiTele Platform",
  },
  FIAE: {
    key: "FIAE",
    url: "https://fiae.example.com",
    label: "FIAE Platform",
  },
  TISCHKICKER: {
    key: "TISCHKICKER",
    url: "https://example.com/tischkicker",
    label: "Tischkicker-App",
  },
  QUICKWIN: {
    key: "QUICKWIN",
    url: "https://example.com/quickwin",
    label: "QuickWin Buch App",
  },
};
