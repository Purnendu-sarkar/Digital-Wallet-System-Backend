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
exports.TransactionControllers = void 0;
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const catchAsync_1 = require("../../utils/catchAsync");
const sendResponse_1 = require("../../utils/sendResponse");
const transaction_service_1 = require("./transaction.service");
const topUp = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        throw new Error("User not logged in.");
    }
    const user = req.user;
    const userId = user.userId;
    const { amount } = req.body;
    const transaction = yield transaction_service_1.TransactionServices.topUp(userId, amount);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "Top-up successful",
        data: transaction,
    });
}));
// const topUp = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
//     const userId = req.user.userId;
//     const { amount } = req.body;
//     const transaction = await TransactionServices.topUp(userId, amount);
//     sendResponse(res, {
//         success: true,
//         statusCode: httpStatus.OK,
//         message: "Top-up successful",
//         data: transaction,
//     });
// });
// const withdraw = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
//     const userId = req.user.userId;
//     const { amount } = req.body;
//     const transaction = await TransactionServices.withdraw(userId, amount);
//     sendResponse(res, {
//         success: true,
//         statusCode: httpStatus.OK,
//         message: "Withdrawal successful",
//         data: transaction,
//     });
// });
const withdraw = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        throw new Error("User not logged in.");
    }
    const user = req.user;
    const userId = user.userId;
    const { amount } = req.body;
    const transaction = yield transaction_service_1.TransactionServices.withdraw(userId, amount);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "Withdrawal successful",
        data: transaction,
    });
}));
const sendMoney = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        throw new Error("User not logged in.");
    }
    const user = req.user;
    const senderId = user.userId;
    const { receiverId, amount } = req.body;
    const transaction = yield transaction_service_1.TransactionServices.sendMoney(senderId, receiverId, amount);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "Money sent successfully",
        data: transaction,
    });
}));
// const sendMoney = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
//     const senderId = req.user.userId;
//     const { receiverId, amount } = req.body;
//     const transaction = await TransactionServices.sendMoney(senderId, receiverId, amount);
//     sendResponse(res, {
//         success: true,
//         statusCode: httpStatus.OK,
//         message: "Money sent successfully",
//         data: transaction,
//     });
// });
// const cashIn = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
//     const agentId = req.user.userId;
//     const { userId, amount } = req.body;
//     const transaction = await TransactionServices.cashIn(agentId, userId, amount);
//     sendResponse(res, {
//         success: true,
//         statusCode: httpStatus.OK,
//         message: "Cash-in successful",
//         data: transaction,
//     });
// });
const cashIn = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        throw new Error("User not logged in.");
    }
    const user = req.user;
    const agentId = user.userId;
    const { userId, amount } = req.body;
    const transaction = yield transaction_service_1.TransactionServices.cashIn(agentId, userId, amount);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "Cash-in successful",
        data: transaction,
    });
}));
const cashOut = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        throw new Error("User not logged in.");
    }
    const user = req.user;
    const agentId = user.userId;
    const { userId, amount } = req.body;
    const transaction = yield transaction_service_1.TransactionServices.cashOut(agentId, userId, amount);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "Cash-out successful",
        data: transaction,
    });
}));
// const cashOut = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
//     const agentId = req.user.userId;
//     const { userId, amount } = req.body;
//     const transaction = await TransactionServices.cashOut(agentId, userId, amount);
//     sendResponse(res, {
//         success: true,
//         statusCode: httpStatus.OK,
//         message: "Cash-out successful",
//         data: transaction,
//     });
// });
const getTransactionHistory = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        throw new Error("User not logged in.");
    }
    const user = req.user;
    const userId = user.userId;
    const transactions = yield transaction_service_1.TransactionServices.getTransactionHistory(userId);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "Transaction history retrieved successfully",
        data: transactions,
    });
}));
// const getTransactionHistory = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
//     const userId = req.user.userId;
//     const transactions = await TransactionServices.getTransactionHistory(userId);
//     sendResponse(res, {
//         success: true,
//         statusCode: httpStatus.OK,
//         message: "Transaction history retrieved successfully",
//         data: transactions,
//     });
// });
exports.TransactionControllers = {
    topUp,
    withdraw,
    sendMoney,
    cashIn,
    cashOut,
    getTransactionHistory,
};
