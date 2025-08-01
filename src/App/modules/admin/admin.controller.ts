/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { AdminServices } from "./admin.service";
import { envVars } from "../../config/env";

const blockWallet = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.id;
    const user = await AdminServices.blockWallet(userId);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Wallet blocked successfully",
        data: user,
    });
});

const unblockWallet = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.id;
    const user = await AdminServices.unblockWallet(userId);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Wallet unblocked successfully",
        data: user,
    });
});

const approveAgent = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const agentId = req.params.id;
    const agent = await AdminServices.approveAgent(agentId);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Agent approved successfully",
        data: agent,
    });
});

const suspendAgent = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const agentId = req.params.id;
    const agent = await AdminServices.suspendAgent(agentId);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Agent suspended successfully",
        data: agent,
    });
});


const getPendingAgents = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const result = await AdminServices.getPendingAgents();

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Pending Agents Retrieved Successfully",
        data: result.data,
        meta: result.meta,
    });
});

const updateSystemParameters = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { transactionFeePercentage, agentCommissionPercentage } = req.body;
    process.env.TRANSACTION_FEE_PERCENTAGE = transactionFeePercentage?.toString() || envVars.TRANSACTION_FEE_PERCENTAGE;
    process.env.AGENT_COMMISSION_PERCENTAGE = agentCommissionPercentage?.toString() || envVars.AGENT_COMMISSION_PERCENTAGE;

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "System parameters updated successfully",
        data: {
            transactionFeePercentage: Number(process.env.TRANSACTION_FEE_PERCENTAGE),
            agentCommissionPercentage: Number(process.env.AGENT_COMMISSION_PERCENTAGE),
        },
    });
});

export const AdminControllers = {
    blockWallet,
    unblockWallet,
    approveAgent,
    suspendAgent,
    getPendingAgents,
    updateSystemParameters,
};
