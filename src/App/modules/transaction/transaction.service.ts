import { envVars } from "../../config/env";
import httpStatus from "http-status-codes";
import AppError from "../../errorHelpers/AppError";
import { User } from "../user/user.model";
import { TransactionStatus, TransactionType } from "./transaction.interface";
import { Role } from "../user/user.interface";
import { Transaction } from "./transaction.model";
import moment from "moment";
import { sendConsoleNotification, sendWebhookNotification } from "../../utils/notify";

// Helper function to calculate fees and commissions
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

// Helper function to check transaction limits
const checkTransactionLimits = async (userId: string, amount: number, role: Role, type: TransactionType) => {
    const dailyLimit = role === Role.AGENT ? Number(envVars.DAILY_AGENT_LIMIT) : Number(envVars.DAILY_USER_LIMIT);
    const monthlyLimit = role === Role.AGENT ? Number(envVars.MONTHLY_AGENT_LIMIT) : Number(envVars.MONTHLY_USER_LIMIT);

    const todayStart = moment().startOf("day").toDate();
    const monthStart = moment().startOf("month").toDate();

    const dailyTransactions = await Transaction.find({
        $or: [{ sender: userId }, { agent: userId }],
        type,
        createdAt: { $gte: todayStart },
        status: TransactionStatus.COMPLETED,
    });

    const monthlyTransactions = await Transaction.find({
        $or: [{ sender: userId }, { agent: userId }],
        type,
        createdAt: { $gte: monthStart },
        status: TransactionStatus.COMPLETED,
    });

    const dailyTotal = dailyTransactions.reduce((sum, tx) => sum + tx.amount, 0);
    const monthlyTotal = monthlyTransactions.reduce((sum, tx) => sum + tx.amount, 0);

    if (dailyTotal + amount > dailyLimit) {
        throw new AppError(httpStatus.BAD_REQUEST, `Daily ${type} limit exceeded`);
    }
    if (monthlyTotal + amount > monthlyLimit) {
        throw new AppError(httpStatus.BAD_REQUEST, `Monthly ${type} limit exceeded`);
    }
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
    if (user.role === Role.AGENT && user.agentApprovalStatus !== "APPROVED") {
        throw new AppError(httpStatus.FORBIDDEN, "Agent is not approved for top-up");
    }

    await checkTransactionLimits(userId, amount, user.role, TransactionType.TOP_UP);

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

    await sendConsoleNotification(transaction);
    await sendWebhookNotification(transaction);

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
    if (user.role === Role.AGENT && user.agentApprovalStatus !== "APPROVED") {
        throw new AppError(httpStatus.FORBIDDEN, "Agent is not approved for withdrawal");
    }
    if (user.wallet.balance < amount) {
        throw new AppError(httpStatus.BAD_REQUEST, "Insufficient balance");
    }

    await checkTransactionLimits(userId, amount, user.role, TransactionType.WITHDRAW);

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

    await sendConsoleNotification(transaction);
    await sendWebhookNotification(transaction);

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

    await checkTransactionLimits(senderId, amount, sender.role, TransactionType.SEND_MONEY);

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

    await sendConsoleNotification(transaction);
    await sendWebhookNotification(transaction);

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

    await checkTransactionLimits(agentId, amount, agent.role, TransactionType.CASH_IN);

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

    await sendConsoleNotification(transaction);
    await sendWebhookNotification(transaction);

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

    await checkTransactionLimits(agentId, amount, agent.role, TransactionType.CASH_OUT);

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

    await sendConsoleNotification(transaction);
    await sendWebhookNotification(transaction);

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