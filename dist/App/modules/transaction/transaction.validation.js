"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cashInOutZodSchema = exports.transactionZodSchema = void 0;
const zod_1 = __importDefault(require("zod"));
exports.transactionZodSchema = zod_1.default.object({
    amount: zod_1.default
        .number({ message: "Amount must be a number" })
        .min(1, { message: "Amount must be at least 1" }),
    receiverId: zod_1.default
        .string({ message: "Receiver ID must be a string" })
        .optional(),
});
exports.cashInOutZodSchema = zod_1.default.object({
    userId: zod_1.default.string({ message: "User ID must be a string" }),
    amount: zod_1.default
        .number({ message: "Amount must be a number" })
        .min(1, { message: "Amount must be at least 1" }),
});
