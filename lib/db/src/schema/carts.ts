import { integer, pgTable, primaryKey, text, timestamp } from "drizzle-orm/pg-core";

export const cartsTable = pgTable("carts", {
  userId: text("user_id").primaryKey(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const cartItemsTable = pgTable(
  "cart_items",
  {
    userId: text("user_id").notNull(),
    productId: text("product_id").notNull(),
    quantity: integer("quantity").notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.userId, table.productId] }),
  }),
);