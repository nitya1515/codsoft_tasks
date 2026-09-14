import { useState, type ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import { BarChart3, CheckSquare2, FolderKanban, LayoutDashboard, Menu, Settings2, X, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

const navItems = [
  { href: '/', label: 'Overview', icon: LayoutDashboard },
  { href: '/projects', label: 'Projects', icon: FolderKanban },
  { href: '/tasks', label: 'All tasks', icon: CheckSquare2 },
  { href: '/settings', label: 'Workspace', icon: Settings2 },
];

export function HubShell({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);
  return (
    <div className="hub-shell hub-noise min-h-[100dvh] text-foreground">
      <button aria-label="Close navigation" data-testid="button-close-navigation" className={`fixed inset-0 z-30 bg-foreground/30 md:hidden ${open ? 'block' : 'hidden'}`} onClick={() => setOpen(false)} />
      <aside className={`hub-sidebar fixed inset-y-0 left-0 z-40 flex w-[244px] flex-col bg-sidebar px-4 py-5 text-sidebar-foreground md:translate-x-0 ${open ? 'open' : ''}`}>
        <div className="mb-9 flex items-center justify-between px-2">
          <Link href="/" className="flex items-center gap-2.5" data-testid="link-brand">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground"><Zap size={16} strokeWidth={2.5} /></span>
            <span className="font-bold tracking-tight">Project Hub</span>
          </Link>
          <button className="md:hidden" onClick={() => setOpen(false)} aria-label="Close menu" data-testid="button-close-menu"><X size={18} /></button>
        </div>
        <div className="px-2 pb-3 hub-label text-sidebar-foreground/45">Workspace</div>
        <nav className="space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = href === '/' ? location === '/' : location.startsWith(href);
            return <Link key={href} href={href} onClick={() => setOpen(false)} data-testid={`link-nav-${label.toLowerCase().replaceAll(' ', '-')}`} className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-semibold transition-colors ${active ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'text-sidebar-foreground/62 hover:bg-sidebar-accent/70 hover:text-sidebar-foreground'}`}><Icon size={17} strokeWidth={active ? 2.4 : 1.8} /><span>{label}</span>{label === 'All tasks' && <span className="ml-auto hub-mono text-[10px] text-sidebar-foreground/40">⌘T</span>}</Link>;
          })}
        </nav>
        <div className="mt-auto rounded-xl border border-sidebar-border bg-sidebar-accent/50 p-3">
          <div className="mb-2 flex items-center justify-between"><span className="hub-label text-sidebar-foreground/50">This week</span><BarChart3 size={14} className="text-sidebar-primary" /></div>
          <div className="mb-2 flex items-end justify-between"><span className="text-2xl font-bold">72%</span><span className="hub-mono text-[10px] text-sidebar-foreground/45">on track</span></div>
          <div className="h-1.5 overflow-hidden rounded-full bg-sidebar-foreground/10"><div className="h-full w-[72%] rounded-full bg-sidebar-primary" /></div>
        </div>
        <div className="mt-4 flex items-center gap-2 border-t border-sidebar-border px-2 pt-4">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#d8b45a] text-xs font-bold text-[#293044]">AR</span>
          <div className="min-w-0"><div className="truncate text-xs font-semibold">Alex Rivera</div><div className="truncate text-[11px] text-sidebar-foreground/45">Product team</div></div>
          <Link href="/settings" className="ml-auto text-sidebar-foreground/45 hover:text-sidebar-foreground" aria-label="Open settings" data-testid="button-profile-settings"><Settings2 size={15} /></Link>
        </div>
      </aside>
      <div className="md:pl-[244px]">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border/70 bg-background/90 px-5 backdrop-blur-md md:px-9">
          <button className="md:hidden" onClick={() => setOpen(true)} aria-label="Open menu" data-testid="button-open-menu"><Menu size={21} /></button>
          <div className="hidden items-center gap-2 text-xs text-muted-foreground md:flex"><span className="hub-label">Workspace</span><span>/</span><span className="font-semibold text-foreground">{location === '/' ? 'Overview' : navItems.find((item) => location.startsWith(item.href) && item.href !== '/')?.label ?? 'Page'}</span></div>
          <div className="ml-auto flex items-center gap-3"><span className="hidden rounded-md border border-border bg-card px-2.5 py-1.5 hub-mono text-[10px] text-muted-foreground sm:inline-flex">Q2 · 2025</span><div className="h-5 w-px bg-border" /><Link href="/settings" className="flex h-8 w-8 items-center justify-center rounded-full bg-[#d8b45a] text-[10px] font-bold text-[#293044]" data-testid="link-header-profile">AR</Link></div>
        </header>
        <main className="min-h-[calc(100dvh-4rem)] px-5 py-7 md:px-9 md:py-9">{children}</main>
      </div>
    </div>
  );
}

export function PageHeader({ eyebrow, title, description, action }: { eyebrow: string; title: string; description?: string; action?: ReactNode }) {
  return <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><div className="hub-label mb-2 text-muted-foreground">{eyebrow}</div><h1 className="text-[clamp(1.75rem,3vw,2.55rem)] font-extrabold tracking-[-0.045em]">{title}</h1>{description && <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{description}</p>}</div>{action}</div>;
}

export function StatCard({ label, value, detail, tone = 'default' }: { label: string; value: string | number; detail: string; tone?: 'default' | 'accent' | 'danger' }) {
  return <div className={`hub-card rounded-xl p-4 ${tone === 'accent' ? 'border-primary/30 bg-primary/[.025]' : ''}`} data-testid={`stat-${label.toLowerCase().replaceAll(' ', '-')}`}><div className="mb-4 flex items-center justify-between"><span className="hub-label text-muted-foreground">{label}</span><span className={`h-2 w-2 rounded-full ${tone === 'danger' ? 'bg-destructive' : tone === 'accent' ? 'bg-accent' : 'bg-chart-2'}`} /></div><div className="text-3xl font-extrabold tracking-[-.06em]">{value}</div><div className="mt-1 text-xs text-muted-foreground">{detail}</div></div>;
}
