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
exports.AdminServices = void 0;
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const user_model_1 = require("../user/user.model");
const user_interface_1 = require("../user/user.interface");
const blockWallet = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.findById(userId);
    if (!user) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "User not found");
    }
    user.wallet.isBlocked = true;
    yield user.save();
    return user;
});
const unblockWallet = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.findById(userId);
    if (!user) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "User not found");
    }
    user.wallet.isBlocked = false;
    yield user.save();
    return user;
});
const approveAgent = (agentId) => __awaiter(void 0, void 0, void 0, function* () {
    const agent = yield user_model_1.User.findById(agentId);
    if (!agent || agent.role !== user_interface_1.Role.AGENT) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Agent not found");
    }
    agent.agentApprovalStatus = "APPROVED";
    yield agent.save();
    return agent;
});
const suspendAgent = (agentId) => __awaiter(void 0, void 0, void 0, function* () {
    const agent = yield user_model_1.User.findById(agentId);
    if (!agent || agent.role !== user_interface_1.Role.AGENT) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Agent not found");
    }
    agent.agentApprovalStatus = "SUSPENDED";
    yield agent.save();
    return agent;
});
const getPendingAgents = () => __awaiter(void 0, void 0, void 0, function* () {
    const pendingAgents = yield user_model_1.User.find({ agentApprovalStatus: "PENDING" }, { _id: 1, email: 1 });
    const total = yield user_model_1.User.countDocuments({
        agentApprovalStatus: "PENDING",
    });
    return {
        data: pendingAgents,
        meta: { total },
    };
});
exports.AdminServices = {
    blockWallet,
    unblockWallet,
    approveAgent,
    suspendAgent,
    getPendingAgents,
};
