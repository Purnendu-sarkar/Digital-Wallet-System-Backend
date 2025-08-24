/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { TransactionServices } from "./transaction.service";

interface AuthenticatedUser {
  userId: string;
  email: string;
  role: string;
  [key: string]: any;
}

const topUp = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    throw new Error("User not logged in.");
  }
  const user = req.user as AuthenticatedUser;
  const userId = user.userId;
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
  if (!req.user) {
    throw new Error("User not logged in.");
  }
  const user = req.user as AuthenticatedUser;
  const userId = user.userId;
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
  if (!req.user) {
    throw new Error("User not logged in.");
  }
  const user = req.user as AuthenticatedUser;
  const senderId = user.userId;
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
  if (!req.user) {
    throw new Error("User not logged in.");
  }
  const user = req.user as AuthenticatedUser;
  const agentId = user.userId;
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
  if (!req.user) {
    throw new Error("User not logged in.");
  }
  const user = req.user as AuthenticatedUser;
  const userId = user.userId;
  const { agentId, amount } = req.body;
  const transaction = await TransactionServices.cashOut(agentId, userId, amount);
console.log("req.user:", req.user);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Cash-out successful",
    data: transaction,
  });
});

const getTransactionHistory = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    throw new Error("User not logged in.");
  }
  const user = req.user as AuthenticatedUser;
  const userId = user.userId;
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