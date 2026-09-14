import { AlertCircle, ArrowLeft } from 'lucide-react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="hub-grid flex min-h-[calc(100dvh-4rem)] items-center justify-center">
      <div className="hub-card mx-5 w-full max-w-md rounded-xl p-8 text-center">
        <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-accent/25"><AlertCircle className="h-6 w-6" /></div>
        <div className="hub-label mb-2 text-muted-foreground">Error 404</div>
        <h1 className="text-2xl font-extrabold tracking-tight">This page went off-plan.</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">The route you’re looking for doesn’t exist in this workspace.</p>
        <Link href="/" className="mt-6 inline-flex" data-testid="link-not-found-home"><Button className="gap-2"><ArrowLeft size={14} />Back to overview</Button></Link>
      </div>
    </div>
  );
}
