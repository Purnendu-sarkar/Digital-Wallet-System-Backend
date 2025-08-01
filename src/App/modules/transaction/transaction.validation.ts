import z from "zod";

export const transactionZodSchema = z.object({
    amount: z
        .number({ message: "Amount must be a number" })
        .min(1, { message: "Amount must be at least 1" }),
    receiverId: z
        .string({ message: "Receiver ID must be a string" })
        .optional(),
});

export const cashInOutZodSchema = z.object({
    userId: z.string({ message: "User ID must be a string" }),
    amount: z
        .number({ message: "Amount must be a number" })
        .min(1, { message: "Amount must be at least 1" }),
});