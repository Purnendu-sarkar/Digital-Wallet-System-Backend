/* eslint-disable @typescript-eslint/no-dynamic-delete */
import bcryptjs from "bcryptjs";
import httpStatus from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";
import AppError from "../../errorHelpers/AppError";
import { IAuthProvider, IUser, Role } from "./user.interface";
import { User } from "./user.model";
import { envVars } from "../../config/env";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { excludeField } from "../../constants";


const userSearchableFields = ["name", "email", "role"];


const createUser = async (payload: Partial<IUser>) => {
  // if (!payload) {
  //   throw new Error('Payload is required to create user');
  // }
  const { email, password, role, ...rest } = payload;

  if (role === Role.ADMIN) {
    throw new AppError(httpStatus.FORBIDDEN, "Cannot create user with ADMIN role manually");
  }

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
    role: role || Role.USER,
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

const getAllUsers = async (query: Record<string, string>) => {
  const filter = { ...query };

  for (const field of excludeField) {
    delete filter[field];
  }

  if (filter.role && filter.role !== "All") {
    if (!Object.values(Role).includes(filter.role as Role)) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        `Invalid role: ${filter.role}. Valid roles are: ${Object.values(Role).join(", ")}`
      );
    }
  } else {
    delete filter.role;
  }

  const validAgentStatuses = ["PENDING", "APPROVED", "SUSPENDED"];
  if (filter.agentApprovalStatus && filter.agentApprovalStatus !== "All" && filter.agentApprovalStatus !== "") {
    if (!validAgentStatuses.includes(filter.agentApprovalStatus as string)) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        `Invalid agent approval status: ${filter.agentApprovalStatus}. Valid statuses are: ${validAgentStatuses.join(", ")}`
      );
    }
  } else {
    delete filter.agentApprovalStatus;
  }

  const queryBuilder = new QueryBuilder(User.find(filter), query)
    .filter()
    .search(userSearchableFields)
    .sort()
    .fields()
    .paginate();

  const [data, meta] = await Promise.all([
    queryBuilder.build(),
    queryBuilder.getMeta(),
  ]);

  return { data, meta };
};

const getUserById = async (userId: string) => {
  const user = await User.findById(userId).select("-password");
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User Not Found");
  }
  return {
    data: user,
  };
}

const getMe = async (userId: string) => {
  const user = await User.findById(userId).select("-password");
  return {
    data: user
  }
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

const searchUsers = async (searchTerm: string) => {
  if (!searchTerm) {
    throw new AppError(httpStatus.BAD_REQUEST, "Search term is required");
  }

  const users = await User.find({
    $or: [
      { email: { $regex: searchTerm, $options: 'i' } },
      { phone: { $regex: searchTerm, $options: 'i' } }
    ]
  }).select("_id name email phone");

  if (users.length === 0) {
    throw new AppError(httpStatus.NOT_FOUND, "No users found");
  }

  return users;
};


export const UserServices = {
  createUser,
  getAllUsers,
  getUserById,
  searchUsers,
  getMe,
  updateUser,
};