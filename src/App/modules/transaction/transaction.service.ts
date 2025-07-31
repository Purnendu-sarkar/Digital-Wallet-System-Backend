import httpStatus from "http-status-codes";
import AppError from "../../errorHelpers/AppError";
import { User } from "../user/user.model";
import { TransactionStatus, TransactionType } from "./transaction.interface";
import { Role } from "../user/user.interface";
import { Transaction } from "./transaction.model";

const topUp = async (userId: string, amount: number) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found");
    }
    if (user.isDeleted) {
        throw new AppError(httpStatus.BAD_REQUEST, "User is deleted");
    }
    if (user.wallet.isBlocked) {
        throw new AppError(httpStatus.BAD_REQUEST, "Wallet is blocked");
    }

    user.wallet.balance += amount;
    await user.save();

    const transaction = await Transaction.create({
        sender: user._id,
        amount,
        type: TransactionType.TOP_UP,
        status: TransactionStatus.COMPLETED,
        fee: 0,
        commission: 0,
    });

    return transaction;
};

const withdraw = async (userId: string, amount: number) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found");
    }
    if (user.isDeleted) {
        throw new AppError(httpStatus.BAD_REQUEST, "User is deleted");
    }
    if (user.wallet.isBlocked) {
        throw new AppError(httpStatus.BAD_REQUEST, "Wallet is blocked");
    }
    if (user.wallet.balance < amount) {
        throw new AppError(httpStatus.BAD_REQUEST, "Insufficient balance");
    }

    user.wallet.balance -= amount;
    await user.save();

    const transaction = await Transaction.create({
        sender: user._id,
        amount,
        type: TransactionType.WITHDRAW,
        status: TransactionStatus.COMPLETED,
        fee: 0,
        commission: 0,
    });

    return transaction;
};

const sendMoney = async (senderId: string, receiverId: string, amount: number) => {
    const sender = await User.findById(senderId);
    const receiver = await User.findById(receiverId);
    if (!sender || !receiver) {
        throw new AppError(httpStatus.NOT_FOUND, "Sender or receiver not found");
    }
    if (sender.isDeleted || receiver.isDeleted) {
        throw new AppError(httpStatus.BAD_REQUEST, "Sender or receiver is deleted");
    }
    if (sender.wallet.isBlocked || receiver.wallet.isBlocked) {
        throw new AppError(httpStatus.BAD_REQUEST, "Sender or receiver wallet is blocked");
    }
    if (sender.wallet.balance < amount) {
        throw new AppError(httpStatus.BAD_REQUEST, "Insufficient balance");
    }

    sender.wallet.balance -= amount;
    receiver.wallet.balance += amount;
    await sender.save();
    await receiver.save();

    const transaction = await Transaction.create({
        sender: sender._id,
        receiver: receiver._id,
        amount,
        type: TransactionType.SEND_MONEY,
        status: TransactionStatus.COMPLETED,
        fee: 0,
        commission: 0,
    });

    return transaction;
};

const cashIn = async (agentId: string, userId: string, amount: number) => {
    const agent = await User.findById(agentId);
    const user = await User.findById(userId);
    if (!agent || !user) {
        throw new AppError(httpStatus.NOT_FOUND, "Agent or user not found");
    }
    if (agent.isDeleted || user.isDeleted) {
        throw new AppError(httpStatus.BAD_REQUEST, "Agent or user is deleted");
    }
    if (agent.role !== Role.AGENT || agent.agentApprovalStatus !== "APPROVED") {
        throw new AppError(httpStatus.FORBIDDEN, "Agent is not approved");
    }
    if (user.wallet.isBlocked) {
        throw new AppError(httpStatus.BAD_REQUEST, "User wallet is blocked");
    }
    if (agent.wallet.balance < amount) {
        throw new AppError(httpStatus.BAD_REQUEST, "Agent has insufficient balance");
    }

    agent.wallet.balance -= amount;
    user.wallet.balance += amount;
    await agent.save();
    await user.save();

    const transaction = await Transaction.create({
        sender: user._id,
        agent: agent._id,
        amount,
        type: TransactionType.CASH_IN,
        status: TransactionStatus.COMPLETED,
        fee: 0,
        commission: 0,
    });

    return transaction;
};

const cashOut = async (agentId: string, userId: string, amount: number) => {
    const agent = await User.findById(agentId);
    const user = await User.findById(userId);
    if (!agent || !user) {
        throw new AppError(httpStatus.NOT_FOUND, "Agent or user not found");
    }
    if (agent.isDeleted || user.isDeleted) {
        throw new AppError(httpStatus.BAD_REQUEST, "Agent or user is deleted");
    }
    if (agent.role !== Role.AGENT || agent.agentApprovalStatus !== "APPROVED") {
        throw new AppError(httpStatus.FORBIDDEN, "Agent is not approved");
    }
    if (user.wallet.isBlocked) {
        throw new AppError(httpStatus.BAD_REQUEST, "User wallet is blocked");
    }
    if (user.wallet.balance < amount) {
        throw new AppError(httpStatus.BAD_REQUEST, "Insufficient balance");
    }

    user.wallet.balance -= amount;
    agent.wallet.balance += amount;

    await user.save();
    await agent.save();

    const transaction = await Transaction.create({
        sender: user._id,
        agent: agent._id,
        amount,
        type: TransactionType.CASH_OUT,
        status: TransactionStatus.COMPLETED,
        fee: 0,
        commission: 0,
    });

    return transaction;
};

const getTransactionHistory = async (userId: string) => {
    const user = await User.findById(userId);
    if (!user || user.isDeleted) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found or deleted");
    }
    const transactions = await Transaction.find({
        $or: [{ sender: userId }, { receiver: userId }, { agent: userId }],
    })
        .populate("sender", "name email")
        .populate("receiver", "name email")
        .populate("agent", "name email")
        .sort({ createdAt: -1 });

    return transactions;
};

export const TransactionServices = {
    topUp,
    withdraw,
    sendMoney,
    cashIn,
    cashOut,
    getTransactionHistory,
};