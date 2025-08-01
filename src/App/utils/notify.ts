/* eslint-disable no-console */
import { ITransaction } from "../modules/transaction/transaction.interface";
import { User } from "../modules/user/user.model";

export const sendConsoleNotification = async (transaction: ITransaction) => {
    const sender = await User.findById(transaction.sender);
    const receiver = transaction.receiver ? await User.findById(transaction.receiver) : null;
    const agent = transaction.agent ? await User.findById(transaction.agent) : null;

    const message = `
    Transaction Notification:
    Type: ${transaction.type}
    Amount: ৳${transaction.amount}
    Fee: ৳${transaction.fee}
    Commission: ৳${transaction.commission}
    Sender: ${sender?.name} (${sender?.email})
    ${receiver ? `Receiver: ${receiver.name} (${receiver.email})` : ""}
    ${agent ? `Agent: ${agent.name} (${agent.email})` : ""}
    Status: ${transaction.status}
    Timestamp: ${transaction.createdAt}
  `;

    console.log(message);
};

export const sendWebhookNotification = async (transaction: ITransaction) => {
    const payload = {
        transactionId: transaction._id,
        type: transaction.type,
        amount: transaction.amount,
        fee: transaction.fee,
        commission: transaction.commission,
        senderId: transaction.sender,
        receiverId: transaction.receiver,
        agentId: transaction.agent,
        status: transaction.status,
        createdAt: transaction.createdAt,
    };

    console.log("Webhook Notification Sent:", payload);
};