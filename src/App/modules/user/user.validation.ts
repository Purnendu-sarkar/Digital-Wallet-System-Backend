import z from "zod";
import { IsActive, Role } from "./user.interface";

export const createUserZodSchema = z.object({
  name: z
    .string({ message: "Name must be string" })
    .min(2, { message: "Name must be at least 2 characters long." })
    .max(50, { message: "Name cannot exceed 50 characters." }),
  email: z
    .string({ message: "Email must be string" })
    .email({ message: "Invalid email address format." })
    .min(5, { message: "Email must be at least 5 characters long." })
    .max(100, { message: "Email cannot exceed 100 characters." }),
  password: z
    .string({ message: "Password must be string" })
    .min(8, { message: "Password must be at least 8 characters long." })
    .regex(/^(?=.*[A-Z])/, { message: "Password must contain at least 1 uppercase letter." })
    .regex(/^(?=.*[!@#$%^&*])/, { message: "Password must contain at least 1 special character." })
    .regex(/^(?=.*\d)/, { message: "Password must contain at least 1 number." }),
  phone: z
    .string({ message: "Phone Number must be string" })
    .regex(/^(?:\+8801[3-9]\d{8}|01[3-9]\d{8})$/, {
      message: "Phone number must be valid for Bangladesh. Format: +8801XXXXXXXXX or 01XXXXXXXXX (11 digits)",
    })
    .optional(),
  address: z
    .string({ message: "Address must be string" })
    .max(200, { message: "Address cannot exceed 200 characters." })
    .optional(),
  role: z.enum(Object.values(Role) as [string]).optional(),
});

export const updateUserZodSchema = z.object({
  name: z
    .string({ message: "Name must be string" })
    .min(2, { message: "Name must be at least 2 characters long." })
    .max(50, { message: "Name cannot exceed 50 characters." })
    .optional(),
  password: z
    .string({ message: "Password must be string" })
    .min(8, { message: "Password must be at least 8 characters long." })
    .regex(/^(?=.*[A-Z])/, { message: "Password must contain at least 1 uppercase letter." })
    .regex(/^(?=.*[!@#$%^&*])/, { message: "Password must contain at least 1 special character." })
    .regex(/^(?=.*\d)/, { message: "Password must contain at least 1 number." })
    .optional(),
  phone: z
    .string({ message: "Phone Number must be string" })
    .regex(/^(?:\+8801[3-9]\d{8}|01[3-9]\d{8})$/, {
      message: "Phone number must be valid for Bangladesh. Format: +8801XXXXXXXXX or 01XXXXXXXXX (11 digits)",
    })
    .optional(),
  address: z
    .string({ message: "Address must be string" })
    .max(200, { message: "Address cannot exceed 200 characters." })
    .optional(),
  role: z.enum(Object.values(Role) as [string]).optional(),
  isActive: z.enum(Object.values(IsActive) as [string]).optional(),
  isDeleted: z.boolean({ message: "isDeleted must be true or false" }).optional(),
  isVerified: z.boolean({ message: "isVerified must be true or false" }).optional(),
  agentApprovalStatus: z.enum(["PENDING", "APPROVED", "SUSPENDED"]).optional(),
});


export const searchUserZodSchema = z.object({
  searchTerm: z.string({ message: "Search term is required" }).min(1),
});