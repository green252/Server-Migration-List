import { Router, type IRouter } from "express";
import healthRouter from "./health";
import immigrationRouter from "./immigration";

const router: IRouter = Router();

router.use(healthRouter);
router.use(immigrationRouter);

export default router;
