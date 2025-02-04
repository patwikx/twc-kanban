"use server";

import { currentRole } from "@/lib/auth";
import { UserRole } from "@prisma/client";

export const admin = async () => {
  const role = await currentRole();

  if (role === UserRole.ADMIN) {
    return { redirect: "/admin-dashboard" };
  } else if (role === UserRole.STAFF) {
    return { redirect: "/staff-dashboard" };
  }

  return { error: "Forbidden Server Action!" }
};