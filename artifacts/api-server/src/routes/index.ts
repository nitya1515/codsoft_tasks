import { Router, type IRouter } from "express";
import healthRouter from "./health";
import catalogRouter from "./catalog";
import cartRouter from "./cart";
import accountRouter from "./account";
import checkoutRouter from "./checkout";
import projectManagementRouter from "./project-management";

const router: IRouter = Router();

router.use(healthRouter);
router.use(catalogRouter);
router.use(cartRouter);
router.use(accountRouter);
router.use(checkoutRouter);
router.use(projectManagementRouter);

export default router;
