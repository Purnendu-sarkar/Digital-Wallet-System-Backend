import { httpStatus } from 'http-status-codes';
import AppError from "../../errorHelpers/AppError";
import { TransactionStatus, TransactionType } from '../transaction/transaction.interface';
import moment from 'moment';
import { Transaction } from '../transaction/transaction.model';
import { Role } from '../user/user.interface';
import { User } from '../user/user.model';

const getAgentStats = async (agentId: string, params: IStatsQueryParams = {}) => {
  const agent = await User.findById(agentId);
  if (!agent || agent.role !== Role.AGENT) {
    throw new AppError(httpStatus.FORBIDDEN, "Not an agent");
  }

  let filter: any = { agent: agentId, status: TransactionStatus.COMPLETED };

  // Date filtering similar to getAdminStats (assuming you have it, else add)
  if (params.filterType === "last7days") {
    filter.createdAt = { $gte: moment().subtract(7, 'days').startOf('day').toDate() };
  } // Add other filters like last30days, custom, etc.

  const transactions = await Transaction.aggregate([
    { $match: filter },
    {
      $group: {
        _id: "$type",
        totalAmount: { $sum: "$amount" },
        totalCount: { $sum: 1 },
        totalCommission: { $sum: "$commission" },
      },
    },
  ]);

  const cashIn = transactions.find(t => t._id === TransactionType.CASH_IN) || { totalAmount: 0, totalCount: 0, totalCommission: 0 };
  const cashOut = transactions.find(t => t._id === TransactionType.CASH_OUT) || { totalAmount: 0, totalCount: 0, totalCommission: 0 };

  return {
    totalCashInAmount: cashIn.totalAmount,
    totalCashInCount: cashIn.totalCount,
    totalCashOutAmount: cashOut.totalAmount,
    totalCashOutCount: cashOut.totalCount,
    totalCommission: cashIn.totalCommission + cashOut.totalCommission,
    walletBalance: agent.wallet.balance,
  };
};

// TransactionServices এ অ্যাড করো
export const TransactionServices = {
  // ... existing
  getAgentStats,
};