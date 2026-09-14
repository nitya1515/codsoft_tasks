import { AlertCircle, ArrowRight, CheckCircle2, CircleDot, Clock3, Plus, RefreshCw } from 'lucide-react';
import { Link } from 'wouter';
import { useGetDashboardSummary, useListActivity, useListProjects, useListTasks } from '@workspace/api-client-react';
import { Button } from '@/components/ui/button';
import { PageHeader, StatCard } from '@/components/hub-shell';

function formatDate(date: string | null) {
  if (!date) return 'No deadline';
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(date));
}

export default function Dashboard() {
  const summaryQuery = useGetDashboardSummary({ query: { queryKey: ['/api/dashboard/summary'] } });
  const projectsQuery = useListProjects(undefined, { query: { queryKey: ['/api/projects'] } });
  const tasksQuery = useListTasks(undefined, { query: { queryKey: ['/api/tasks'] } });
  const activityQuery = useListActivity({ limit: 6 }, { query: { queryKey: ['/api/activity', { limit: 6 }] } });
  const summary = summaryQuery.data;
  const projects = projectsQuery.data ?? [];
  const tasks = tasksQuery.data ?? [];
  const dueTasks = tasks.filter((task) => task.status !== 'done').sort((a, b) => (a.deadline ?? '9999').localeCompare(b.deadline ?? '9999')).slice(0, 5);
  const isLoading = summaryQuery.isLoading || projectsQuery.isLoading || tasksQuery.isLoading;
  const hasError = summaryQuery.isError || projectsQuery.isError || tasksQuery.isError;
  if (isLoading) return <DashboardSkeleton />;
  if (hasError) return <ErrorState onRetry={() => { void summaryQuery.refetch(); void projectsQuery.refetch(); void tasksQuery.refetch(); }} />;
  return <div className="hub-grid -mx-5 -my-7 min-h-[calc(100dvh-4rem)] px-5 py-7 md:-mx-9 md:-my-9 md:px-9 md:py-9">
    <PageHeader eyebrow="Monday, June 16, 2025" title="Good morning, Alex." description="Here’s the pulse of your workspace. Keep the important work moving." action={<Link href="/projects" data-testid="link-dashboard-projects"><Button className="gap-2"><Plus size={16} />New project</Button></Link>} />
    <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard label="Projects" value={summary?.projectCount ?? 0} detail={`${summary?.activeProjectCount ?? 0} active right now`} tone="accent" />
      <StatCard label="Open tasks" value={Math.max((summary?.taskCount ?? 0) - (summary?.completedTaskCount ?? 0), 0)} detail={`${summary?.completedTaskCount ?? 0} completed overall`} />
      <StatCard label="Due this week" value={summary?.dueThisWeekCount ?? 0} detail="Across all projects" />
      <StatCard label="Overdue" value={summary?.overdueTaskCount ?? 0} detail={summary?.overdueTaskCount ? 'Needs your attention' : 'Nothing slipping'} tone={summary?.overdueTaskCount ? 'danger' : 'default'} />
    </div>
    <div className="grid gap-5 xl:grid-cols-[1.35fr_.85fr]">
      <section className="hub-card rounded-xl p-5 md:p-6">
        <div className="mb-5 flex items-center justify-between"><div><div className="hub-label mb-1 text-muted-foreground">In focus</div><h2 className="text-lg font-bold tracking-tight">Active projects</h2></div><Link href="/projects" className="flex items-center gap-1 text-xs font-bold text-muted-foreground hover:text-foreground" data-testid="link-view-all-projects">View all <ArrowRight size={14} /></Link></div>
        {projects.length === 0 ? <EmptyState title="Your workspace is clear" text="Create a project to give your team a place to start." action={<Link href="/projects" data-testid="link-empty-create-project"><Button size="sm">Create project</Button></Link>} /> : <div className="space-y-1">{projects.filter((project) => project.status !== 'archived').slice(0, 5).map((project) => <Link href={`/projects/${project.id}`} key={project.id} data-testid={`card-project-${project.id}`} className="group flex items-center gap-4 rounded-lg px-3 py-3 transition-colors hover:bg-secondary/60"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary"><FolderGlyph status={project.status} /></div><div className="min-w-0 flex-1"><div className="truncate text-sm font-bold">{project.name}</div><div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground"><span>{project.completedTaskCount}/{project.taskCount} tasks</span><span className="h-1 w-1 rounded-full bg-border" /><span>{project.dueDate ? `Due ${formatDate(project.dueDate)}` : 'No deadline'}</span></div></div><div className="hidden w-24 sm:block"><div className="mb-1 text-right hub-mono text-[10px] text-muted-foreground">{project.progress}%</div><div className="h-1.5 rounded-full bg-secondary"><div className="hub-progress h-1.5 rounded-full bg-chart-2" style={{ width: `${project.progress}%` }} /></div></div><ArrowRight size={15} className="text-muted-foreground/40 transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" /></Link>)}</div>}
      </section>
      <section className="hub-card rounded-xl p-5 md:p-6">
        <div className="mb-5 flex items-center justify-between"><div><div className="hub-label mb-1 text-muted-foreground">What’s moving</div><h2 className="text-lg font-bold tracking-tight">Recent activity</h2></div><CircleDot size={16} className="text-muted-foreground" /></div>
        {activityQuery.isLoading ? <div className="space-y-4">{[1, 2, 3].map((i) => <div key={i} className="h-10 animate-pulse rounded bg-secondary" />)}</div> : activityQuery.data?.length ? <div className="space-y-5">{activityQuery.data.slice(0, 5).map((activity) => <div key={activity.id} className="flex gap-3" data-testid={`activity-${activity.id}`}><div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-accent ring-4 ring-accent/15" /><div className="min-w-0"><p className="text-xs leading-relaxed">{activity.message}</p><p className="mt-1 hub-mono text-[10px] text-muted-foreground">{timeAgo(activity.createdAt)} · {activity.projectName}</p></div></div>)}</div> : <EmptyState title="No activity yet" text="Updates from your team will show up here." /> }
      </section>
    </div>
    <section className="hub-card mt-5 rounded-xl p-5 md:p-6">
      <div className="mb-5 flex items-center justify-between"><div><div className="hub-label mb-1 text-muted-foreground">Next up</div><h2 className="text-lg font-bold tracking-tight">Due work</h2></div><Link href="/tasks" className="flex items-center gap-1 text-xs font-bold text-muted-foreground hover:text-foreground" data-testid="link-view-all-tasks">Open task list <ArrowRight size={14} /></Link></div>
      {dueTasks.length ? <div className="grid gap-2 md:grid-cols-2">{dueTasks.map((task) => <Link href={`/projects/${task.projectId}`} key={task.id} data-testid={`due-task-${task.id}`} className="group flex items-center gap-3 rounded-lg border border-border/70 px-3 py-3 hover:bg-secondary/50"><span className={`h-2.5 w-2.5 rounded-full ${task.priority === 'high' ? 'bg-destructive' : task.priority === 'medium' ? 'bg-accent' : 'bg-chart-2'}`} /><div className="min-w-0 flex-1"><div className="truncate text-sm font-semibold">{task.title}</div><div className="mt-1 text-xs text-muted-foreground">{task.assignee?.name ?? 'Unassigned'}</div></div><span className={`hub-mono text-[10px] ${task.deadline && new Date(task.deadline) < new Date() ? 'text-destructive' : 'text-muted-foreground'}`}>{formatDate(task.deadline)}</span><ArrowRight size={14} className="text-muted-foreground/40" /></Link>)}</div> : <EmptyState title="Nothing due" text="You’re clear for now. Nice work." />}
    </section>
  </div>;
}

function FolderGlyph({ status }: { status: string }) { return status === 'completed' ? <CheckCircle2 size={17} /> : status === 'planning' ? <Clock3 size={17} /> : <FolderKanbanIcon />; }
function FolderKanbanIcon() { return <span className="text-base font-bold">/</span>; }
function timeAgo(value: string) { const diff = Math.max(0, Date.now() - new Date(value).getTime()); const mins = Math.floor(diff / 60000); if (mins < 60) return `${mins}m ago`; const hours = Math.floor(mins / 60); if (hours < 24) return `${hours}h ago`; return `${Math.floor(hours / 24)}d ago`; }
export function EmptyState({ title, text, action }: { title: string; text: string; action?: import('react').ReactNode }) { return <div className="rounded-lg border border-dashed border-border px-5 py-10 text-center"><div className="mx-auto mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-secondary"><CheckCircle2 size={16} className="text-muted-foreground" /></div><div className="text-sm font-bold">{title}</div><p className="mx-auto mt-1 max-w-xs text-xs text-muted-foreground">{text}</p>{action && <div className="mt-4">{action}</div>}</div>; }
function DashboardSkeleton() { return <div className="animate-pulse"><PageHeader eyebrow="Loading workspace" title="Getting your bearings" description="Syncing the latest project health." /><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{[1, 2, 3, 4].map((i) => <div key={i} className="h-32 rounded-xl bg-secondary" />)}</div><div className="mt-5 grid gap-5 xl:grid-cols-2"><div className="h-80 rounded-xl bg-secondary" /><div className="h-80 rounded-xl bg-secondary" /></div></div>; }
function ErrorState({ onRetry }: { onRetry: () => void }) { return <div className="flex min-h-[60vh] items-center justify-center"><div className="text-center"><AlertCircle className="mx-auto mb-4 text-destructive" size={26} /><h2 className="font-bold">Couldn’t load the workspace</h2><p className="mt-1 text-sm text-muted-foreground">Check your connection and try again.</p><Button className="mt-5 gap-2" onClick={onRetry} data-testid="button-retry-dashboard"><RefreshCw size={14} />Retry</Button></div></div>; }