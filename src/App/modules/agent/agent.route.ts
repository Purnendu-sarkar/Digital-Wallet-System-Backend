import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { TransactionControllers } from "./Agent.controller";

const router = Router();

router.get("/agent-stats", checkAuth(Role.AGENT), TransactionControllers.getAgentStats);

export const AgentRoutes = router;