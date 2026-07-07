import { Router, type IRouter } from "express";
import healthRouter from "./health";
import contestsRouter from "./contests";
import problemsRouter from "./problems";
import submissionsRouter from "./submissions";
import teamsRouter from "./teams";
import usersRouter from "./users";

const router: IRouter = Router();

router.use(healthRouter);
router.use(contestsRouter);
router.use(problemsRouter);
router.use(submissionsRouter);
router.use(teamsRouter);
router.use(usersRouter);

export default router;
