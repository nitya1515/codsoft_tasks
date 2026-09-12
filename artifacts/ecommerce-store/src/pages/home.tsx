import { ArrowRight, Compass, Gem, Leaf, ShieldCheck } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@clerk/react';
import { useQueryClient } from '@tanstack/react-query';
import { getGetCartQueryKey, getHealthCheckQueryKey, getListCategoriesQueryKey, getListProductsQueryKey, useGetCart, useHealthCheck, useListCategories, useListProducts, useUpdateCart, type Product } from '@workspace/api-client-react';
import { ProductGrid } from '@/components/product-grid';

export function Home() {
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const { isLoaded, isSignedIn } = useAuth();
  const products = useListProducts({ featured: true, sort: 'featured', limit: 8 }, { query: { queryKey: getListProductsQueryKey({ featured: true, sort: 'featured', limit: 8 }) } });
  const categories = useListCategories({ query: { queryKey: getListCategoriesQueryKey() } });
  const cart = useGetCart({ query: { enabled: isLoaded && isSignedIn === true, queryKey: getGetCartQueryKey() } });
  const health = useHealthCheck({ query: { queryKey: getHealthCheckQueryKey() } });
  const updateCart = useUpdateCart();
  const addToCart = (product: Product) => {
    if (!isSignedIn) {
      setLocation('/sign-in');
      return;
    }
    const current = cart.data?.items ?? [];
    const existing = current.find((item) => item.productId === product.id);
    updateCart.mutate({ data: { items: current.map((item) => ({ productId: item.productId, quantity: item.productId === product.id ? item.quantity + 1 : item.quantity })).concat(existing ? [] : [{ productId: product.id, quantity: 1 }]) } }, { onSuccess: (next) => queryClient.setQueryData(getGetCartQueryKey(), next) });
  };
  return (
    <>
      <section className="relative overflow-hidden bg-accent/20">
        <div className="mx-auto grid max-w-[1320px] items-end gap-8 px-5 pb-16 pt-14 md:grid-cols-[1.1fr_.9fr] md:pb-24 md:pt-20 lg:px-8">
          <div className="reveal">
            <div className="mono-font mb-6 flex items-center gap-3 text-[10px] uppercase tracking-[.22em] text-muted-foreground"><span className="h-px w-9 bg-accent" /> The northstar edit / 01</div>
            <h1 className="display-font max-w-[680px] text-[clamp(4.3rem,9vw,8.8rem)] leading-[.82] tracking-[-.045em]">Good things<br /><em>hold up.</em></h1>
            <p className="mt-8 max-w-[405px] text-base leading-7 text-foreground/70">Everyday goods with a point of view. Natural materials, honest function, and a little more life than you expected.</p>
            <div className="mt-9 flex flex-wrap items-center gap-5"><Link href="/shop" className="group inline-flex items-center gap-3 bg-primary px-5 py-3 text-xs font-bold uppercase tracking-[.14em] text-primary-foreground transition-colors hover:bg-accent hover:text-accent-foreground" data-testid="link-hero-shop">Browse the edit <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" /></Link><a href="#principles" className="text-xs font-bold uppercase tracking-[.14em] underline decoration-foreground/30 underline-offset-8 hover:decoration-accent" data-testid="link-hero-principles">Why Northstar</a></div>
          </div>
          <div className="relative min-h-[390px] overflow-hidden bg-primary md:min-h-[540px] reveal reveal-delay-1">
            {products.data?.[0]?.imageUrl ? <img src={products.data[0].imageUrl} alt={products.data[0].name} className="h-full min-h-[390px] w-full object-cover opacity-90 mix-blend-luminosity md:min-h-[540px]" /> : <div className="absolute inset-0 bg-[radial-gradient(circle_at_65%_30%,hsl(var(--secondary)/.8),transparent_20%),linear-gradient(135deg,hsl(var(--primary)),hsl(158_18%_28%))]" />}
            <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between text-primary-foreground"><div><div className="mono-font text-[9px] uppercase tracking-[.2em] text-secondary">Field note / 001</div><div className="mt-1 text-sm">Objects for slower mornings.</div></div><Compass size={26} strokeWidth={1} className="text-secondary" /></div>
          </div>
        </div>
      </section>
      <section id="principles" className="mx-auto max-w-[1320px] px-5 py-20 lg:px-8">
        <div className="grid gap-12 md:grid-cols-[.8fr_1.2fr] md:gap-20"><div><div className="mono-font text-[10px] uppercase tracking-[.2em] text-accent">Our filter</div><h2 className="display-font mt-4 text-5xl leading-[.9] md:text-7xl">Less, but<br /><em>better.</em></h2></div><div className="grid gap-8 sm:grid-cols-3"><div><Gem size={22} strokeWidth={1.2} className="text-accent" /><h3 className="mt-5 text-sm font-bold uppercase tracking-[.12em]">Material first</h3><p className="mt-3 text-sm leading-6 text-muted-foreground">We look for linen, oak, steel, and clay — things that grow more personal with use.</p></div><div><ShieldCheck size={22} strokeWidth={1.2} className="text-accent" /><h3 className="mt-5 text-sm font-bold uppercase tracking-[.12em]">Built to stay</h3><p className="mt-3 text-sm leading-6 text-muted-foreground">No novelty for novelty's sake. Just useful objects that earn their place.</p></div><div><Leaf size={22} strokeWidth={1.2} className="text-accent" /><h3 className="mt-5 text-sm font-bold uppercase tracking-[.12em]">Quiet confidence</h3><p className="mt-3 text-sm leading-6 text-muted-foreground">Good design doesn't need to announce itself. You will notice it anyway.</p></div></div></div>
      </section>
      <section className="bg-primary py-20 text-primary-foreground">
        <div className="mx-auto max-w-[1320px] px-5 lg:px-8"><div className="mb-10 flex items-end justify-between"><div><div className="mono-font text-[10px] uppercase tracking-[.2em] text-secondary">The current edit</div><h2 className="display-font mt-3 text-5xl leading-none md:text-6xl">Objects with<br /><em>staying power.</em></h2></div><Link href="/shop" className="hidden items-center gap-2 text-xs font-bold uppercase tracking-[.14em] text-secondary hover:text-primary-foreground sm:flex" data-testid="link-featured-all">View all <ArrowRight size={15} /></Link></div>{products.isLoading ? <div className="grid grid-cols-2 gap-4 md:grid-cols-4">{[1,2,3,4].map((i) => <div className="skeleton aspect-[4/5] bg-primary/40" key={i} />)}</div> : products.isError ? <div className="border border-primary-foreground/20 py-16 text-center"><p className="text-sm">The shelves are taking a moment.</p><button type="button" onClick={() => products.refetch()} className="mt-4 text-xs font-bold uppercase tracking-[.14em] text-secondary underline underline-offset-4" data-testid="button-retry-products">Try again</button></div> : <ProductGrid products={products.data ?? []} onAdd={addToCart} />}</div>
      </section>
      <section className="mx-auto max-w-[1320px] px-5 py-20 lg:px-8"><div className="flex items-end justify-between border-b border-foreground/15 pb-5"><div><div className="mono-font text-[10px] uppercase tracking-[.2em] text-accent">Shop by feeling</div><h2 className="display-font mt-3 text-5xl leading-none">Find your <em>everyday.</em></h2></div><span className="mono-font text-[10px] text-muted-foreground">{health.data?.status === 'ok' ? '● All systems good' : 'Curating now'}</span></div><div className="mt-6 flex flex-wrap gap-3">{(categories.data ?? []).map((category) => <Link key={category.id} href={`/shop?category=${encodeURIComponent(category.id)}`} className="group border border-foreground/15 px-4 py-3 text-sm transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground" data-testid={`link-category-${category.id}`}><span>{category.name}</span><span className="ml-5 mono-font text-[10px] text-muted-foreground group-hover:text-secondary">{String(category.count).padStart(2, '0')}</span></Link>)}{!categories.data?.length && <span className="text-sm text-muted-foreground">New categories are arriving with the next edit.</span>}</div></section>
      <section id="journal" className="mx-auto grid max-w-[1320px] gap-6 px-5 pb-8 md:grid-cols-[1.3fr_.7fr] lg:px-8"><div className="bg-secondary p-8 md:p-12"><div className="mono-font text-[10px] uppercase tracking-[.2em] text-foreground/60">The field guide / 03</div><h2 className="display-font mt-12 max-w-[600px] text-5xl leading-[.9] md:text-7xl">How to buy<br /><em>fewer things.</em></h2><p className="mt-8 max-w-[340px] text-sm leading-6">A small guide to materials, maintenance, and making your home feel more like yours.</p><button type="button" className="mt-10 inline-flex items-center gap-3 text-xs font-bold uppercase tracking-[.14em] underline underline-offset-8" data-testid="button-read-guide">Read the guide <ArrowRight size={15} /></button></div><div className="flex min-h-[300px] flex-col justify-between bg-muted p-8"><div className="mono-font text-[10px] uppercase tracking-[.2em] text-muted-foreground">Northstar note</div><p className="display-font text-4xl leading-[.95]">“The best object in a room is the one you reach for without thinking.”</p><div className="text-xs uppercase tracking-[.14em] text-muted-foreground">— The Northstar team</div></div></section>
    </>
  );
}