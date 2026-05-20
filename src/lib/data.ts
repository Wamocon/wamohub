import type {
  User,
  RolePermissions,
  RoleName,
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
  Azubi: {
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
  Ausbilder: {
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
};

export function getUserPermissions(user: User): RolePermissions {
  const permissions: RolePermissions = { ...ROLE_PERMISSIONS.Mentee };
  for (const role of user.roles) {
    const rp = ROLE_PERMISSIONS[role];
    if (rp) {
      // Permissions are additive: once granted by any role, they cannot be revoked.
      for (const [key, value] of Object.entries(rp) as [keyof RolePermissions, boolean][]) {
        if (value === true) {
          permissions[key] = true;
        }
      }
    }
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
