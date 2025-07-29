import { model, Schema } from "mongoose";
import { IAuthProvider, IsActive, IUser, IWallet, Role } from "./user.interface";

const authProviderSchema = new Schema<IAuthProvider>(
  {
    provider: { type: String, required: true },
    providerId: { type: String, required: true },
  },
  {
    versionKey: false,
    _id: false,
  }
);

const walletSchema = new Schema<IWallet>(
  {
    balance: { type: Number, default: 50 }, // Initial balance ৳50
    isBlocked: { type: Boolean, default: false },
  },
  {
    versionKey: false,
    _id: false,
  }
);

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    role: {
      type: String,
      enum: Object.values(Role),
      default: Role.USER,
    },
    phone: { type: String },
    picture: { type: String },
    address: { type: String },
    isDeleted: { type: Boolean, default: false },
    isActive: {
      type: String,
      enum: Object.values(IsActive),
      default: IsActive.ACTIVE,
    },
    isVerified: { type: Boolean, default: false },
    auths: [authProviderSchema],
    wallet: walletSchema,
    agentApprovalStatus: {
      type: String,
      enum: ["PENDING", "APPROVED", "SUSPENDED"],
      default: "PENDING",
      required: function () {
        return this.role === Role.AGENT;
      },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const User = model<IUser>("User", userSchema);