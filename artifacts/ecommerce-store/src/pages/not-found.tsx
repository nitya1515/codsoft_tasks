import { ArrowLeft, Compass } from 'lucide-react';
import { Link } from 'wouter';

export default function NotFound() {
  return (
    <div className="northstar-grain flex min-h-[100dvh] items-center justify-center bg-primary px-5 text-primary-foreground">
      <div className="text-center">
        <Compass size={48} strokeWidth={1} className="mx-auto text-secondary" />
        <div className="mono-font mt-8 text-[10px] uppercase tracking-[.22em] text-secondary">Northstar / off course</div>
        <h1 className="display-font mt-5 text-7xl leading-[.85] md:text-9xl">Not this<br /><em>way.</em></h1>
        <p className="mx-auto mt-6 max-w-[280px] text-sm leading-6 text-primary-foreground/60">That page wandered past the edge of the edit.</p>
        <Link href="/" className="mt-8 inline-flex items-center gap-3 border border-primary-foreground/30 px-5 py-3 text-xs font-bold uppercase tracking-[.14em] transition-colors hover:border-secondary hover:text-secondary" data-testid="link-not-found-home"><ArrowLeft size={15} /> Back home</Link>
      </div>
    </div>
  );
}
