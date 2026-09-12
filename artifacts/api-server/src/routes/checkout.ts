import { Router, type IRouter } from "express";
import {
  CreateCheckoutSessionBody,
  CreateCheckoutSessionResponse,
} from "@workspace/api-zod";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

router.post("/checkout/session", requireAuth, (req, res): void => {
  const parsed = CreateCheckoutSessionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  // A provider connection is intentionally required before this can create
  // a real hosted checkout URL. The storefront surfaces this state clearly.
  const response = CreateCheckoutSessionResponse.parse({
    status: "provider_required",
    checkoutUrl: null,
  });
  res.status(503).json(response);
});

export default router;