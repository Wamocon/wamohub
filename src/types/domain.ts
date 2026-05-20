// RELDA Domain Types — migrated from SIT JavaScript to strict TypeScript

export type Level =
  | "PRAKTIKANT"
  | "JUNIOR_CONSULTANT"
  | "CONSULTANT"
  | "JUNIOR_MANAGER"
  | "MANAGER"
  | "SENIOR_MANAGER"
  | "ADMIN";

export type RoleName = "Mentee" | "Mentor" | "Admin" | "Azubi" | "Ausbilder";

export interface User {
  id: string;
  name: string;
  email: string;
  level: Level;
  roles: RoleName[];
  cvFileUrl: string;
  isActive: boolean;
}

export interface RolePermissions {
  canViewAllProjects: boolean;
  canViewOrganization: boolean;
  canCreateNotes: boolean;
  canViewOwnGoals: boolean;
  canViewMentorGoals: boolean;
  canSubmitAssessment: boolean;
  canViewTimesheet: boolean;
  canLogTime: boolean;
  canViewAcademy: boolean;
  canViewMentor: boolean;
  canViewAdmin: boolean;
  canManageUsers: boolean;
  canAssignMentors: boolean;
  canViewAllData: boolean;
  canAssignTasks?: boolean;
  canTriggerReflection?: boolean;
  canViewMenteeProgress?: boolean;
  canCreateMentorGoals?: boolean;
  canApproveAssessments?: boolean;
  canManageSystem?: boolean;
  canConfigureLinks?: boolean;
  canManageTemplates?: boolean;
}

export interface MentorRelation {
  mentorUserId: string;
  menteeUserId: string;
  since: number;
  active: boolean;
}

export interface ProjectMember {
  userId: string;
  roleLabel: string;
}

export interface Project {
  id: string;
  name: string;
  ownerUserId: string;
  description: string;
  targetDate: string;
  jiraUrl: string;
  members: ProjectMember[];
  createdBy: string;
  createdAt: number;
  updatedAt: number;
}

export interface OrganizationProject {
  id: string;
  name: string;
  description: string;
  status: string;
  visibility: string;
  startDate: string;
  endDate: string;
}

export type GoalCreator = "SELF" | "MENTOR";
export type GoalStatus = "OPEN" | "IN_PROGRESS" | "DONE";

export interface Goal {
  id: string;
  ownerUserId: string;
  createdBy: GoalCreator;
  title: string;
  description: string;
  status: GoalStatus;
  createdAt: number;
}

export type NoteScope = "GENERAL" | "PROJECT" | "GOAL" | "MENTEE_PRIVATE";
export type NoteVisibility = "PRIVATE_SELF" | "PRIVATE_MENTOR";

export interface Note {
  id: string;
  ownerUserId: string;
  scope: NoteScope;
  refId: string | null;
  visibility: NoteVisibility;
  body: string;
  createdAt: number;
}

export interface ChecklistItem {
  id: string;
  label: string;
  description: string;
}

export interface ChecklistTemplate {
  id: string;
  fromLevel: Level;
  toLevel: Level;
  items: ChecklistItem[];
}

export type ChecklistProgressStatus = "OPEN" | "PROVEN" | "REVIEWED" | "APPROVED";

export interface ChecklistProgress {
  id: string;
  userId: string;
  templateId: string;
  itemId: string;
  status: ChecklistProgressStatus;
  notes: string[];
}

export type AssessmentStatus = "DRAFT" | "SUBMITTED" | "MENTOR_CONFIRMED" | "FAILED";

export interface Assessment {
  id: string;
  menteeUserId: string;
  targetLevel: Level;
  status: AssessmentStatus;
  mentorConfirmedAt: number | null;
}

export type TaskPriority = "LOW" | "MEDIUM" | "HIGH";
export type TaskStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "APPROVED" | "REJECTED";

export interface MentorTask {
  id: string;
  menteeUserId: string;
  mentorUserId: string;
  title: string;
  description: string;
  dueDate: string;
  status: TaskStatus;
  priority: TaskPriority;
  createdAt: number;
}

export type ReflectionStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED";

export interface Reflection {
  id: string;
  menteeUserId: string;
  mentorUserId: string;
  title: string;
  description: string;
  status: ReflectionStatus;
  dueDate: string;
  createdAt: number;
}

export type TimesheetStatus = "DRAFT" | "SUBMITTED" | "APPROVED" | "REJECTED";
export type TimesheetTaskType =
  | "Testing"
  | "Development"
  | "Management"
  | "Documentation"
  | "Training"
  | "Meeting"
  | "Other";

export interface Timesheet {
  id: string;
  userId: string;
  projectId: string;
  date: string;
  hours: number;
  description: string;
  taskType: TimesheetTaskType;
  status: TimesheetStatus;
  submittedAt: number | null;
  reviewedBy: string | null;
  reviewedAt: number | null;
  createdAt: number;
}

export type VacationStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface VacationRequest {
  id: string;
  userId: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: VacationStatus;
  submittedAt: number;
  reviewedBy: string | null;
  reviewedAt: number | null;
  comments: string;
}

export type TravelCostCategory = "Transportation" | "Accommodation" | "Meals" | "Other";

export interface TravelCost {
  id: string;
  userId: string;
  date: string;
  amount: number;
  description: string;
  category: TravelCostCategory;
  status: VacationStatus;
  submittedAt: number;
  reviewedBy: string | null;
  reviewedAt: number | null;
  comments: string;
}

export interface ExternalLink {
  key: string;
  url: string;
  label: string;
}

export type ModuleName =
  | "home"
  | "consultant"
  | "organisation"
  | "projekte"
  | "mentor"
  | "academy"
  | "notizen"
  | "sonstiges"
  | "rbac"
  | "approvals"
  | "admin";

// ---------------------------------------------------------------------------
// WAMOCON 50 Apps
// ---------------------------------------------------------------------------

export type WamoconAppStatus = "PLANNED" | "IN_DEVELOPMENT" | "LIVE" | "PAUSED" | "CANCELLED";

export interface WamoconWave {
  id: string;
  name: string;
  description: string;
  sortOrder: number;
  createdAt: number;
}

export interface WamoconApp {
  id: string;
  /** Opaque, URL-safe ID used in user-facing routes (`/wamocon-app/[publicId]`).
   *  Internal UUID `id` is never exposed to the client. */
  publicId: string;
  name: string;
  projectOwnerId: string | null;
  category: string;
  industry: string;
  status: WamoconAppStatus;
  appUrl: string;
  landingPageUrl: string;
  onedriveUrl: string;
  description: string;
  waveIds: string[];
  createdAt: number;
  updatedAt: number;
}
