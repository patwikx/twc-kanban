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
  
  try {
    // Get all users for global notification
    const users = await prisma.user.findMany({
      select: { id: true, firstName: true, lastName: true }
    });

    const creator = users.find(u => u.id === session.user.id);
    const creatorName = creator ? `${creator.firstName} ${creator.lastName}` : 'Unknown user';

    const utility = await prisma.propertyUtility.create({
      data: {
        propertyId: data.propertyId as string,
        utilityType: data.utilityType as any,
        provider: data.provider as string,
        accountNumber: data.accountNumber as string,
        meterNumber: data.meterNumber as string,
      },
      include: {
        property: true,
      },
    });

    await createAuditLog({
      entityId: utility.id,
      entityType: EntityType.UTILITY_BILL,
      action: "CREATE",
      changes: data,
    });

    // Notify all users about the new utility
    await Promise.all(
      users.map(user =>
        createNotification({
          userId: user.id,
          title: "New Utility Added",
          message: `${utility.utilityType} utility has been added to property "${utility.property.propertyName}" by ${creatorName}`,
          type: NotificationType.UTILITY,
          entityId: utility.id,
          entityType: EntityType.UTILITY_BILL,
          actionUrl: `/dashboard/properties/${utility.propertyId}`,
        })
      )
    );

    revalidatePath(`/dashboard/properties/${data.propertyId}`);
    return utility;
  } catch (error) {
    throw new Error("Failed to create utility");
  }
}

export async function updateUtility(id: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const data = Object.fromEntries(formData);

  try {
    const users = await prisma.user.findMany({
      select: { id: true, firstName: true, lastName: true }
    });

    const updater = users.find(u => u.id === session.user.id);
    const updaterName = updater ? `${updater.firstName} ${updater.lastName}` : 'Unknown user';

    const utility = await prisma.propertyUtility.update({
      where: { id },
      data: {
        utilityType: data.utilityType as any,
        provider: data.provider as string,
        accountNumber: data.accountNumber as string,
        meterNumber: data.meterNumber as string,
      },
      include: {
        property: true,
      },
    });

    await createAuditLog({
      entityId: utility.id,
      entityType: EntityType.UTILITY_BILL,
      action: "UPDATE",
      changes: data,
    });

    // Notify all users about the utility update
    await Promise.all(
      users.map(user =>
        createNotification({
          userId: user.id,
          title: "Utility Updated",
          message: `${utility.utilityType} utility for property "${utility.property.propertyName}" has been updated by ${updaterName}`,
          type: NotificationType.UTILITY,
          entityId: utility.id,
          entityType: EntityType.UTILITY_BILL,
          actionUrl: `/dashboard/properties/${utility.propertyId}`,
        })
      )
    );

    revalidatePath(`/dashboard/properties/${utility.propertyId}`);
    return utility;
  } catch (error) {
    throw new Error("Failed to update utility");
  }
}

export async function deleteUtility(id: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  try {
    const users = await prisma.user.findMany({
      select: { id: true, firstName: true, lastName: true }
    });

    const deleter = users.find(u => u.id === session.user.id);
    const deleterName = deleter ? `${deleter.firstName} ${deleter.lastName}` : 'Unknown user';

    const utility = await prisma.propertyUtility.delete({
      where: { id },
      include: {
        property: true,
      },
    });

    await createAuditLog({
      entityId: utility.id,
      entityType: EntityType.UTILITY_BILL,
      action: "DELETE",
    });

    // Notify all users about the utility deletion
    await Promise.all(
      users.map(user =>
        createNotification({
          userId: user.id,
          title: "Utility Deleted",
          message: `${utility.utilityType} utility for property "${utility.property.propertyName}" has been deleted by ${deleterName}`,
          type: NotificationType.UTILITY,
          priority: "HIGH",
          entityId: utility.id,
          entityType: EntityType.UTILITY_BILL,
          actionUrl: `/dashboard/properties/${utility.propertyId}`,
        })
      )
    );

    revalidatePath(`/dashboard/properties/${utility.propertyId}`);
    return utility;
  } catch (error) {
    throw new Error("Failed to delete utility");
  }
}