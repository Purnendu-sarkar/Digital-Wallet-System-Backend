import { Router } from "express";
import { TransactionControllers } from "./transaction.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { cashInOutZodSchema, transactionZodSchema } from "./transaction.validation";

const router = Router();

router.post(
    "/top-up",
    validateRequest(transactionZodSchema),
    checkAuth(Role.USER, Role.AGENT),
    TransactionControllers.topUp
);
router.post(
    "/withdraw",
    validateRequest(transactionZodSchema),
    checkAuth(Role.USER, Role.AGENT),
    TransactionControllers.withdraw
);
router.post(
    "/send-money",
    validateRequest(transactionZodSchema),
    checkAuth(Role.USER),
    TransactionControllers.sendMoney
);
router.post(
    "/cash-in",
    validateRequest(cashInOutZodSchema),
    checkAuth(Role.AGENT),
    TransactionControllers.cashIn
);
router.post(
    "/cash-out",
    validateRequest(cashInOutZodSchema),
    checkAuth(Role.AGENT),
    TransactionControllers.cashOut
);
router.get("/history", checkAuth(Role.USER, Role.AGENT, Role.ADMIN), TransactionControllers.getTransactionHistory);

export const TransactionRoutes = router;