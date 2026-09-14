import { and, asc, desc, eq, ilike, sql } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { Router, type IRouter } from "express";
import {
  db,
  pmActivityTable,
  pmMembersTable,
  pmProjectsTable,
  pmTasksTable,
} from "@workspace/db";
import {
  CreateProjectBody,
  CreateProjectResponse,
  CreateTaskBody,
  CreateTaskResponse,
  DeleteProjectParams,
  DeleteTaskParams,
  GetDashboardSummaryResponse,
  GetProjectParams,
  GetProjectResponse,
  GetTaskParams,
  GetTaskResponse,
  ListActivityQueryParams,
  ListActivityResponse,
  ListMembersResponse,
  ListProjectsQueryParams,
  ListProjectsResponse,
  ListTasksQueryParams,
  ListTasksResponse,
  UpdateProjectBody,
  UpdateProjectParams,
  UpdateProjectResponse,
  UpdateTaskBody,
  UpdateTaskParams,
  UpdateTaskResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

function iso(date: Date) {
  return date.toISOString();
}

function serializeMember(member: typeof pmMembersTable.$inferSelect) {
  return {
    id: member.id,
    name: member.name,
    email: member.email,
    initials: member.initials,
    color: member.color,
  };
}

function taskProgress(tasks: Array<{ progress: number }>) {
  if (!tasks.length) return 0;
  return Math.round(tasks.reduce((sum, task) => sum + task.progress, 0) / tasks.length);
}

async function getProjectPayload(projectId: string) {
  const [project] = await db.select().from(pmProjectsTable).where(eq(pmProjectsTable.id, projectId));
  if (!project) return null;

  const tasks = await db.select().from(pmTasksTable).where(eq(pmTasksTable.projectId, projectId));
  return {
    id: project.id,
    name: project.name,
    description: project.description,
    status: project.status,
    priority: project.priority,
    startDate: project.startDate,
    dueDate: project.dueDate,
    progress: taskProgress(tasks),
    taskCount: tasks.length,
    completedTaskCount: tasks.filter((task) => task.status === "done").length,
    memberIds: project.memberIds ?? [],
    createdAt: iso(project.createdAt),
    updatedAt: iso(project.updatedAt),
  };
}

async function getTaskPayload(taskId: string) {
  const [row] = await db
    .select({ task: pmTasksTable, member: pmMembersTable })
    .from(pmTasksTable)
    .leftJoin(pmMembersTable, eq(pmMembersTable.id, pmTasksTable.assigneeId))
    .where(eq(pmTasksTable.id, taskId));
  if (!row) return null;

  return {
    id: row.task.id,
    projectId: row.task.projectId,
    title: row.task.title,
    description: row.task.description,
    status: row.task.status,
    priority: row.task.priority,
    assigneeId: row.task.assigneeId,
    assignee: row.member ? serializeMember(row.member) : null,
    deadline: row.task.deadline,
    progress: row.task.progress,
    createdAt: iso(row.task.createdAt),
    updatedAt: iso(row.task.updatedAt),
  };
}

async function addActivity(input: {
  kind: "project_created" | "project_updated" | "task_created" | "task_updated" | "task_completed";
  message: string;
  projectId: string;
  taskId?: string | null;
}) {
  await db.insert(pmActivityTable).values({
    id: randomUUID(),
    kind: input.kind,
    message: input.message,
    projectId: input.projectId,
    taskId: input.taskId ?? null,
  });
}

router.get("/projects", async (req, res): Promise<void> => {
  const parsed = ListProjectsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const conditions = [];
  if (parsed.data.status) conditions.push(eq(pmProjectsTable.status, parsed.data.status));
  if (parsed.data.search) conditions.push(ilike(pmProjectsTable.name, `%${parsed.data.search}%`));

  const projects = await db
    .select()
    .from(pmProjectsTable)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(pmProjectsTable.updatedAt));
  const payload = await Promise.all(projects.map((project) => getProjectPayload(project.id)));
  res.json(ListProjectsResponse.parse(payload.filter(Boolean)));
});

router.post("/projects", async (req, res): Promise<void> => {
  const parsed = CreateProjectBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const id = randomUUID();
  await db.insert(pmProjectsTable).values({
    id,
    name: parsed.data.name,
    description: parsed.data.description,
    status: parsed.data.status,
    priority: parsed.data.priority,
    startDate: parsed.data.startDate,
    dueDate: parsed.data.dueDate ?? null,
    memberIds: parsed.data.memberIds ?? [],
  });
  await addActivity({ kind: "project_created", message: `Created project "${parsed.data.name}"`, projectId: id });
  const project = await getProjectPayload(id);
  res.status(201).json(CreateProjectResponse.parse(project));
});

router.get("/projects/:projectId", async (req, res): Promise<void> => {
  const parsed = GetProjectParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const project = await getProjectPayload(parsed.data.projectId);
  if (!project) {
    res.status(404).json({ error: "Project not found" });
    return;
  }
  res.json(GetProjectResponse.parse(project));
});

router.patch("/projects/:projectId", async (req, res): Promise<void> => {
  const params = UpdateProjectParams.safeParse(req.params);
  const body = UpdateProjectBody.safeParse(req.body);
  if (!params.success || !body.success) {
    res.status(400).json({ error: !params.success ? params.error.message : body.error?.message ?? "Invalid request body" });
    return;
  }
  const [existing] = await db.select().from(pmProjectsTable).where(eq(pmProjectsTable.id, params.data.projectId));
  if (!existing) {
    res.status(404).json({ error: "Project not found" });
    return;
  }

  await db
    .update(pmProjectsTable)
    .set({
      ...(body.data.name !== undefined ? { name: body.data.name } : {}),
      ...(body.data.description !== undefined ? { description: body.data.description } : {}),
      ...(body.data.status !== undefined ? { status: body.data.status } : {}),
      ...(body.data.priority !== undefined ? { priority: body.data.priority } : {}),
      ...(body.data.startDate !== undefined ? { startDate: body.data.startDate } : {}),
      ...(body.data.dueDate !== undefined ? { dueDate: body.data.dueDate } : {}),
      ...(body.data.memberIds !== undefined ? { memberIds: body.data.memberIds } : {}),
      updatedAt: new Date(),
    })
    .where(eq(pmProjectsTable.id, params.data.projectId));
  await addActivity({
    kind: "project_updated",
    message: `Updated project "${body.data.name ?? existing.name}"`,
    projectId: existing.id,
  });
  res.json(UpdateProjectResponse.parse(await getProjectPayload(existing.id)));
});

router.delete("/projects/:projectId", async (req, res): Promise<void> => {
  const parsed = DeleteProjectParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [existing] = await db.select().from(pmProjectsTable).where(eq(pmProjectsTable.id, parsed.data.projectId));
  if (!existing) {
    res.status(404).json({ error: "Project not found" });
    return;
  }
  await db.delete(pmActivityTable).where(eq(pmActivityTable.projectId, existing.id));
  await db.delete(pmTasksTable).where(eq(pmTasksTable.projectId, existing.id));
  await db.delete(pmProjectsTable).where(eq(pmProjectsTable.id, existing.id));
  res.status(204).send();
});

router.get("/tasks", async (req, res): Promise<void> => {
  const parsed = ListTasksQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const conditions = [];
  if (parsed.data.projectId) conditions.push(eq(pmTasksTable.projectId, parsed.data.projectId));
  if (parsed.data.status) conditions.push(eq(pmTasksTable.status, parsed.data.status));
  if (parsed.data.assigneeId) conditions.push(eq(pmTasksTable.assigneeId, parsed.data.assigneeId));
  const rows = await db
    .select({ id: pmTasksTable.id })
    .from(pmTasksTable)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(asc(pmTasksTable.deadline), desc(pmTasksTable.updatedAt));
  const payload = await Promise.all(rows.map((row) => getTaskPayload(row.id)));
  res.json(ListTasksResponse.parse(payload.filter(Boolean)));
});

router.post("/tasks", async (req, res): Promise<void> => {
  const parsed = CreateTaskBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [project] = await db.select().from(pmProjectsTable).where(eq(pmProjectsTable.id, parsed.data.projectId));
  if (!project) {
    res.status(404).json({ error: "Project not found" });
    return;
  }
  if (parsed.data.assigneeId) {
    const [member] = await db.select().from(pmMembersTable).where(eq(pmMembersTable.id, parsed.data.assigneeId));
    if (!member) {
      res.status(404).json({ error: "Assignee not found" });
      return;
    }
  }
  const id = randomUUID();
  await db.insert(pmTasksTable).values({
    id,
    projectId: parsed.data.projectId,
    title: parsed.data.title,
    description: parsed.data.description,
    status: parsed.data.status,
    priority: parsed.data.priority,
    assigneeId: parsed.data.assigneeId ?? null,
    deadline: parsed.data.deadline ?? null,
    progress: parsed.data.progress ?? 0,
  });
  await addActivity({
    kind: "task_created",
    message: `Created task "${parsed.data.title}"`,
    projectId: project.id,
    taskId: id,
  });
  res.status(201).json(CreateTaskResponse.parse(await getTaskPayload(id)));
});

router.get("/tasks/:taskId", async (req, res): Promise<void> => {
  const parsed = GetTaskParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const task = await getTaskPayload(parsed.data.taskId);
  if (!task) {
    res.status(404).json({ error: "Task not found" });
    return;
  }
  res.json(GetTaskResponse.parse(task));
});

router.patch("/tasks/:taskId", async (req, res): Promise<void> => {
  const params = UpdateTaskParams.safeParse(req.params);
  const body = UpdateTaskBody.safeParse(req.body);
  if (!params.success || !body.success) {
    res.status(400).json({ error: !params.success ? params.error.message : body.error?.message ?? "Invalid request body" });
    return;
  }
  const [existing] = await db.select().from(pmTasksTable).where(eq(pmTasksTable.id, params.data.taskId));
  if (!existing) {
    res.status(404).json({ error: "Task not found" });
    return;
  }
  if (body.data.projectId) {
    const [project] = await db.select().from(pmProjectsTable).where(eq(pmProjectsTable.id, body.data.projectId));
    if (!project) {
      res.status(404).json({ error: "Project not found" });
      return;
    }
  }
  if (body.data.assigneeId) {
    const [member] = await db.select().from(pmMembersTable).where(eq(pmMembersTable.id, body.data.assigneeId));
    if (!member) {
      res.status(404).json({ error: "Assignee not found" });
      return;
    }
  }

  await db
    .update(pmTasksTable)
    .set({
      ...(body.data.projectId !== undefined ? { projectId: body.data.projectId } : {}),
      ...(body.data.title !== undefined ? { title: body.data.title } : {}),
      ...(body.data.description !== undefined ? { description: body.data.description } : {}),
      ...(body.data.status !== undefined ? { status: body.data.status } : {}),
      ...(body.data.priority !== undefined ? { priority: body.data.priority } : {}),
      ...(body.data.assigneeId !== undefined ? { assigneeId: body.data.assigneeId } : {}),
      ...(body.data.deadline !== undefined ? { deadline: body.data.deadline } : {}),
      ...(body.data.progress !== undefined ? { progress: body.data.progress } : {}),
      updatedAt: new Date(),
    })
    .where(eq(pmTasksTable.id, existing.id));
  const next = await getTaskPayload(existing.id);
  await addActivity({
    kind: body.data.status === "done" && existing.status !== "done" ? "task_completed" : "task_updated",
    message: body.data.status === "done" && existing.status !== "done" ? `Completed task "${next?.title ?? existing.title}"` : `Updated task "${next?.title ?? existing.title}"`,
    projectId: next?.projectId ?? existing.projectId,
    taskId: existing.id,
  });
  res.json(UpdateTaskResponse.parse(next));
});

router.delete("/tasks/:taskId", async (req, res): Promise<void> => {
  const parsed = DeleteTaskParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [existing] = await db.select().from(pmTasksTable).where(eq(pmTasksTable.id, parsed.data.taskId));
  if (!existing) {
    res.status(404).json({ error: "Task not found" });
    return;
  }
  await db.delete(pmActivityTable).where(eq(pmActivityTable.taskId, existing.id));
  await db.delete(pmTasksTable).where(eq(pmTasksTable.id, existing.id));
  res.status(204).send();
});

router.get("/members", async (_req, res): Promise<void> => {
  const members = await db.select().from(pmMembersTable).orderBy(asc(pmMembersTable.name));
  res.json(ListMembersResponse.parse(members.map(serializeMember)));
});

router.get("/dashboard/summary", async (_req, res): Promise<void> => {
  const [projects, tasks] = await Promise.all([
    db.select().from(pmProjectsTable),
    db.select().from(pmTasksTable),
  ]);
  const today = new Date().toISOString().slice(0, 10);
  const weekEnd = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const activeProjects = projects.filter((project) => project.status === "active");
  const doneTasks = tasks.filter((task) => task.status === "done");
  const overdue = tasks.filter((task) => task.deadline && task.deadline < today && task.status !== "done");
  const dueThisWeek = tasks.filter((task) => task.deadline && task.deadline >= today && task.deadline <= weekEnd && task.status !== "done");
  const statusBreakdown = tasks.reduce<Record<string, number>>((counts, task) => {
    counts[task.status] = (counts[task.status] ?? 0) + 1;
    return counts;
  }, {});
  const progress = taskProgress(tasks);
  res.json(
    GetDashboardSummaryResponse.parse({
      projectCount: projects.length,
      activeProjectCount: activeProjects.length,
      taskCount: tasks.length,
      completedTaskCount: doneTasks.length,
      overdueTaskCount: overdue.length,
      dueThisWeekCount: dueThisWeek.length,
      progress,
      statusBreakdown,
    }),
  );
});

router.get("/activity", async (req, res): Promise<void> => {
  const parsed = ListActivityQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const activities = await db
    .select({ activity: pmActivityTable, project: pmProjectsTable, task: pmTasksTable })
    .from(pmActivityTable)
    .leftJoin(pmProjectsTable, eq(pmProjectsTable.id, pmActivityTable.projectId))
    .leftJoin(pmTasksTable, eq(pmTasksTable.id, pmActivityTable.taskId))
    .orderBy(desc(pmActivityTable.createdAt))
    .limit(parsed.data.limit);
  res.json(
    ListActivityResponse.parse(
      activities.map(({ activity, project, task }) => ({
        id: activity.id,
        kind: activity.kind,
        message: activity.message,
        projectId: activity.projectId,
        projectName: project?.name ?? "Unknown project",
        taskId: activity.taskId,
        taskTitle: task?.title ?? null,
        createdAt: iso(activity.createdAt),
      })),
    ),
  );
});

export default router;