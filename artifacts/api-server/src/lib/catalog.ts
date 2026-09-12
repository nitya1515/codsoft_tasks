import type { Product } from "@workspace/db";

export function serializeProduct(product: Product) {
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.priceCents / 100,
    compareAtPrice:
      product.compareAtPriceCents == null
        ? null
        : product.compareAtPriceCents / 100,
    category: product.category,
    imageUrl: product.imageUrl,
    badge: product.badge,
    inventory: product.inventory,
    featured: product.featured,
  };
}