import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { FileText, LifeBuoy, Mic2 } from 'lucide-react';
import { MetricCard } from '../components/dashboard/MetricCard';
import { ActivityFeed } from '../components/dashboard/ActivityFeed';
import { getProjects } from '../services/portalService';
import { useAuth } from '../contexts/AuthContext';
import { filterProjectsForUser } from '../utils/permissions';
import { productBrand } from '../constants/branding';

export function DashboardPage() {
  const { user } = useAuth();
  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: getProjects,
  });
  const scopedProjects = filterProjectsForUser(projects, user);
  const recentActivity = scopedProjects.flatMap((project) => project.activity).slice(0, 4);
  const userEmail = user?.email.toLowerCase() ?? '';
  const userName = user?.name.toLowerCase() ?? '';
  const myTasks = scopedProjects.flatMap((project) => project.tasks
    .filter((task) => !task.completed && ((task.assigneeEmail?.toLowerCase() ?? '') === userEmail || (task.assigneeName?.toLowerCase() ?? '') === userName))
    .map((task) => ({ ...task, projectId: project.id, branch: project.branch, town: project.town })))
    .slice(0, 8);
  const openQuestions = scopedProjects.flatMap((project) => project.comments
    .filter((comment) => comment.kind === 'question' && comment.status !== 'answered')
    .map((comment) => ({ ...comment, projectId: project.id, branch: project.branch })))
    .slice(0, 4);
  const metrics = [
    { label: 'Projects', value: scopedProjects.length },
    { label: 'Completed', value: scopedProjects.filter((project) => project.status === 'completed').length },
    { label: 'In Progress', value: scopedProjects.filter((project) => ['in_progress', 'awaiting_approval'].includes(project.status)).length },
    { label: 'Awaiting Approval', value: scopedProjects.filter((project) => project.status === 'awaiting_approval').length },
    { label: 'Delayed', value: scopedProjects.filter((project) => project.status === 'delayed').length },
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(14,165,233,0.18),rgba(2,6,23,0.65))] p-6 shadow-soft">
        <p className="text-sm uppercase tracking-[0.32em] text-teal-200/80">{productBrand.workspace}</p>
        <h2 className="mt-3 text-3xl font-semibold text-white">Today</h2>
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        <Link to={user?.isPlatformOwner ? '/voice-updates' : '/search'} className="group rounded-3xl border border-sky-300/20 bg-sky-500/10 p-5 shadow-soft transition hover:border-sky-200/40 hover:bg-sky-500/15">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-sky-400 text-slate-950"><Mic2 className="h-5 w-5" /></span>
            <div>
              <p className="text-sm font-semibold text-white">Voice updates</p>
              <p className="text-xs text-slate-400">{user?.isPlatformOwner ? 'Batch project updates' : 'Leave a voice note'}</p>
            </div>
          </div>
        </Link>
        <Link to="/projects" className="group rounded-3xl border border-emerald-300/20 bg-emerald-500/10 p-5 shadow-soft transition hover:border-emerald-200/40 hover:bg-emerald-500/15">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-400 text-slate-950"><FileText className="h-5 w-5" /></span>
            <div>
              <p className="text-sm font-semibold text-white">Text project updates</p>
              <p className="text-xs text-slate-400">Search, open, update</p>
            </div>
          </div>
        </Link>
        <Link to="/support" className="group rounded-3xl border border-teal-300/20 bg-teal-500/10 p-5 shadow-soft transition hover:border-teal-200/40 hover:bg-teal-500/15">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-teal-300 text-slate-950"><LifeBuoy className="h-5 w-5" /></span>
            <div>
              <p className="text-sm font-semibold text-white">User interaction</p>
              <p className="text-xs text-slate-400">Requests and support</p>
            </div>
          </div>
        </Link>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} label={metric.label} value={metric.value} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[2rem] border border-white/10 bg-white/6 p-5 shadow-soft">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold text-white">My Tasks</h3>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-300">{myTasks.length}</span>
          </div>
          <div className="mt-4 grid gap-3">
            {myTasks.length > 0 ? myTasks.map((task) => (
              <Link key={`${task.projectId}-${task.id}`} to={`/projects/${task.projectId}`} className="rounded-2xl border border-white/10 bg-slate-950/45 p-4 transition hover:border-sky-400/30 hover:bg-slate-950/70">
                <p className="text-sm font-semibold text-white">{task.text}</p>
                <p className="mt-1 text-xs text-slate-400">{task.branch} · {task.town}</p>
              </Link>
            )) : (
              <div className="rounded-2xl border border-dashed border-white/15 bg-slate-950/40 p-4 text-sm text-slate-400">No assigned tasks waiting.</div>
            )}
          </div>
        </div>
        <div className="rounded-[2rem] border border-white/10 bg-white/6 p-5 shadow-soft">
          <h3 className="text-lg font-semibold text-white">Responses</h3>
          <div className="mt-4 grid gap-3">
            {openQuestions.length > 0 ? openQuestions.map((question) => (
              <Link key={question.id} to={`/projects/${question.projectId}`} className="rounded-2xl border border-white/10 bg-slate-950/45 p-4 transition hover:border-amber-300/30">
                <p className="text-sm font-semibold text-white">{question.branch}</p>
                <p className="mt-1 line-clamp-2 text-xs text-slate-400">{question.message}</p>
              </Link>
            )) : (
              <div className="rounded-2xl border border-dashed border-white/15 bg-slate-950/40 p-4 text-sm text-slate-400">No open responses needed.</div>
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.35fr_0.95fr]">
        <ActivityFeed items={recentActivity} />
      </section>
    </div>
  );
}
