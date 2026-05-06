"use server";

import { createClient } from "@/lib/supabase/server";
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
  Timesheet,
  VacationRequest,
  TravelCost,
  ExternalLink,
  OrganizationProject,
  WamoconWave,
  WamoconApp,
} from "@/types/domain";

// ---------------------------------------------------------------------------
// Helper: map snake_case DB rows to camelCase domain types
// ---------------------------------------------------------------------------

function mapUser(row: Record<string, unknown>): User {
  return {
    id: row.id as string,
    name: row.name as string,
    email: row.email as string,
    level: row.level as User["level"],
    roles: row.roles as User["roles"],
    cvFileUrl: (row.cv_file_url as string) ?? "",
    isActive: (row.is_active as boolean) ?? true,
  };
}

function mapProject(row: Record<string, unknown>, members: { userId: string; roleLabel: string }[]): Project {
  return {
    id: row.id as string,
    name: row.name as string,
    ownerUserId: row.owner_user_id as string,
    description: (row.description as string) ?? "",
    targetDate: (row.target_date as string) ?? "",
    jiraUrl: (row.jira_url as string) ?? "",
    members,
    createdBy: row.created_by as string,
    createdAt: new Date(row.created_at as string).getTime(),
    updatedAt: new Date(row.updated_at as string).getTime(),
  };
}

function mapGoal(row: Record<string, unknown>): Goal {
  return {
    id: row.id as string,
    ownerUserId: row.owner_user_id as string,
    createdBy: row.created_by as Goal["createdBy"],
    title: row.title as string,
    description: (row.description as string) ?? "",
    status: row.status as Goal["status"],
    createdAt: new Date(row.created_at as string).getTime(),
  };
}

function mapNote(row: Record<string, unknown>): Note {
  return {
    id: row.id as string,
    ownerUserId: row.owner_user_id as string,
    scope: row.scope as Note["scope"],
    refId: (row.ref_id as string) ?? null,
    visibility: row.visibility as Note["visibility"],
    body: (row.body as string) ?? "",
    createdAt: new Date(row.created_at as string).getTime(),
  };
}

function mapMentorRelation(row: Record<string, unknown>): MentorRelation {
  return {
    mentorUserId: row.mentor_user_id as string,
    menteeUserId: row.mentee_user_id as string,
    since: new Date(row.since as string).getTime(),
    active: row.active as boolean,
  };
}

function mapMentorTask(row: Record<string, unknown>): MentorTask {
  return {
    id: row.id as string,
    menteeUserId: row.mentee_user_id as string,
    mentorUserId: row.mentor_user_id as string,
    title: row.title as string,
    description: (row.description as string) ?? "",
    dueDate: (row.due_date as string) ?? "",
    status: row.status as MentorTask["status"],
    priority: row.priority as MentorTask["priority"],
    createdAt: new Date(row.created_at as string).getTime(),
  };
}

function mapReflection(row: Record<string, unknown>): Reflection {
  return {
    id: row.id as string,
    menteeUserId: row.mentee_user_id as string,
    mentorUserId: row.mentor_user_id as string,
    title: row.title as string,
    description: (row.description as string) ?? "",
    status: row.status as Reflection["status"],
    dueDate: (row.due_date as string) ?? "",
    createdAt: new Date(row.created_at as string).getTime(),
  };
}

function mapTimesheet(row: Record<string, unknown>): Timesheet {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    projectId: row.project_id as string,
    date: row.date as string,
    hours: Number(row.hours),
    description: (row.description as string) ?? "",
    taskType: row.task_type as Timesheet["taskType"],
    status: row.status as Timesheet["status"],
    submittedAt: row.submitted_at ? new Date(row.submitted_at as string).getTime() : null,
    reviewedBy: (row.reviewed_by as string) ?? null,
    reviewedAt: row.reviewed_at ? new Date(row.reviewed_at as string).getTime() : null,
    createdAt: new Date(row.created_at as string).getTime(),
  };
}

function mapVacationRequest(row: Record<string, unknown>): VacationRequest {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    startDate: row.start_date as string,
    endDate: row.end_date as string,
    days: Number(row.days),
    reason: (row.reason as string) ?? "",
    status: row.status as VacationRequest["status"],
    submittedAt: new Date(row.submitted_at as string).getTime(),
    reviewedBy: (row.reviewed_by as string) ?? null,
    reviewedAt: row.reviewed_at ? new Date(row.reviewed_at as string).getTime() : null,
    comments: (row.comments as string) ?? "",
  };
}

function mapTravelCost(row: Record<string, unknown>): TravelCost {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    date: row.date as string,
    amount: Number(row.amount),
    description: (row.description as string) ?? "",
    category: row.category as TravelCost["category"],
    status: row.status as TravelCost["status"],
    submittedAt: new Date(row.submitted_at as string).getTime(),
    reviewedBy: (row.reviewed_by as string) ?? null,
    reviewedAt: row.reviewed_at ? new Date(row.reviewed_at as string).getTime() : null,
    comments: (row.comments as string) ?? "",
  };
}

function mapAssessment(row: Record<string, unknown>): Assessment {
  return {
    id: row.id as string,
    menteeUserId: row.mentee_user_id as string,
    targetLevel: row.target_level as Assessment["targetLevel"],
    status: row.status as Assessment["status"],
    mentorConfirmedAt: row.mentor_confirmed_at ? new Date(row.mentor_confirmed_at as string).getTime() : null,
  };
}

function mapChecklistProgress(row: Record<string, unknown>): ChecklistProgress {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    templateId: row.template_id as string,
    itemId: row.item_id as string,
    status: row.status as ChecklistProgress["status"],
    notes: (row.notes as string[]) ?? [],
  };
}

function mapOrgProject(row: Record<string, unknown>): OrganizationProject {
  return {
    id: row.id as string,
    name: row.name as string,
    description: (row.description as string) ?? "",
    status: (row.status as string) ?? "",
    visibility: (row.visibility as string) ?? "",
    startDate: (row.start_date as string) ?? "",
    endDate: (row.end_date as string) ?? "",
  };
}

function mapWamoconWave(row: Record<string, unknown>): WamoconWave {
  return {
    id: row.id as string,
    name: row.name as string,
    description: (row.description as string) ?? "",
    sortOrder: Number(row.sort_order ?? 0),
    createdAt: new Date(row.created_at as string).getTime(),
  };
}

function mapWamoconApp(row: Record<string, unknown>, waveIds: string[]): WamoconApp {
  return {
    id: row.id as string,
    publicId: (row.public_id as string) ?? "",
    name: row.name as string,
    projectOwnerId: (row.project_owner_id as string) ?? null,
    category: (row.category as string) ?? "",
    industry: (row.industry as string) ?? "",
    status: row.status as WamoconApp["status"],
    appUrl: (row.app_url as string) ?? "",
    landingPageUrl: (row.landing_page_url as string) ?? "",
    onedriveUrl: (row.onedrive_url as string) ?? "",
    description: (row.description as string) ?? "",
    waveIds,
    createdAt: new Date(row.created_at as string).getTime(),
    updatedAt: new Date(row.updated_at as string).getTime(),
  };
}

// ---------------------------------------------------------------------------
// FETCH ALL DATA (initial load)
// ---------------------------------------------------------------------------

export async function fetchAllData() {
  const supabase = await createClient();

  const [
    { data: usersData },
    { data: projectsData },
    { data: membersData },
    { data: orgProjectsData },
    { data: goalsData },
    { data: notesData },
    { data: relationsData },
    { data: templatesData },
    { data: itemsData },
    { data: progressData },
    { data: assessmentsData },
    { data: tasksData },
    { data: reflectionsData },
    { data: timesheetsData },
    { data: vacationsData },
    { data: travelData },
    { data: linksData },
    { data: wavesData },
    { data: wamoconAppsData },
    { data: appWavesData },
  ] = await Promise.all([
    supabase.from("users").select("*").order("name"),
    supabase.from("projects").select("*").order("name"),
    supabase.from("project_members").select("*"),
    supabase.from("organization_projects").select("*").order("name"),
    supabase.from("goals").select("*").order("created_at", { ascending: false }),
    supabase.from("notes").select("*").order("created_at", { ascending: false }),
    supabase.from("mentor_relations").select("*"),
    supabase.from("checklist_templates").select("*"),
    supabase.from("checklist_items").select("*").order("sort_order"),
    supabase.from("checklist_progress").select("*"),
    supabase.from("assessments").select("*"),
    supabase.from("mentor_tasks").select("*").order("created_at", { ascending: false }),
    supabase.from("reflections").select("*").order("created_at", { ascending: false }),
    supabase.from("timesheets").select("*").order("date", { ascending: false }),
    supabase.from("vacation_requests").select("*").order("submitted_at", { ascending: false }),
    supabase.from("travel_costs").select("*").order("submitted_at", { ascending: false }),
    supabase.from("external_links").select("*"),
    supabase.from("wamocon_waves").select("*").order("sort_order"),
    supabase.from("wamocon_apps").select("*").order("name"),
    supabase.from("wamocon_app_waves").select("*"),
  ]);

  const membersByProject = new Map<string, { userId: string; roleLabel: string }[]>();
  for (const m of membersData ?? []) {
    const pid = m.project_id as string;
    if (!membersByProject.has(pid)) membersByProject.set(pid, []);
    membersByProject.get(pid)!.push({ userId: m.user_id as string, roleLabel: (m.role_label as string) ?? "" });
  }

  const users = (usersData ?? []).map(mapUser);
  const projects = (projectsData ?? []).map((p) =>
    mapProject(p, membersByProject.get(p.id as string) ?? []),
  );
  const organizationProjects = (orgProjectsData ?? []).map(mapOrgProject);
  const goals = (goalsData ?? []).map(mapGoal);
  const notes = (notesData ?? []).map(mapNote);
  const mentorRelations = (relationsData ?? []).map(mapMentorRelation);
  const mentorTasks = (tasksData ?? []).map(mapMentorTask);
  const reflections = (reflectionsData ?? []).map(mapReflection);
  const timesheets = (timesheetsData ?? []).map(mapTimesheet);
  const urlaubRequests = (vacationsData ?? []).map(mapVacationRequest);
  const travelCosts = (travelData ?? []).map(mapTravelCost);
  const assessments = (assessmentsData ?? []).map(mapAssessment);
  const checklistProgress = (progressData ?? []).map(mapChecklistProgress);

  // Build checklist template with items
  const tmpl = (templatesData ?? [])[0];
  const checklistTemplate: ChecklistTemplate | null = tmpl
    ? {
        id: tmpl.id as string,
        fromLevel: tmpl.from_level as ChecklistTemplate["fromLevel"],
        toLevel: tmpl.to_level as ChecklistTemplate["toLevel"],
        items: (itemsData ?? [])
          .filter((i) => i.template_id === tmpl.id)
          .map((i) => ({
            id: i.id as string,
            label: i.label as string,
            description: (i.description as string) ?? "",
          })),
      }
    : null;

  // Build links map
  const links: Record<string, ExternalLink> = {};
  for (const l of linksData ?? []) {
    const key = l.key as string;
    links[key] = { key, url: (l.url as string) ?? "", label: (l.label as string) ?? "" };
  }

  // Build wamocon wave/app data
  const waveIdsByApp = new Map<string, string[]>();
  for (const aw of appWavesData ?? []) {
    const appId = aw.app_id as string;
    if (!waveIdsByApp.has(appId)) waveIdsByApp.set(appId, []);
    waveIdsByApp.get(appId)!.push(aw.wave_id as string);
  }

  const wamoconWaves = (wavesData ?? []).map(mapWamoconWave);
  const wamoconApps = (wamoconAppsData ?? []).map((a) =>
    mapWamoconApp(a, waveIdsByApp.get(a.id as string) ?? []),
  );

  // Determine which app-user corresponds to the current Supabase auth session.
  const { data: { user: authUser } } = await supabase.auth.getUser();
  let currentAppUserId: string | null = null;
  if (authUser) {
    const matching = (usersData ?? []).find(
      (u) => (u.auth_user_id as string | null) === authUser.id,
    );
    currentAppUserId = (matching?.id as string) ?? null;
  }

  return {
    users,
    projects,
    organizationProjects,
    goals,
    notes,
    mentorRelations,
    checklistTemplate,
    checklistProgress,
    assessments,
    mentorTasks,
    reflections,
    timesheets,
    urlaubRequests,
    travelCosts,
    links,
    wamoconWaves,
    wamoconApps,
    currentAppUserId,
  };
}

// ---------------------------------------------------------------------------
// CRUD ACTIONS
// ---------------------------------------------------------------------------

// --- Users ---
export async function createUser(data: Omit<User, "id">) {
  const supabase = await createClient();
  const { data: row, error } = await supabase
    .from("users")
    .insert({ name: data.name, email: data.email, level: data.level, roles: data.roles, cv_file_url: data.cvFileUrl })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return mapUser(row);
}

export async function updateUser(id: string, data: Partial<Omit<User, "id">>) {
  const supabase = await createClient();
  const update: Record<string, unknown> = {};
  if (data.name !== undefined) update.name = data.name;
  if (data.email !== undefined) update.email = data.email;
  if (data.level !== undefined) update.level = data.level;
  if (data.roles !== undefined) update.roles = data.roles;
  if (data.cvFileUrl !== undefined) update.cv_file_url = data.cvFileUrl;
  const { error } = await supabase.from("users").update(update).eq("id", id);
  if (error) throw new Error(error.message);
}

// --- Projects ---
export async function createProject(data: { name: string; ownerUserId: string; description: string; targetDate: string; jiraUrl: string; createdBy: string; members: { userId: string; roleLabel: string }[] }) {
  const supabase = await createClient();
  const { data: row, error } = await supabase
    .from("projects")
    .insert({ name: data.name, owner_user_id: data.ownerUserId, description: data.description, target_date: data.targetDate || null, jira_url: data.jiraUrl, created_by: data.createdBy })
    .select()
    .single();
  if (error) throw new Error(error.message);
  if (data.members.length > 0) {
    const { error: mError } = await supabase.from("project_members").insert(
      data.members.map((m) => ({ project_id: row.id, user_id: m.userId, role_label: m.roleLabel })),
    );
    if (mError) throw new Error(mError.message);
  }
  return row.id as string;
}

export async function updateProject(id: string, data: Partial<{ name: string; description: string; targetDate: string; jiraUrl: string }>) {
  const supabase = await createClient();
  const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (data.name !== undefined) update.name = data.name;
  if (data.description !== undefined) update.description = data.description;
  if (data.targetDate !== undefined) update.target_date = data.targetDate || null;
  if (data.jiraUrl !== undefined) update.jira_url = data.jiraUrl;
  const { error } = await supabase.from("projects").update(update).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function updateProjectMembers(projectId: string, members: { userId: string; roleLabel: string }[]) {
  const supabase = await createClient();
  await supabase.from("project_members").delete().eq("project_id", projectId);
  if (members.length > 0) {
    const { error } = await supabase.from("project_members").insert(
      members.map((m) => ({ project_id: projectId, user_id: m.userId, role_label: m.roleLabel })),
    );
    if (error) throw new Error(error.message);
  }
}

export async function deleteProject(id: string) {
  const supabase = await createClient();
  await supabase.from("project_members").delete().eq("project_id", id);
  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

// --- Goals ---
export async function createGoal(data: Omit<Goal, "id" | "createdAt">) {
  const supabase = await createClient();
  const { data: row, error } = await supabase
    .from("goals")
    .insert({ owner_user_id: data.ownerUserId, created_by: data.createdBy, title: data.title, description: data.description, status: data.status })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return mapGoal(row);
}

export async function updateGoal(id: string, data: Partial<{ title: string; description: string; status: string }>) {
  const supabase = await createClient();
  const { error } = await supabase.from("goals").update(data).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deleteGoal(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("goals").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

// --- Notes ---
export async function createNote(data: Omit<Note, "id" | "createdAt">) {
  const supabase = await createClient();
  const { data: row, error } = await supabase
    .from("notes")
    .insert({ owner_user_id: data.ownerUserId, scope: data.scope, ref_id: data.refId, visibility: data.visibility, body: data.body })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return mapNote(row);
}

export async function updateNote(id: string, data: Partial<{ body: string; scope: string; visibility: string }>) {
  const supabase = await createClient();
  const { error } = await supabase.from("notes").update(data).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deleteNote(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("notes").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

// --- Mentor Relations ---
export async function createMentorRelation(data: { mentorUserId: string; menteeUserId: string }) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("mentor_relations")
    .insert({ mentor_user_id: data.mentorUserId, mentee_user_id: data.menteeUserId });
  if (error) throw new Error(error.message);
}

export async function updateMentorRelation(mentorUserId: string, menteeUserId: string, active: boolean) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("mentor_relations")
    .update({ active })
    .eq("mentor_user_id", mentorUserId)
    .eq("mentee_user_id", menteeUserId);
  if (error) throw new Error(error.message);
}

// --- Mentor Tasks ---
export async function createMentorTask(data: Omit<MentorTask, "id" | "createdAt">) {
  const supabase = await createClient();
  const { data: row, error } = await supabase
    .from("mentor_tasks")
    .insert({ mentee_user_id: data.menteeUserId, mentor_user_id: data.mentorUserId, title: data.title, description: data.description, due_date: data.dueDate || null, status: data.status, priority: data.priority })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return mapMentorTask(row);
}

export async function updateMentorTask(id: string, data: Partial<{ title: string; description: string; dueDate: string; status: string; priority: string }>) {
  const supabase = await createClient();
  const update: Record<string, unknown> = {};
  if (data.title !== undefined) update.title = data.title;
  if (data.description !== undefined) update.description = data.description;
  if (data.dueDate !== undefined) update.due_date = data.dueDate || null;
  if (data.status !== undefined) update.status = data.status;
  if (data.priority !== undefined) update.priority = data.priority;
  const { error } = await supabase.from("mentor_tasks").update(update).eq("id", id);
  if (error) throw new Error(error.message);
}

// --- Reflections ---
export async function createReflection(data: Omit<Reflection, "id" | "createdAt">) {
  const supabase = await createClient();
  const { data: row, error } = await supabase
    .from("reflections")
    .insert({ mentee_user_id: data.menteeUserId, mentor_user_id: data.mentorUserId, title: data.title, description: data.description, status: data.status, due_date: data.dueDate || null })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return mapReflection(row);
}

export async function updateReflection(id: string, data: Partial<{ title: string; description: string; status: string; dueDate: string }>) {
  const supabase = await createClient();
  const update: Record<string, unknown> = {};
  if (data.title !== undefined) update.title = data.title;
  if (data.description !== undefined) update.description = data.description;
  if (data.status !== undefined) update.status = data.status;
  if (data.dueDate !== undefined) update.due_date = data.dueDate || null;
  const { error } = await supabase.from("reflections").update(update).eq("id", id);
  if (error) throw new Error(error.message);
}

// --- Timesheets ---
export async function createTimesheet(data: Omit<Timesheet, "id" | "createdAt" | "submittedAt" | "reviewedBy" | "reviewedAt">) {
  const supabase = await createClient();
  const { data: row, error } = await supabase
    .from("timesheets")
    .insert({ user_id: data.userId, project_id: data.projectId, date: data.date, hours: data.hours, description: data.description, task_type: data.taskType, status: data.status })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return mapTimesheet(row);
}

export async function updateTimesheet(id: string, data: Partial<{ hours: number; description: string; taskType: string; status: string; reviewedBy: string }>) {
  const supabase = await createClient();
  const update: Record<string, unknown> = {};
  if (data.hours !== undefined) update.hours = data.hours;
  if (data.description !== undefined) update.description = data.description;
  if (data.taskType !== undefined) update.task_type = data.taskType;
  if (data.status !== undefined) {
    update.status = data.status;
    if (data.status === "SUBMITTED") update.submitted_at = new Date().toISOString();
    if (data.status === "APPROVED" || data.status === "REJECTED") {
      update.reviewed_at = new Date().toISOString();
      if (data.reviewedBy) update.reviewed_by = data.reviewedBy;
    }
  }
  const { error } = await supabase.from("timesheets").update(update).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deleteTimesheet(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("timesheets").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

// --- Vacation Requests ---
export async function createVacationRequest(data: Omit<VacationRequest, "id" | "submittedAt" | "reviewedBy" | "reviewedAt" | "comments"> & { comments?: string }) {
  const supabase = await createClient();
  const { data: row, error } = await supabase
    .from("vacation_requests")
    .insert({ user_id: data.userId, start_date: data.startDate, end_date: data.endDate, days: data.days, reason: data.reason, status: data.status, comments: data.comments ?? "" })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return mapVacationRequest(row);
}

export async function updateVacationRequest(id: string, data: Partial<{ status: string; reviewedBy: string; comments: string }>) {
  const supabase = await createClient();
  const update: Record<string, unknown> = {};
  if (data.status !== undefined) update.status = data.status;
  if (data.reviewedBy !== undefined) update.reviewed_by = data.reviewedBy;
  if (data.comments !== undefined) update.comments = data.comments;
  if (data.status === "APPROVED" || data.status === "REJECTED") {
    update.reviewed_at = new Date().toISOString();
  }
  const { error } = await supabase.from("vacation_requests").update(update).eq("id", id);
  if (error) throw new Error(error.message);
}

// --- Travel Costs ---
export async function createTravelCost(data: Omit<TravelCost, "id" | "submittedAt" | "reviewedBy" | "reviewedAt" | "comments"> & { comments?: string }) {
  const supabase = await createClient();
  const { data: row, error } = await supabase
    .from("travel_costs")
    .insert({ user_id: data.userId, date: data.date, amount: data.amount, description: data.description, category: data.category, status: data.status, comments: data.comments ?? "" })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return mapTravelCost(row);
}

export async function updateTravelCost(id: string, data: Partial<{ status: string; reviewedBy: string; comments: string }>) {
  const supabase = await createClient();
  const update: Record<string, unknown> = {};
  if (data.status !== undefined) update.status = data.status;
  if (data.reviewedBy !== undefined) update.reviewed_by = data.reviewedBy;
  if (data.comments !== undefined) update.comments = data.comments;
  if (data.status === "APPROVED" || data.status === "REJECTED") {
    update.reviewed_at = new Date().toISOString();
  }
  const { error } = await supabase.from("travel_costs").update(update).eq("id", id);
  if (error) throw new Error(error.message);
}

// --- Assessments ---
export async function updateAssessment(id: string, data: Partial<{ status: string }>) {
  const supabase = await createClient();
  const update: Record<string, unknown> = {};
  if (data.status !== undefined) {
    update.status = data.status;
    if (data.status === "MENTOR_CONFIRMED") update.mentor_confirmed_at = new Date().toISOString();
  }
  const { error } = await supabase.from("assessments").update(update).eq("id", id);
  if (error) throw new Error(error.message);
}

// --- Checklist Progress ---
export async function updateChecklistProgress(id: string, data: Partial<{ status: string; notes: string[] }>) {
  const supabase = await createClient();
  const { error } = await supabase.from("checklist_progress").update(data).eq("id", id);
  if (error) throw new Error(error.message);
}

// --- External Links ---
export async function updateExternalLink(key: string, data: Partial<{ url: string; label: string }>) {
  const supabase = await createClient();
  const { error } = await supabase.from("external_links").update(data).eq("key", key);
  if (error) throw new Error(error.message);
}

export async function createExternalLink(data: ExternalLink) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("external_links")
    .insert({ key: data.key, url: data.url, label: data.label });
  if (error) throw new Error(error.message);
}

// --- Wamocon Waves ---
export async function createWamoconWave(data: { name: string; description: string; sortOrder: number }) {
  const supabase = await createClient();
  const { data: row, error } = await supabase
    .from("wamocon_waves")
    .insert({ name: data.name, description: data.description, sort_order: data.sortOrder })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return mapWamoconWave(row);
}

export async function updateWamoconWave(id: string, data: Partial<{ name: string; description: string; sortOrder: number }>) {
  const supabase = await createClient();
  const update: Record<string, unknown> = {};
  if (data.name !== undefined) update.name = data.name;
  if (data.description !== undefined) update.description = data.description;
  if (data.sortOrder !== undefined) update.sort_order = data.sortOrder;
  const { error } = await supabase.from("wamocon_waves").update(update).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deleteWamoconWave(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("wamocon_waves").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

// --- Wamocon Apps ---
export async function createWamoconApp(data: { name: string; projectOwnerId: string | null; category: string; industry: string; status: string; appUrl: string; landingPageUrl: string; onedriveUrl: string; description: string; waveIds: string[] }) {
  const supabase = await createClient();
  const { data: row, error } = await supabase
    .from("wamocon_apps")
    .insert({ name: data.name, project_owner_id: data.projectOwnerId, category: data.category, industry: data.industry, status: data.status, app_url: data.appUrl, landing_page_url: data.landingPageUrl, onedrive_url: data.onedriveUrl, description: data.description })
    .select()
    .single();
  if (error) throw new Error(error.message);
  if (data.waveIds.length > 0) {
    const { error: wError } = await supabase.from("wamocon_app_waves").insert(
      data.waveIds.map((wid) => ({ app_id: row.id, wave_id: wid })),
    );
    if (wError) throw new Error(wError.message);
  }
  return mapWamoconApp(row, data.waveIds);
}

export async function updateWamoconApp(id: string, data: Partial<{ name: string; projectOwnerId: string | null; category: string; industry: string; status: string; appUrl: string; landingPageUrl: string; onedriveUrl: string; description: string; waveIds: string[] }>) {
  const supabase = await createClient();
  const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (data.name !== undefined) update.name = data.name;
  if (data.projectOwnerId !== undefined) update.project_owner_id = data.projectOwnerId;
  if (data.category !== undefined) update.category = data.category;
  if (data.industry !== undefined) update.industry = data.industry;
  if (data.status !== undefined) update.status = data.status;
  if (data.appUrl !== undefined) update.app_url = data.appUrl;
  if (data.landingPageUrl !== undefined) update.landing_page_url = data.landingPageUrl;
  if (data.onedriveUrl !== undefined) update.onedrive_url = data.onedriveUrl;
  if (data.description !== undefined) update.description = data.description;
  const { error } = await supabase.from("wamocon_apps").update(update).eq("id", id);
  if (error) throw new Error(error.message);
  if (data.waveIds !== undefined) {
    await supabase.from("wamocon_app_waves").delete().eq("app_id", id);
    if (data.waveIds.length > 0) {
      const { error: wError } = await supabase.from("wamocon_app_waves").insert(
        data.waveIds.map((wid) => ({ app_id: id, wave_id: wid })),
      );
      if (wError) throw new Error(wError.message);
    }
  }
}

export async function deleteWamoconApp(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("wamocon_apps").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

// --- Fetch single Wamocon App by opaque public_id (for detail page) ---
export async function fetchWamoconAppByPublicId(publicId: string) {
  const supabase = await createClient();
  // 1. Resolve public_id -> internal UUID (single round-trip).
  const { data: appRow, error: appError } = await supabase
    .from("wamocon_apps")
    .select("*")
    .eq("public_id", publicId)
    .maybeSingle();
  if (appError || !appRow) return null;
  const appId = appRow.id as string;

  const [{ data: wavesData }, { data: appWavesData }, { data: usersData }] = await Promise.all([
    supabase.from("wamocon_waves").select("*").order("sort_order"),
    supabase.from("wamocon_app_waves").select("*").eq("app_id", appId),
    supabase.from("users").select("id, name").order("name"),
  ]);
  const waveIds = (appWavesData ?? []).map((aw) => aw.wave_id as string);
  const app = mapWamoconApp(appRow, waveIds);
  const waves = (wavesData ?? []).map(mapWamoconWave);
  const users = (usersData ?? []).map((u) => ({ id: u.id as string, name: u.name as string }));
  return { app, waves, users };
}

export async function deleteExternalLink(key: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("external_links").delete().eq("key", key);
  if (error) throw new Error(error.message);
}
