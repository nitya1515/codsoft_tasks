import { Link, useLocation } from 'wouter';
import { ArrowRight, Menu, Search, ShoppingBag, UserRound, X } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { useAuth } from '@clerk/react';
import { getGetCartQueryKey, useGetCart } from '@workspace/api-client-react';

export function StoreShell({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const { isLoaded, isSignedIn } = useAuth();
  const cart = useGetCart({ query: { enabled: isLoaded && isSignedIn === true, queryKey: getGetCartQueryKey() } });
  const itemCount = cart.data?.itemCount ?? 0;
  const isShop = location === '/shop';

  return (
    <div className="northstar-grain min-h-[100dvh] bg-background text-foreground">
      <div className="bg-primary px-4 py-2 text-center text-[10px] font-semibold uppercase tracking-[.22em] text-primary-foreground">
        Thoughtful goods, shipped with care <span className="mx-2 text-secondary">•</span> Free delivery over $75
      </div>
      <header className="sticky top-0 z-40 border-b border-foreground/10 bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-[74px] max-w-[1320px] items-center justify-between px-5 lg:px-8">
          <button type="button" className="md:hidden" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu" data-testid="button-toggle-menu">
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <Link href="/" className="group flex items-center gap-3" data-testid="link-home">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-primary text-secondary transition-transform group-hover:rotate-12">
              <span className="h-2.5 w-2.5 rounded-full border border-secondary" />
            </span>
            <span className="text-[15px] font-bold uppercase tracking-[.2em]">Northstar <span className="hidden text-muted-foreground sm:inline">Goods</span></span>
          </Link>
          <nav className="hidden items-center gap-8 text-xs font-semibold uppercase tracking-[.16em] md:flex">
            <Link href="/shop" className={isShop ? 'text-accent' : 'transition-colors hover:text-accent'} data-testid="link-shop">Shop all</Link>
            <a href="/#principles" className="transition-colors hover:text-accent" data-testid="link-principles">Our edit</a>
            <a href="/#journal" className="transition-colors hover:text-accent" data-testid="link-journal">Journal</a>
          </nav>
          <div className="flex items-center gap-1">
            <Link href="/shop" className="hidden rounded-full p-2.5 transition-colors hover:bg-muted sm:block" aria-label="Search the shop" data-testid="link-search"><Search size={19} strokeWidth={1.7} /></Link>
            <Link href="/account" className="rounded-full p-2.5 transition-colors hover:bg-muted" aria-label="Your account" data-testid="link-account"><UserRound size={19} strokeWidth={1.7} /></Link>
            <Link href="/cart" className="group relative rounded-full p-2.5 transition-colors hover:bg-muted" aria-label="Your cart" data-testid="link-cart">
              <ShoppingBag size={19} strokeWidth={1.7} />
              {itemCount > 0 && <span className="absolute -right-0.5 -top-0.5 grid h-[17px] min-w-[17px] place-items-center rounded-full bg-accent px-1 text-[9px] font-bold text-accent-foreground" data-testid="text-cart-count">{itemCount}</span>}
            </Link>
          </div>
        </div>
        {menuOpen && (
          <div className="border-t border-foreground/10 bg-background px-5 py-6 md:hidden">
            <nav className="grid gap-5 text-sm font-semibold uppercase tracking-[.14em]">
              <Link href="/shop" onClick={() => setMenuOpen(false)} data-testid="link-mobile-shop">Shop all</Link>
              <a href="/#principles" onClick={() => setMenuOpen(false)} data-testid="link-mobile-principles">Our edit</a>
              <a href="/#journal" onClick={() => setMenuOpen(false)} data-testid="link-mobile-journal">Journal</a>
            </nav>
          </div>
        )}
      </header>
      <main>{children}</main>
      <footer className="mt-24 bg-primary text-primary-foreground">
        <div className="mx-auto grid max-w-[1320px] gap-12 px-5 py-14 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr] lg:px-8">
          <div>
            <div className="mb-4 text-[15px] font-bold uppercase tracking-[.2em]">Northstar Goods</div>
            <p className="max-w-[250px] text-sm leading-6 text-primary-foreground/65">A considered edit of everyday objects, chosen for the way they wear in — not out.</p>
          </div>
          <div><div className="mb-4 mono-font text-[10px] uppercase tracking-[.2em] text-secondary">Explore</div><div className="grid gap-3 text-sm text-primary-foreground/75"><Link href="/shop" className="hover:text-secondary" data-testid="footer-link-shop">Shop all</Link><Link href="/#principles" className="hover:text-secondary" data-testid="footer-link-principles">Our principles</Link><Link href="/account" className="hover:text-secondary" data-testid="footer-link-account">Account</Link></div></div>
          <div><div className="mb-4 mono-font text-[10px] uppercase tracking-[.2em] text-secondary">Help</div><div className="grid gap-3 text-sm text-primary-foreground/75"><span>Shipping & returns</span><span>Care guide</span><span>Contact us</span></div></div>
          <div><div className="mb-4 mono-font text-[10px] uppercase tracking-[.2em] text-secondary">A note from the north</div><p className="text-sm leading-6 text-primary-foreground/75">New notes on useful things, once a month.</p><div className="mt-4 flex border-b border-primary-foreground/30 pb-2"><input className="w-full bg-transparent text-sm outline-none placeholder:text-primary-foreground/40" placeholder="Email address" aria-label="Email address" data-testid="input-newsletter" /><button type="button" className="text-secondary" aria-label="Subscribe to newsletter" data-testid="button-newsletter"><ArrowRight size={18} /></button></div></div>
        </div>
        <div className="mx-auto flex max-w-[1320px] justify-between border-t border-primary-foreground/15 px-5 py-5 text-[10px] uppercase tracking-[.16em] text-primary-foreground/40 lg:px-8"><span>© 2025 Northstar Goods</span><span>Made for the long haul</span></div>
      </footer>
    </div>
  );
}