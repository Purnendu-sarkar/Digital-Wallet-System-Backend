import httpStatus from "http-status-codes";
import AppError from "../../errorHelpers/AppError";
import { User } from "../user/user.model";
import { TransactionStatus, TransactionType } from "./transaction.interface";
import { Role } from "../user/user.interface";
import { Transaction } from "./transaction.model";
import { envVars } from "../../config/env";



const calculateFeeAndCommission = (amount: number, type: TransactionType) => {
    const feePercentage = Number(envVars.TRANSACTION_FEE_PERCENTAGE) / 100;
    const commissionPercentage = Number(envVars.AGENT_COMMISSION_PERCENTAGE) / 100;
    let fee = 0;
    let commission = 0;

    if ([TransactionType.SEND_MONEY, TransactionType.CASH_OUT].includes(type)) {
        fee = amount * feePercentage;
    }
    if ([TransactionType.CASH_IN, TransactionType.CASH_OUT].includes(type)) {
        commission = amount * commissionPercentage;
    }

    return { fee, commission };
};


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

    const { fee } = calculateFeeAndCommission(amount, TransactionType.SEND_MONEY);
    const totalDeduction = amount + fee;

    if (sender.wallet.balance < totalDeduction) {
        throw new AppError(httpStatus.BAD_REQUEST, "Insufficient balance including fee");
    }

    sender.wallet.balance -= totalDeduction;
    receiver.wallet.balance += amount;
    await sender.save();
    await receiver.save();

    const transaction = await Transaction.create({
        sender: sender._id,
        receiver: receiver._id,
        amount,
        fee,
        commission: 0,
        type: TransactionType.SEND_MONEY,
        status: TransactionStatus.COMPLETED,
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

    const { commission } = calculateFeeAndCommission(amount, TransactionType.CASH_IN);

    agent.wallet.balance -= amount;
    agent.wallet.balance += commission;
    user.wallet.balance += amount;
    await agent.save();
    await user.save();

    const transaction = await Transaction.create({
        sender: user._id,
        agent: agent._id,
        amount,
        fee: 0,
        commission,
        type: TransactionType.CASH_IN,
        status: TransactionStatus.COMPLETED,
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

    const { fee, commission } = calculateFeeAndCommission(amount, TransactionType.CASH_OUT);
    const totalDeduction = amount + fee;

    if (user.wallet.balance < totalDeduction) {
        throw new AppError(httpStatus.BAD_REQUEST, "Insufficient balance including fee");
    }

    user.wallet.balance -= totalDeduction;
    agent.wallet.balance += amount;
    agent.wallet.balance += commission;
    await user.save();
    await agent.save();

    const transaction = await Transaction.create({
        sender: user._id,
        agent: agent._id,
        amount,
        fee,
        commission,
        type: TransactionType.CASH_OUT,
        status: TransactionStatus.COMPLETED,
    });

    return transaction;
};

const getTransactionHistory = async (userId: string) => {
    const user = await User.findById(userId);
    if (!user || user.isDeleted) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found or deleted");
    }
    let transactions;
    if (user.role === Role.ADMIN) {
        transactions = await Transaction.find({})
            .populate("sender", "name email")
            .populate("receiver", "name email")
            .populate("agent", "name email")
            .sort({ createdAt: -1 });
    } else {
        transactions = await Transaction.find({
            $or: [{ sender: userId }, { receiver: userId }, { agent: userId }],
        })
            .populate("sender", "name email")
            .populate("receiver", "name email")
            .populate("agent", "name email")
            .sort({ createdAt: -1 });
    }

    const totalTransactions = transactions.length;
    const totalCommission = user.role === Role.AGENT
        ? transactions.reduce((sum, tx) => sum + (tx.commission || 0), 0)
        : 0;

    return {
        meta: {
            totalTransactions: totalTransactions,
            totalCommission: user.role === Role.AGENT ? totalCommission : undefined,
        },
        data: transactions,

    };
};

export const TransactionServices = {
    topUp,
    withdraw,
    sendMoney,
    cashIn,
    cashOut,
    getTransactionHistory,
};