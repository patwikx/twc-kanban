'use server';

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { createAuditLog } from "@/lib/audit";
import { EntityType, NotificationType } from "@prisma/client";
import { auth } from "@/auth";
import { createNotification } from "@/lib/utils/notifications";

export async function createUtility(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const data = Object.fromEntries(formData);
  
  const utility = await prisma.propertyUtility.create({
    data: {
      propertyId: data.propertyId as string,
      utilityType: data.utilityType as any,
      provider: data.provider as string,
      accountNumber: data.accountNumber as string,
      meterNumber: data.meterNumber as string,
    },
  });

  await createAuditLog({
    entityId: utility.id,
    entityType: EntityType.UTILITY_BILL,
    action: "CREATE",
    changes: data,
  });

  await createNotification({
    userId: session.user.id,
    title: "New Utility Added",
    message: `${utility.utilityType} utility has been added successfully.`,
    type: NotificationType.UTILITY,
    entityId: utility.id,
    entityType: EntityType.UTILITY_BILL,
  });

  revalidatePath(`/dashboard/properties?selected=${data.propertyId}`);
  return utility;
}