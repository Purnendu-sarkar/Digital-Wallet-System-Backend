

export enum Role {
  ADMIN = "ADMIN",
  USER = "USER",
  AGENT = "AGENT",
}

export enum IsActive {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  BLOCKED = "BLOCKED",
}

export interface IWallet {
  balance: number;
  isBlocked: boolean;
}

export interface IAuthProvider {
  provider: string; // "Google", "Credential"
  providerId: string;
}

export interface IUser {
  name: string;
  email: string;
  password?: string;
  phone?: string;
  picture?: string;
  address?: string;
  isDeleted?: boolean;
  isActive?: IsActive;
  isVerified?: boolean;
  role: Role;
  auths: IAuthProvider[];
  wallet: IWallet;
  agentApprovalStatus?: "PENDING" | "APPROVED" | "SUSPENDED"; // Only for agents
}