import { Types } from "mongoose";

export enum TransactionType {
    TOP_UP = "TOP_UP",
    WITHDRAW = "WITHDRAW",
    SEND_MONEY = "SEND_MONEY",
    CASH_IN = "CASH_IN",
    CASH_OUT = "CASH_OUT",
}

export enum TransactionStatus {
    PENDING = "PENDING",
    COMPLETED = "COMPLETED",
    REVERSED = "REVERSED",
}

export interface IAgentOverview {
  summary: {
    totalCashIn: number;
    totalCashOut: number;
    totalCommission: number;
    totalTransactions: number;
  };
  recentActivities: ITransaction[];
}

export interface IStatsQueryParams {
  filterType?: "lifetime" | "last7days" | "last30days" | "custom" | "specificDate";
  startDate?: string;
  endDate?: string;
}

export interface ITransaction {
    _id?: Types.ObjectId;
    sender: Types.ObjectId;
    receiver?: Types.ObjectId;
    agent?: Types.ObjectId;
    amount: number;
    fee: number;
    commission: number;
    type: TransactionType;
    status: TransactionStatus;
    createdAt: Date;
    updatedAt: Date;
}