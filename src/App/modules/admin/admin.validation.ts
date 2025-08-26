import z from "zod";

export const updateSystemParametersZodSchema = z.object({
    transactionFeePercentage: z.number().min(0).max(100).optional(),
    agentCommissionPercentage: z.number().min(0).max(100).optional(),
});

export const statsQueryZodSchema = z.object({
    filterType: z.enum(["last7days", "last30days", "custom", "specificDate"]).optional(),
    startDate: z.string().optional().refine((val) => !val || !isNaN(Date.parse(val)), {
        message: "Invalid startDate format",
    }),
    endDate: z.string().optional().refine((val) => !val || !isNaN(Date.parse(val)), {
        message: "Invalid endDate format",
    }),
    specificDate: z.string().optional().refine((val) => !val || !isNaN(Date.parse(val)), {
        message: "Invalid specificDate format",
    }),
}).refine((data) => {
    if (data.filterType === "custom") {
        return data.startDate && data.endDate;
    }
    if (data.filterType === "specificDate") {
        return data.specificDate;
    }
    return true;
}, {
    message: "startDate and endDate are required when filterType is custom; specificDate is required when filterType is specificDate",
}).default({}); 