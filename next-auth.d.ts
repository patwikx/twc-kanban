import { UserRole } from "@prisma/client";
import NextAuth, { type DefaultSession } from "next-auth";

export type ExtendedUser = DefaultSession["user"] & {
  id: string;
  firstName: string;
  lastName: string;
  approverId: string;
  pmdId: string;
  deptId: string;
  role: UserRole;
  isTwoFactorEnabled: boolean;
  isOAuth: boolean;
  organizationId: string;
};

declare module "next-auth" {
  interface Session {
    user: ExtendedUser;
  }
}
