import { Router } from "express";
import { AuthControllers } from "./auth.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { loginZodSchema } from "./auth.validation";


const router = Router();

router.post("/login", validateRequest(loginZodSchema), AuthControllers.credentialsLogin);

export const AuthRoutes = router;