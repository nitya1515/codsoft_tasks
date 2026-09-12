import { ArrowUpRight, Plus } from 'lucide-react';
import { Link } from 'wouter';
import type { Product } from '@workspace/api-client-react';

export function ProductCard({ product, onAdd }: { product: Product; onAdd?: (product: Product) => void }) {
  const soldOut = product.inventory < 1;
  return (
    <article className="group reveal" data-testid={`card-product-${product.id}`}>
      <Link href={`/products/${product.id}`} className="block" data-testid={`link-product-${product.id}`}>
        <div className="image-zoom relative aspect-[4/5] overflow-hidden bg-muted">
          {product.imageUrl ? <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" loading="lazy" /> : <div className="grid h-full place-items-center bg-accent/20 text-sm text-muted-foreground">Northstar object</div>}
          {product.badge && <span className="absolute left-3 top-3 bg-background px-2.5 py-1 mono-font text-[9px] uppercase tracking-[.16em]">{product.badge}</span>}
          {soldOut && <span className="absolute inset-x-3 bottom-3 bg-primary/90 px-2.5 py-2 text-center mono-font text-[9px] uppercase tracking-[.16em] text-primary-foreground">Currently resting</span>}
          <span className="absolute bottom-3 right-3 grid h-9 w-9 translate-y-2 place-items-center rounded-full bg-background opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100"><ArrowUpRight size={16} /></span>
        </div>
      </Link>
      <div className="flex items-start justify-between gap-3 pt-4">
        <div><div className="mono-font text-[9px] uppercase tracking-[.18em] text-muted-foreground">{product.category}</div><h3 className="mt-1 text-[15px] font-semibold">{product.name}</h3><div className="mt-1 flex items-center gap-2 text-sm"><span>${product.price.toFixed(2)}</span>{product.compareAtPrice && <span className="text-muted-foreground line-through">${product.compareAtPrice.toFixed(2)}</span>}</div></div>
        {onAdd && <button type="button" disabled={soldOut} onClick={() => onAdd(product)} className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-full border border-foreground/20 transition-all hover:border-primary hover:bg-primary hover:text-primary-foreground disabled:cursor-not-allowed disabled:opacity-30" aria-label={`Add ${product.name} to cart`} data-testid={`button-add-product-${product.id}`}><Plus size={15} /></button>}
      </div>
    </article>
  );
}