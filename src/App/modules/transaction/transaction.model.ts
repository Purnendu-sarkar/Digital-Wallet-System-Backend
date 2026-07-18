import { model, Schema } from "mongoose";
import { ITransaction, TransactionStatus, TransactionType } from "./transaction.interface";

const transactionSchema = new Schema<ITransaction>(
    {
        sender: { type: Schema.Types.ObjectId, ref: "User"},
        receiver: { type: Schema.Types.ObjectId, ref: "User" },
        agent: { type: Schema.Types.ObjectId, ref: "User" },
        amount: { type: Number, required: true, min: 0 },
        fee: { type: Number, default: 0 },
        commission: { type: Number, default: 0 },
        type: {
            type: String,
            enum: Object.values(TransactionType),
            required: true,
        },
        status: {
            type: String,
            enum: Object.values(TransactionStatus),
            default: TransactionStatus.PENDING,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

transactionSchema.index({ sender: 1, createdAt: -1 });
transactionSchema.index({ receiver: 1, createdAt: -1 });
transactionSchema.index({ agent: 1, createdAt: -1 });
transactionSchema.index({ type: 1, status: 1, createdAt: -1 });

export const Transaction = model<ITransaction>("Transaction", transactionSchema);