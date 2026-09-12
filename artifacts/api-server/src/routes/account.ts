import { getAuth } from "@clerk/express";
import { Router, type IRouter } from "express";
import { GetCurrentUserResponse } from "@workspace/api-zod";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/me", requireAuth, (req, res): void => {
  const auth = getAuth(req);
  const claims = auth.sessionClaims as Record<string, unknown> | undefined;
  const email =
    typeof claims?.email === "string"
      ? claims.email
      : typeof claims?.primaryEmailAddress === "string"
        ? claims.primaryEmailAddress
        : "";
  const firstName = typeof claims?.firstName === "string" ? claims.firstName : null;
  const lastName = typeof claims?.lastName === "string" ? claims.lastName : null;

  res.json(
    GetCurrentUserResponse.parse({
      id: auth.userId,
      email,
      firstName,
      lastName,
    }),
  );
});

export default router;