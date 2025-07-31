import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { TransactionServices } from "./transaction.service";

const topUp = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user.userId;
    const { amount } = req.body;
    const transaction = await TransactionServices.topUp(userId, amount);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Top-up successful",
        data: transaction,
    });
});

const withdraw = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user.userId;
    const { amount } = req.body;
    const transaction = await TransactionServices.withdraw(userId, amount);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Withdrawal successful",
        data: transaction,
    });
});

const sendMoney = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const senderId = req.user.userId;
    const { receiverId, amount } = req.body;
    const transaction = await TransactionServices.sendMoney(senderId, receiverId, amount);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Money sent successfully",
        data: transaction,
    });
});

const cashIn = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const agentId = req.user.userId;
    const { userId, amount } = req.body;
    const transaction = await TransactionServices.cashIn(agentId, userId, amount);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Cash-in successful",
        data: transaction,
    });
});

const cashOut = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const agentId = req.user.userId;
    const { userId, amount } = req.body;
    const transaction = await TransactionServices.cashOut(agentId, userId, amount);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Cash-out successful",
        data: transaction,
    });
});

const getTransactionHistory = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user.userId;
    const transactions = await TransactionServices.getTransactionHistory(userId);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Transaction history retrieved successfully",
        data: transactions,
    });
});

export const TransactionControllers = {
    topUp,
    withdraw,
    sendMoney,
    cashIn,
    cashOut,
    getTransactionHistory,
};