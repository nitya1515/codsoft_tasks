import {
  db,
  pmActivityTable,
  pmMembersTable,
  pmProjectsTable,
  pmTasksTable,
  pool,
} from "@workspace/db";

const members = [
  { id: "maya-chen", name: "Maya Chen", email: "maya@northstar.team", initials: "MC", color: "#d97757" },
  { id: "jordan-lee", name: "Jordan Lee", email: "jordan@northstar.team", initials: "JL", color: "#5d7f68" },
  { id: "sam-rivera", name: "Sam Rivera", email: "sam@northstar.team", initials: "SR", color: "#b56b45" },
  { id: "riley-patel", name: "Riley Patel", email: "riley@northstar.team", initials: "RP", color: "#6d5f8d" },
];

const projects = [
  {
    id: "aurora-website",
    name: "Aurora website refresh",
    description: "Reframe the marketing site around the new product story and launch narrative.",
    status: "active",
    priority: "high",
    startDate: "2026-08-24",
    dueDate: "2026-09-28",
    memberIds: ["maya-chen", "jordan-lee", "sam-rivera"],
  },
  {
    id: "q3-ops",
    name: "Q3 operations planning",
    description: "Bring the next quarter's operating rhythm, goals, and reporting into one shared plan.",
    status: "planning",
    priority: "medium",
    startDate: "2026-09-01",
    dueDate: "2026-10-09",
    memberIds: ["maya-chen", "riley-patel"],
  },
  {
    id: "mobile-app",
    name: "Mobile companion app",
    description: "Ship the first mobile workflow for checking progress away from the desk.",
    status: "active",
    priority: "high",
    startDate: "2026-08-17",
    dueDate: "2026-10-23",
    memberIds: ["jordan-lee", "sam-rivera", "riley-patel"],
  },
];

const tasks = [
  {
    id: "aurora-copy",
    projectId: "aurora-website",
    title: "Approve homepage narrative",
    description: "Lock the headline, supporting copy, and proof points before visual polish.",
    status: "done",
    priority: "high",
    assigneeId: "maya-chen",
    deadline: "2026-09-12",
    progress: 100,
  },
  {
    id: "aurora-design",
    projectId: "aurora-website",
    title: "Finalize responsive design system",
    description: "Document the type scale, spacing rhythm, and reusable content blocks.",
    status: "in_progress",
    priority: "high",
    assigneeId: "jordan-lee",
    deadline: "2026-09-18",
    progress: 68,
  },
  {
    id: "aurora-review",
    projectId: "aurora-website",
    title: "Run accessibility review",
    description: "Check keyboard navigation, contrast, focus states, and semantic structure.",
    status: "todo",
    priority: "medium",
    assigneeId: "riley-patel",
    deadline: "2026-09-24",
    progress: 0,
  },
  {
    id: "ops-goals",
    projectId: "q3-ops",
    title: "Draft team goals",
    description: "Turn company priorities into three measurable team outcomes.",
    status: "in_progress",
    priority: "high",
    assigneeId: "maya-chen",
    deadline: "2026-09-19",
    progress: 45,
  },
  {
    id: "ops-dashboard",
    projectId: "q3-ops",
    title: "Define weekly reporting view",
    description: "Choose the metrics and owner for the weekly operating review.",
    status: "backlog",
    priority: "low",
    assigneeId: "riley-patel",
    deadline: "2026-09-30",
    progress: 0,
  },
  {
    id: "mobile-prototype",
    projectId: "mobile-app",
    title: "Validate mobile task flow",
    description: "Test the core flow for checking, updating, and completing a task on the go.",
    status: "review",
    priority: "high",
    assigneeId: "sam-rivera",
    deadline: "2026-09-16",
    progress: 82,
  },
  {
    id: "mobile-build",
    projectId: "mobile-app",
    title: "Build offline task cache",
    description: "Keep the latest assigned tasks available when the connection drops.",
    status: "todo",
    priority: "medium",
    assigneeId: "jordan-lee",
    deadline: "2026-10-02",
    progress: 12,
  },
];

const activity = [
  { id: "activity-1", kind: "task_completed", message: 'Completed task "Approve homepage narrative"', projectId: "aurora-website", taskId: "aurora-copy", createdAt: new Date("2026-09-12T08:30:00Z") },
  { id: "activity-2", kind: "task_updated", message: 'Moved "Validate mobile task flow" to review', projectId: "mobile-app", taskId: "mobile-prototype", createdAt: new Date("2026-09-11T15:20:00Z") },
  { id: "activity-3", kind: "project_created", message: 'Created project "Q3 operations planning"', projectId: "q3-ops", taskId: null, createdAt: new Date("2026-09-10T10:00:00Z") },
  { id: "activity-4", kind: "task_created", message: 'Created task "Finalize responsive design system"', projectId: "aurora-website", taskId: "aurora-design", createdAt: new Date("2026-09-09T13:10:00Z") },
];

await db.insert(pmMembersTable).values(members).onConflictDoNothing();
await db.insert(pmProjectsTable).values(projects).onConflictDoNothing();
await db.insert(pmTasksTable).values(tasks).onConflictDoNothing();
await db.insert(pmActivityTable).values(activity).onConflictDoNothing();
await pool.end();