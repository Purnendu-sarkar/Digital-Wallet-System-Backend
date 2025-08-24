import httpStatus from "http-status-codes";
import AppError from "../../errorHelpers/AppError";
import { User } from "../user/user.model";
import { Role } from "../user/user.interface";

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

export const AdminServices = {
    blockWallet,
    unblockWallet,
    approveAgent,
    suspendAgent,
    getPendingAgents,
};
