import { Router } from "express";
import { AuthControllers } from "./auth.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { loginZodSchema, resetPasswordZodSchema } from "./auth.validation";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";


const router = Router();

router.post("/login", validateRequest(loginZodSchema), AuthControllers.credentialsLogin);
router.post("/refresh-token", AuthControllers.getNewAccessToken);
router.post("/logout", AuthControllers.logout);
router.post("/reset-password", validateRequest(resetPasswordZodSchema),
    checkAuth(...Object.values(Role)), AuthControllers.resetPassword);

export const AuthRoutes = router;