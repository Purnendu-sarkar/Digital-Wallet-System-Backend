import { Router } from "express";
import { UserRoutes } from "../modules/user/user.route";
import { AuthRoutes } from "../modules/auth/auth.route";
import { AdminRoutes } from "../modules/admin/admin.route";
import { TransactionRoutes } from "../modules/transaction/transaction.route";
import { NotificationRoutes } from "../modules/notification/notification.route";

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
  {
    path: "/notification",
    route: NotificationRoutes
  },
];

moduleRoutes.forEach((route) => {
  router.use(route.path, route.route);
});