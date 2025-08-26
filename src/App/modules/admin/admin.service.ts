/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from "http-status-codes";
import AppError from "../../errorHelpers/AppError";
import { User } from "../user/user.model";
import { Role } from "../user/user.interface";
import { Transaction } from "../transaction/transaction.model";
import { TransactionStatus } from "../transaction/transaction.interface";
import moment from "moment";

const blockWallet = async (userId: string) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found");
    }
    user.wallet.isBlocked = true;
    await user.save();
    return user;
};

const unblockWallet = async (userId: string) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found");
    }
    user.wallet.isBlocked = false;
    //user.isActive = false;
    await user.save();
    return user;
};

const approveAgent = async (agentId: string) => {
    const agent = await User.findById(agentId);
    if (!agent || agent.role !== Role.AGENT) {
        throw new AppError(httpStatus.NOT_FOUND, "Agent not found");
    }
    agent.agentApprovalStatus = "APPROVED";
    await agent.save();
    return agent;
};

const suspendAgent = async (agentId: string) => {
    const agent = await User.findById(agentId);
    if (!agent || agent.role !== Role.AGENT) {
        throw new AppError(httpStatus.NOT_FOUND, "Agent not found");
    }
    agent.agentApprovalStatus = "SUSPENDED";
    await agent.save();
    return agent;
};

const getPendingAgents = async () => {
    const pendingAgents = await User.find(
        { agentApprovalStatus: "PENDING" },
        { _id: 1, email: 1 }
    );
    const total = await User.countDocuments({
        agentApprovalStatus: "PENDING",
    });
    return {
        data: pendingAgents,
        meta: { total },
    };
};

const getStats = async (query: Record<string, string>) => {
    const { filterType, startDate, endDate, specificDate } = query;

    const dateFilter: any = {};
    if (filterType === "last7days") {
        dateFilter.createdAt = {
            $gte: moment().subtract(7, "days").startOf("day").toDate(),
            $lte: moment().endOf("day").toDate(),
        };
    } else if (filterType === "last30days") {
        dateFilter.createdAt = {
            $gte: moment().subtract(30, "days").startOf("day").toDate(),
            $lte: moment().endOf("day").toDate(),
        };
    } else if (filterType === "custom") {
        if (!startDate || !endDate) {
            throw new AppError(httpStatus.BAD_REQUEST, "startDate and endDate are required for custom filter");
        }
        dateFilter.createdAt = {
            $gte: moment(startDate).startOf("day").toDate(),
            $lte: moment(endDate).endOf("day").toDate(),
        };
    } else if (filterType === "specificDate") {
        if (!specificDate) {
            throw new AppError(httpStatus.BAD_REQUEST, "specificDate is required for specificDate filter");
        }
        dateFilter.createdAt = {
            $gte: moment(specificDate).startOf("day").toDate(),
            $lte: moment(specificDate).endOf("day").toDate(),
        };
    } 

    // Total Users
    const totalUsers = await User.countDocuments({
        role: Role.USER,
        isDeleted: false,
        isActive: "ACTIVE",
        ...dateFilter, 
    });

    // Total Agents
    const totalAgents = await User.countDocuments({
        role: Role.AGENT,
        isDeleted: false,
        isActive: "ACTIVE",
        agentApprovalStatus: "APPROVED",
        ...dateFilter, 
    });

    // Transaction Count
    const transactionCount = await Transaction.countDocuments({
        status: TransactionStatus.COMPLETED,
        ...dateFilter,
    });

    // Total Transaction Volume
    const totalVolumeResult = await Transaction.aggregate([
        { $match: { status: TransactionStatus.COMPLETED, ...dateFilter } },
        { $group: { _id: null, totalVolume: { $sum: "$amount" } } },
    ]);

    const totalTransactionVolume = totalVolumeResult.length > 0 ? totalVolumeResult[0].totalVolume : 0;

    return {
        totalUsers,
        totalAgents,
        transactionCount,
        totalTransactionVolume,
    };
};

export const AdminServices = {
    blockWallet,
    unblockWallet,
    approveAgent,
    suspendAgent,
    getPendingAgents,
    getStats,
};
