import bcryptjs from "bcryptjs";
import httpStatus from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";
import AppError from "../../errorHelpers/AppError";
import { IAuthProvider, IUser, Role } from "./user.interface";
import { User } from "./user.model";
import { envVars } from "../../config/env";

const createUser = async (payload: Partial<IUser>) => {
  // if (!payload) {
  //   throw new Error('Payload is required to create user');
  // }
  const { email, password, role, ...rest } = payload;

  const isUserExist = await User.findOne({ email });
  if (isUserExist) {
    throw new AppError(httpStatus.BAD_REQUEST, "User Already Exist");
  }

  const hashedPassword = password
    ? await bcryptjs.hash(password as string, Number(envVars.BCRYPT_SALT_ROUND))
    : undefined;

  const authProvider: IAuthProvider = { provider: "credentials", providerId: email as string };

  const user = await User.create({
    email,
    password: hashedPassword,
    auths: [authProvider],
    wallet: {
      balance: 50,
      isBlocked: false,
    },
    agentApprovalStatus: role === "AGENT" ? "PENDING" : undefined,
    ...rest,
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

const updateUser = async (userId: string, payload: Partial<IUser>, decodedToken: JwtPayload) => {
  const ifUserExist = await User.findById(userId);
  if (!ifUserExist) {
    throw new AppError(httpStatus.NOT_FOUND, "User Not Found");
  }

  if (payload.role || payload.isActive || payload.isDeleted || payload.isVerified || payload.agentApprovalStatus) {
    if (decodedToken.role !== Role.ADMIN) {
      throw new AppError(httpStatus.FORBIDDEN, "You are not authorized");
    }
  }

  if (payload.password) {
    payload.password = await bcryptjs.hash(payload.password, Number(envVars.BCRYPT_SALT_ROUND));
  }

  const newUpdatedUser = await User.findByIdAndUpdate(userId, payload, { new: true, runValidators: true });

  return newUpdatedUser;
};

export const UserServices = {
  createUser,
  getAllUsers,
  updateUser,
};