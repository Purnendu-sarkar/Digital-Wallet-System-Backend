import { Router } from "express";
import { UserRoutes } from "../modules/user/user.route";
import { AuthRoutes } from "../modules/auth/auth.route";
import { AdminRoutes } from "../modules/admin/admin.route";
import { TransactionRoutes } from "../modules/transaction/transaction.route";

export const router = Router();

const moduleRoutes = [
  {
    path: "/user",
    route: UserRoutes,
  },
  {
    path: "/auth",
    route: AuthRoutes
  },
   {
    path: "/admin",
    route: AdminRoutes,
  },
   {
    path: "/transaction",
    route: TransactionRoutes
  },
];

moduleRoutes.forEach((route) => {
  router.use(route.path, route.route);
});