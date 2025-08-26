import { Router } from "express";
import { AdminControllers } from "./admin.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { validateRequest } from "../../middlewares/validateRequest";
import { statsQueryZodSchema, updateSystemParametersZodSchema } from "./admin.validation";

const router = Router();

router.patch("/wallets/block/:id", checkAuth(Role.ADMIN), AdminControllers.blockWallet);
router.patch("/wallets/unblock/:id", checkAuth(Role.ADMIN), AdminControllers.unblockWallet);
router.patch("/agents/approve/:id", checkAuth(Role.ADMIN), AdminControllers.approveAgent);
router.patch("/agents/suspend/:id", checkAuth(Role.ADMIN), AdminControllers.suspendAgent);
router.get("/agents/pending", checkAuth(Role.ADMIN), AdminControllers.getPendingAgents);
router.patch(
    "/system-parameters",
    validateRequest(updateSystemParametersZodSchema),
    checkAuth(Role.ADMIN),
    AdminControllers.updateSystemParameters
);

router.get(
    "/stats",
    validateRequest(statsQueryZodSchema),
    checkAuth(Role.ADMIN),
    AdminControllers.getStats
);

export const AdminRoutes = router;