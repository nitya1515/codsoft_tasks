import { and, asc, desc, eq, ilike } from "drizzle-orm";
import { Router, type IRouter } from "express";
import { db, productsTable } from "@workspace/db";
import {
  GetProductParams,
  GetProductResponse,
  ListCategoriesResponse,
  ListProductsQueryParams,
  ListProductsResponse,
} from "@workspace/api-zod";
import { serializeProduct } from "../lib/catalog";

const router: IRouter = Router();

router.get("/products", async (req, res): Promise<void> => {
  const parsed = ListProductsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { search, category, featured, sort, limit } = parsed.data;
  const conditions = [];
  if (search) {
    conditions.push(ilike(productsTable.name, `%${search}%`));
  }
  if (category) {
    conditions.push(eq(productsTable.category, category));
  }
  if (featured !== undefined) {
    conditions.push(eq(productsTable.featured, featured));
  }

  const products = await db
    .select()
    .from(productsTable)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(
      sort === "price-asc"
        ? asc(productsTable.priceCents)
        : sort === "price-desc"
          ? desc(productsTable.priceCents)
          : sort === "newest"
            ? desc(productsTable.createdAt)
            : desc(productsTable.featured),
    )
    .limit(limit);

  res.json(ListProductsResponse.parse(products.map(serializeProduct)));
});

router.get("/products/:productId", async (req, res): Promise<void> => {
  const params = GetProductParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [product] = await db
    .select()
    .from(productsTable)
    .where(eq(productsTable.id, params.data.productId));
  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  res.json(GetProductResponse.parse(serializeProduct(product)));
});

router.get("/categories", async (_req, res): Promise<void> => {
  const products = await db.select().from(productsTable);
  const categoryMap = new Map<string, number>();
  for (const product of products) {
    categoryMap.set(product.category, (categoryMap.get(product.category) ?? 0) + 1);
  }
  const categories = Array.from(categoryMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([id, count]) => ({ id: id.toLowerCase(), name: id, count }));

  res.json(ListCategoriesResponse.parse(categories));
});

export default router;