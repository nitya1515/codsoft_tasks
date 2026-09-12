import type { Product } from '@workspace/api-client-react';
import { ProductCard } from '@/components/product-card';

export function ProductGrid({ products, onAdd }: { products: Product[]; onAdd?: (product: Product) => void }) {
  if (!products.length) return <div className="col-span-full border border-dashed border-foreground/20 py-20 text-center"><div className="display-font text-4xl">Nothing here yet.</div><p className="mx-auto mt-3 max-w-sm text-sm text-muted-foreground">Try another search or take a look at the full edit.</p></div>;
  return <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-6">{products.map((product) => <ProductCard key={product.id} product={product} onAdd={onAdd} />)}</div>;
}