import { IUser } from "./user.interface";
import { User } from "./user.model";

const createUser = async (payload: Partial<IUser>) => {
  // if (!payload) {
  //   throw new Error('Payload is required to create user');
  // }
  const { name, email, role } = payload;

  const user = await User.create({
    name,
    email,
    role: role || "USER",
    wallet: {
      balance: 50,
      isBlocked: false,
    },
    agentApprovalStatus: role === "AGENT" ? "PENDING" : undefined,
  });

  return user;
};

const getAllUsers = async () => {
  const users = await User.find({ isDeleted: false });
  const totalUsers = await User.countDocuments({ isDeleted: false });
  return {
    data: users,
    meta: {
      total: totalUsers,
    },
  };
};

export const UserServices = {
  createUser,
  getAllUsers,
};