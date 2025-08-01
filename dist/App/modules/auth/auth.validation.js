"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPasswordZodSchema = exports.loginZodSchema = void 0;
const zod_1 = __importDefault(require("zod"));
exports.loginZodSchema = zod_1.default.object({
    email: zod_1.default
        .string({ message: "Email must be string" })
        .email({ message: "Invalid email address format." })
        .min(5, { message: "Email must be at least 5 characters long." })
        .max(100, { message: "Email cannot exceed 100 characters." }),
    password: zod_1.default
        .string({ message: "Password must be string" })
        .min(8, { message: "Password must be at least 8 characters long." })
        .regex(/^(?=.*[A-Z])/, { message: "Password must contain at least 1 uppercase letter." })
        .regex(/^(?=.*[!@#$%^&*])/, { message: "Password must contain at least 1 special character." })
        .regex(/^(?=.*\d)/, { message: "Password must contain at least 1 number." }),
});
exports.resetPasswordZodSchema = zod_1.default.object({
    oldPassword: zod_1.default
        .string({ message: "Old password must be string" })
        .min(8, { message: "Old password must be at least 8 characters long." })
        .regex(/^(?=.*[A-Z])/, { message: "Old password must contain at least 1 uppercase letter." })
        .regex(/^(?=.*[!@#$%^&*])/, { message: "Old password must contain at least 1 special character." })
        .regex(/^(?=.*\d)/, { message: "Old password must contain at least 1 number." }),
    newPassword: zod_1.default
        .string({ message: "New password must be string" })
        .min(8, { message: "New password must be at least 8 characters long." })
        .regex(/^(?=.*[A-Z])/, { message: "New password must contain at least 1 uppercase letter." })
        .regex(/^(?=.*[!@#$%^&*])/, { message: "New password must contain at least 1 special character." })
        .regex(/^(?=.*\d)/, { message: "New password must contain at least 1 number." }),
});
