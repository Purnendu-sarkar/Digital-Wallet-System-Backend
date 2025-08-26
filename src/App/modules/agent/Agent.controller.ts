import { httpStatus } from 'http-status-codes';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from '../../utils/sendResponse';
import { TransactionServices } from '../transaction/transaction.service';

interface AuthenticatedUser {
  userId: string;
  email: string;
  role: string;
  [key: string]: any;
}


const getAgentStats = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as AuthenticatedUser;
  const agentId = user.userId;
  const params = req.query as IStatsQueryParams;
  const stats = await TransactionServices.getAgentStats(agentId, params);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Agent stats retrieved successfully",
    data: stats,
  });
});

// TransactionControllers এ অ্যাড করো
export const TransactionControllers = {
  // ... existing
  getAgentStats,
};