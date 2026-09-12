import { Filter, Search, SlidersHorizontal, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useAuth } from '@clerk/react';
import { useLocation } from 'wouter';
import { useQueryClient } from '@tanstack/react-query';
import { getGetCartQueryKey, getListProductsQueryKey, useGetCart, useListCategories, useListProducts, useUpdateCart, type Product } from '@workspace/api-client-react';
import { ProductGrid } from '@/components/product-grid';

export function Shop() {
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const { isLoaded, isSignedIn } = useAuth();
  const params = new URLSearchParams(window.location.search);
  const [search, setSearch] = useState(params.get('search') ?? '');
  const [category, setCategory] = useState(params.get('category') ?? '');
  const [sort, setSort] = useState<'featured' | 'newest' | 'price-asc' | 'price-desc'>('featured');
  const categories = useListCategories();
  const cart = useGetCart({ query: { enabled: isLoaded && isSignedIn === true, queryKey: getGetCartQueryKey() } });
  const updateCart = useUpdateCart();
  const request = useMemo(() => ({ search: search || undefined, category: category || undefined, sort, limit: 48 }), [search, category, sort]);
  const products = useListProducts(request, { query: { queryKey: getListProductsQueryKey(request) } });
  const addToCart = (product: Product) => {
    if (!isSignedIn) {
      setLocation('/sign-in');
      return;
    }
    const current = cart.data?.items ?? [];
    const existing = current.find((item) => item.productId === product.id);
    updateCart.mutate({ data: { items: current.map((item) => ({ productId: item.productId, quantity: item.productId === product.id ? item.quantity + 1 : item.quantity })).concat(existing ? [] : [{ productId: product.id, quantity: 1 }]) } }, { onSuccess: (next) => queryClient.setQueryData(getGetCartQueryKey(), next) });
  };
  return <section className="mx-auto max-w-[1320px] px-5 py-12 lg:px-8 lg:py-16"><div className="flex flex-col gap-8 border-b border-foreground/15 pb-10 md:flex-row md:items-end md:justify-between"><div><div className="mono-font text-[10px] uppercase tracking-[.2em] text-accent">The complete edit</div><h1 className="display-font mt-4 text-6xl leading-[.86] md:text-8xl">Shop the<br /><em>good stuff.</em></h1></div><p className="max-w-[255px] text-sm leading-6 text-muted-foreground">Objects chosen to be lived with. Search by name, browse by category, or trust the edit.</p></div><div className="sticky top-[74px] z-30 -mx-5 mt-8 border-b border-foreground/10 bg-background/95 px-5 py-4 backdrop-blur-md lg:-mx-8 lg:px-8"><div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between"><div className="relative max-w-[360px] flex-1"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><input value={search} onChange={(e) => setSearch(e.target.value)} className="h-11 w-full border border-foreground/20 bg-card pl-10 pr-10 text-sm outline-none transition-colors focus:border-accent" placeholder="Search objects..." aria-label="Search products" data-testid="input-search-products" />{search && <button type="button" onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" aria-label="Clear search" data-testid="button-clear-search"><X size={15} /></button>}</div><div className="flex gap-2 overflow-x-auto">{(categories.data ?? []).map((item) => <button key={item.id} type="button" onClick={() => setCategory(category === item.id ? '' : item.id)} className={`shrink-0 border px-3 py-2 text-xs font-semibold transition-colors ${category === item.id ? 'border-primary bg-primary text-primary-foreground' : 'border-foreground/15 hover:border-primary'}`} data-testid={`button-filter-${item.id}`}><Filter size={12} className="mr-1 inline" />{item.name}</button>)}</div><label className="flex shrink-0 items-center gap-2 border border-foreground/15 px-3 py-2 text-xs"><SlidersHorizontal size={13} /><select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} className="bg-transparent outline-none" aria-label="Sort products" data-testid="select-sort-products"><option value="featured">Featured</option><option value="newest">Newest</option><option value="price-asc">Price: low to high</option><option value="price-desc">Price: high to low</option></select></label></div></div><div className="mt-10">{products.isLoading ? <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">{Array.from({ length: 8 }).map((_, i) => <div className="skeleton aspect-[4/5]" key={i} />)}</div> : products.isError ? <div className="border border-dashed border-foreground/20 py-24 text-center"><p className="text-sm">We couldn't reach the shelves.</p><button type="button" onClick={() => products.refetch()} className="mt-4 text-xs font-bold uppercase tracking-[.14em] underline underline-offset-4" data-testid="button-retry-shop">Try again</button></div> : <ProductGrid products={products.data ?? []} onAdd={addToCart} />}</div></section>;
}