"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionServices = void 0;
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const user_model_1 = require("../user/user.model");
const transaction_interface_1 = require("./transaction.interface");
const user_interface_1 = require("../user/user.interface");
const transaction_model_1 = require("./transaction.model");
const topUp = (userId, amount) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.findById(userId);
    if (!user) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "User not found");
    }
    if (user.isDeleted) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "User is deleted");
    }
    if (user.wallet.isBlocked) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Wallet is blocked");
    }
    user.wallet.balance += amount;
    yield user.save();
    const transaction = yield transaction_model_1.Transaction.create({
        sender: user._id,
        amount,
        type: transaction_interface_1.TransactionType.TOP_UP,
        status: transaction_interface_1.TransactionStatus.COMPLETED,
        fee: 0,
        commission: 0,
    });
    return transaction;
});
const withdraw = (userId, amount) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.findById(userId);
    if (!user) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "User not found");
    }
    if (user.isDeleted) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "User is deleted");
    }
    if (user.wallet.isBlocked) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Wallet is blocked");
    }
    if (user.wallet.balance < amount) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Insufficient balance");
    }
    user.wallet.balance -= amount;
    yield user.save();
    const transaction = yield transaction_model_1.Transaction.create({
        sender: user._id,
        amount,
        type: transaction_interface_1.TransactionType.WITHDRAW,
        status: transaction_interface_1.TransactionStatus.COMPLETED,
        fee: 0,
        commission: 0,
    });
    return transaction;
});
const sendMoney = (senderId, receiverId, amount) => __awaiter(void 0, void 0, void 0, function* () {
    const sender = yield user_model_1.User.findById(senderId);
    const receiver = yield user_model_1.User.findById(receiverId);
    if (!sender || !receiver) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Sender or receiver not found");
    }
    if (sender.isDeleted || receiver.isDeleted) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Sender or receiver is deleted");
    }
    if (sender.wallet.isBlocked || receiver.wallet.isBlocked) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Sender or receiver wallet is blocked");
    }
    if (sender.wallet.balance < amount) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Insufficient balance");
    }
    sender.wallet.balance -= amount;
    receiver.wallet.balance += amount;
    yield sender.save();
    yield receiver.save();
    const transaction = yield transaction_model_1.Transaction.create({
        sender: sender._id,
        receiver: receiver._id,
        amount,
        type: transaction_interface_1.TransactionType.SEND_MONEY,
        status: transaction_interface_1.TransactionStatus.COMPLETED,
        fee: 0,
        commission: 0,
    });
    return transaction;
});
const cashIn = (agentId, userId, amount) => __awaiter(void 0, void 0, void 0, function* () {
    const agent = yield user_model_1.User.findById(agentId);
    const user = yield user_model_1.User.findById(userId);
    if (!agent || !user) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Agent or user not found");
    }
    if (agent.isDeleted || user.isDeleted) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Agent or user is deleted");
    }
    if (agent.role !== user_interface_1.Role.AGENT || agent.agentApprovalStatus !== "APPROVED") {
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "Agent is not approved");
    }
    if (user.wallet.isBlocked) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "User wallet is blocked");
    }
    if (agent.wallet.balance < amount) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Agent has insufficient balance");
    }
    agent.wallet.balance -= amount;
    user.wallet.balance += amount;
    yield agent.save();
    yield user.save();
    const transaction = yield transaction_model_1.Transaction.create({
        sender: user._id,
        agent: agent._id,
        amount,
        type: transaction_interface_1.TransactionType.CASH_IN,
        status: transaction_interface_1.TransactionStatus.COMPLETED,
        fee: 0,
        commission: 0,
    });
    return transaction;
});
const cashOut = (agentId, userId, amount) => __awaiter(void 0, void 0, void 0, function* () {
    const agent = yield user_model_1.User.findById(agentId);
    const user = yield user_model_1.User.findById(userId);
    if (!agent || !user) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Agent or user not found");
    }
    if (agent.isDeleted || user.isDeleted) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Agent or user is deleted");
    }
    if (agent.role !== user_interface_1.Role.AGENT || agent.agentApprovalStatus !== "APPROVED") {
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "Agent is not approved");
    }
    if (user.wallet.isBlocked) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "User wallet is blocked");
    }
    if (user.wallet.balance < amount) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Insufficient balance");
    }
    user.wallet.balance -= amount;
    agent.wallet.balance += amount;
    yield user.save();
    yield agent.save();
    const transaction = yield transaction_model_1.Transaction.create({
        sender: user._id,
        agent: agent._id,
        amount,
        type: transaction_interface_1.TransactionType.CASH_OUT,
        status: transaction_interface_1.TransactionStatus.COMPLETED,
        fee: 0,
        commission: 0,
    });
    return transaction;
});
const getTransactionHistory = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.findById(userId);
    if (!user || user.isDeleted) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "User not found or deleted");
    }
    let transactions;
    if (user.role === user_interface_1.Role.ADMIN) {
        transactions = yield transaction_model_1.Transaction.find({})
            .populate("sender", "name email")
            .populate("receiver", "name email")
            .populate("agent", "name email")
            .sort({ createdAt: -1 });
    }
    else {
        transactions = yield transaction_model_1.Transaction.find({
            $or: [{ sender: userId }, { receiver: userId }, { agent: userId }],
        })
            .populate("sender", "name email")
            .populate("receiver", "name email")
            .populate("agent", "name email")
            .sort({ createdAt: -1 });
    }
    const totalTransactions = transactions.length;
    return {
        meta: {
            total: totalTransactions,
        },
        data: transactions,
    };
});
exports.TransactionServices = {
    topUp,
    withdraw,
    sendMoney,
    cashIn,
    cashOut,
    getTransactionHistory,
};
