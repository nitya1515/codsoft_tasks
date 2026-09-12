import { eq, inArray } from "drizzle-orm";
import { Router, type IRouter } from "express";
import {
  cartItemsTable,
  cartsTable,
  db,
  productsTable,
} from "@workspace/db";
import {
  GetCartResponse,
  UpdateCartBody,
  UpdateCartResponse,
} from "@workspace/api-zod";
import { serializeProduct } from "../lib/catalog";
import { getRequestUserId, requireAuth } from "../middlewares/auth";

const router: IRouter = Router();
const cartRouter = Router();

async function getCart(userId: string) {
  const items = await db
    .select({
      productId: cartItemsTable.productId,
      quantity: cartItemsTable.quantity,
      product: productsTable,
    })
    .from(cartItemsTable)
    .innerJoin(productsTable, eq(productsTable.id, cartItemsTable.productId))
    .where(eq(cartItemsTable.userId, userId));

  const apiItems = items.map((item) => ({
    productId: item.productId,
    quantity: item.quantity,
    product: serializeProduct(item.product),
  }));
  return {
    items: apiItems,
    subtotal: apiItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    itemCount: apiItems.reduce((sum, item) => sum + item.quantity, 0),
  };
}

cartRouter.get("/", async (req, res): Promise<void> => {
  const userId = getRequestUserId(req);
  if (!userId) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }
  res.json(GetCartResponse.parse(await getCart(userId)));
});

cartRouter.put("/", async (req, res): Promise<void> => {
  const userId = getRequestUserId(req);
  if (!userId) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }
  const parsed = UpdateCartBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const productIds = parsed.data.items.map((item) => item.productId);
  const products = productIds.length
    ? await db
        .select()
        .from(productsTable)
        .where(inArray(productsTable.id, productIds))
    : [];
  const productMap = new Map(products.map((product) => [product.id, product]));
  const validItems = parsed.data.items.filter((item) => {
    const product = productMap.get(item.productId);
    return product && product.inventory >= item.quantity;
  });

  await db
    .insert(cartsTable)
    .values({ userId })
    .onConflictDoUpdate({ target: cartsTable.userId, set: { updatedAt: new Date() } });
  await db.delete(cartItemsTable).where(eq(cartItemsTable.userId, userId));
  if (validItems.length) {
    await db.insert(cartItemsTable).values(
      validItems.map((item) => ({ userId, productId: item.productId, quantity: item.quantity })),
    );
  }

  res.json(UpdateCartResponse.parse(await getCart(userId)));
});

router.use("/cart", requireAuth, cartRouter);

export default router;