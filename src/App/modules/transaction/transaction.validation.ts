import z from "zod";

export const transactionZodSchema = z.object({
    amount: z
        .number({ invalid_type_error: "Amount must be a number" })
        .min(1, { message: "Amount must be at least 1" }),
    receiverId: z
        .string({ invalid_type_error: "Receiver ID must be a string" })
        .optional(),
});

export const cashInOutZodSchema = z.object({
    userId: z.string({ invalid_type_error: "User ID must be a string" }),
    amount: z
        .number({ invalid_type_error: "Amount must be a number" })
        .min(1, { message: "Amount must be at least 1" }),
});