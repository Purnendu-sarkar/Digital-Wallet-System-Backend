import { Router } from "express";
import { AdminControllers } from "./admin.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";

const router = Router();

router.patch("/wallets/block/:id", checkAuth(Role.ADMIN), AdminControllers.blockWallet);
router.patch("/wallets/unblock/:id", checkAuth(Role.ADMIN), AdminControllers.unblockWallet);
router.patch("/agents/approve/:id", checkAuth(Role.ADMIN), AdminControllers.approveAgent);
router.patch("/agents/suspend/:id", checkAuth(Role.ADMIN), AdminControllers.suspendAgent);
router.get("/agents/pending", checkAuth(Role.ADMIN), AdminControllers.getPendingAgents);

export const AdminRoutes = router;