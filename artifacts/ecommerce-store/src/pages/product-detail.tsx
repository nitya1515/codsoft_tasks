import { Check, Minus, Plus, ArrowLeft, ShoppingBag } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@clerk/react';
import { Link, useLocation, useRoute } from 'wouter';
import { useQueryClient } from '@tanstack/react-query';
import { getGetCartQueryKey, getGetProductQueryKey, useGetCart, useGetProduct, useUpdateCart } from '@workspace/api-client-react';

export function ProductDetail() {
  const [, params] = useRoute('/products/:productId');
  const [, setLocation] = useLocation();
  const { isLoaded, isSignedIn } = useAuth();
  const id = params?.productId ?? '';
  const product = useGetProduct(id, { query: { queryKey: getGetProductQueryKey(id), enabled: !!id } });
  const cart = useGetCart({ query: { enabled: isLoaded && isSignedIn === true, queryKey: getGetCartQueryKey() } });
  const updateCart = useUpdateCart();
  const queryClient = useQueryClient();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  if (product.isLoading) return <div className="mx-auto grid max-w-[1320px] gap-8 px-5 py-16 md:grid-cols-2 lg:px-8"><div className="skeleton aspect-[4/5]" /><div className="space-y-5 pt-10"><div className="skeleton h-4 w-24" /><div className="skeleton h-16 w-4/5" /><div className="skeleton h-24 w-full" /></div></div>;
  if (product.isError || !product.data) return <div className="mx-auto max-w-[1320px] px-5 py-24 text-center lg:px-8"><div className="display-font text-5xl">Object not found.</div><Link href="/shop" className="mt-6 inline-block text-xs font-bold uppercase tracking-[.14em] underline underline-offset-8" data-testid="link-back-shop-error">Back to the edit</Link></div>;
  const item = product.data;
  const soldOut = item.inventory < 1;
  const add = () => {
    if (!isSignedIn) {
      setLocation('/sign-in');
      return;
    }
    const current = cart.data?.items ?? [];
    const existing = current.find((entry) => entry.productId === item.id);
    updateCart.mutate({ data: { items: current.map((entry) => ({ productId: entry.productId, quantity: entry.productId === item.id ? entry.quantity + quantity : entry.quantity })).concat(existing ? [] : [{ productId: item.id, quantity }]) } }, { onSuccess: (next) => { queryClient.setQueryData(getGetCartQueryKey(), next); setAdded(true); } });
  };
  return <div className="mx-auto max-w-[1320px] px-5 py-8 lg:px-8 lg:py-12"><Link href="/shop" className="mb-8 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.18em] text-muted-foreground transition-colors hover:text-foreground" data-testid="link-back-shop"><ArrowLeft size={14} /> Back to shop</Link><div className="grid gap-10 md:grid-cols-[1.05fr_.95fr] md:gap-16"><div className="image-zoom relative aspect-[4/5] max-h-[780px] overflow-hidden bg-muted">{item.imageUrl ? <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center bg-accent/20 text-muted-foreground">Northstar object</div>}{item.badge && <span className="absolute left-5 top-5 bg-background px-3 py-2 mono-font text-[9px] uppercase tracking-[.16em]">{item.badge}</span>}</div><div className="flex flex-col justify-center md:py-10"><div className="mono-font text-[10px] uppercase tracking-[.2em] text-accent">{item.category}</div><h1 className="display-font mt-4 max-w-[580px] text-6xl leading-[.86] md:text-8xl">{item.name}</h1><div className="mt-6 flex items-center gap-3"><span className="text-lg">${item.price.toFixed(2)}</span>{item.compareAtPrice && <span className="text-sm text-muted-foreground line-through">${item.compareAtPrice.toFixed(2)}</span>}</div><div className="my-8 editorial-rule" /><p className="max-w-[480px] text-[15px] leading-7 text-muted-foreground">{item.description}</p><div className="mt-9 flex items-center gap-4"><div className="flex h-12 items-center border border-foreground/20"><button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))} className="grid h-full w-11 place-items-center hover:bg-muted" aria-label="Decrease quantity" data-testid="button-decrease-quantity"><Minus size={15} /></button><span className="w-9 text-center mono-font text-sm" data-testid="text-product-quantity">{quantity}</span><button type="button" onClick={() => setQuantity(Math.min(20, quantity + 1))} className="grid h-full w-11 place-items-center hover:bg-muted" aria-label="Increase quantity" data-testid="button-increase-quantity"><Plus size={15} /></button></div><button type="button" disabled={soldOut || updateCart.isPending} onClick={add} className="flex h-12 flex-1 items-center justify-center gap-3 bg-primary px-6 text-xs font-bold uppercase tracking-[.14em] text-primary-foreground transition-colors hover:bg-accent hover:text-accent-foreground disabled:cursor-not-allowed disabled:opacity-40" data-testid="button-add-to-cart">{added ? <><Check size={16} /> Added to cart</> : <><ShoppingBag size={16} /> {soldOut ? 'Currently resting' : updateCart.isPending ? 'Adding...' : 'Add to cart'}</>}</button></div>{added && <button type="button" onClick={() => setLocation('/cart')} className="mt-4 self-start text-xs font-bold uppercase tracking-[.14em] underline underline-offset-8" data-testid="button-view-cart">View your cart</button>}<div className="mt-12 grid gap-3 border-t border-foreground/15 pt-5 text-xs text-muted-foreground"><div className="flex justify-between"><span>Materials</span><span className="text-foreground">Made to be lived with</span></div><div className="flex justify-between"><span>Dispatch</span><span className="text-foreground">Usually within 2–3 days</span></div><div className="flex justify-between"><span>Care</span><span className="text-foreground">A little attention goes a long way</span></div></div></div></div></div>;
}