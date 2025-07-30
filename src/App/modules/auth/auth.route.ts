import { NextFunction, Request, Response, Router } from "express";
import { AuthControllers } from "./auth.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { loginZodSchema, resetPasswordZodSchema } from "./auth.validation";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import passport from "passport";


const router = Router();

router.post("/login", validateRequest(loginZodSchema), AuthControllers.credentialsLogin);
router.post("/refresh-token", AuthControllers.getNewAccessToken);
router.post("/logout", AuthControllers.logout);
router.post("/reset-password", validateRequest(resetPasswordZodSchema),
  checkAuth(...Object.values(Role)), AuthControllers.resetPassword);


router.get(
  "/google",
   async (req: Request, res: Response, next: NextFunction) => {
    const redirect = req.query.redirect || "/"
    passport.authenticate("google", { 
      scope: ["profile", "email"], 
      state: redirect as string })(req, res, next)
})

router.get(
  "/google/callback",
  passport.authenticate("google", {
     failureRedirect: "/login", 
     session: false 
    }),
  AuthControllers.googleCallbackController
);




export const AuthRoutes = router;