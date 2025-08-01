import z from "zod";

export const updateSystemParametersZodSchema = z.object({
    transactionFeePercentage: z.number().min(0).max(100).optional(),
    agentCommissionPercentage: z.number().min(0).max(100).optional(),
});