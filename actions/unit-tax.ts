'use server';

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";

import { createAuditLog } from "@/lib/audit";
import { EntityType, NotificationType } from "@prisma/client";
import { AppError } from "@/lib/utils/error";
import { auth } from "@/auth";
import { createNotification } from "@/lib/utils/notifications";

export async function createUnitTax(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new AppError("Unauthorized", 401);
  }

  const data = Object.fromEntries(formData);
  
  try {
    // Get all users for global notification
    const users = await prisma.user.findMany({
      select: { id: true, firstName: true, lastName: true }
    });

    const creator = users.find(u => u.id === session.user.id);
    const creatorName = creator ? `${creator.firstName} ${creator.lastName}` : 'Unknown user';

    const unitTax = await prisma.unitTax.create({
      data: {
        unit: {
          connect: {
            id: data.unitId as string
          }
        },
        taxYear: parseInt(data.taxYear as string),
        taxDecNo: data.taxDecNo as string,
        taxAmount: parseFloat(data.taxAmount as string),
        dueDate: new Date(data.dueDate as string),
        isAnnual: data.isAnnual === "true",
        isQuarterly: data.isQuarterly === "true",
        whatQuarter: data.whatQuarter as string || null,
        processedBy: data.processedBy as string || null,
        remarks: data.remarks as string || null,
        markedAsPaidBy: data.markedAsPaidBy as string || null,
      },
      include: {
        unit: {
          include: {
            property: true
          }
        }
      },
    });

    await createAuditLog({
      entityId: unitTax.id,
      entityType: EntityType.UNIT_TAX,
      action: "CREATE",
      changes: data,
    });

    // Notify all users about the new unit tax
    await Promise.all(
      users.map(user =>
        createNotification({
          userId: user.id,
          title: "Unit Tax Added",
          message: `Real Property Tax record has been added for space ${unitTax.unit.unitNumber} in ${unitTax.unit.property.propertyName} by ${creatorName}.`,
          type: NotificationType.TAX,
          entityId: unitTax.id,
          entityType: EntityType.UNIT_TAX,
          actionUrl: `/dashboard/spaces/${unitTax.unit.id}`,
        })
      )
    );

    revalidatePath("/dashboard/spaces");
    return unitTax;
  } catch (error) {
    console.error('Prisma error:', error);
    throw new AppError(
      "Failed to create property tax record",
      500,
      "UNIT_TAX_CREATE_ERROR"
    );
  }
}

export async function updateUnitTax(id: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new AppError("Unauthorized", 401);
  }

  const data = Object.fromEntries(formData);
  
  try {
    const users = await prisma.user.findMany({
      select: { id: true, firstName: true, lastName: true }
    });

    const updater = users.find(u => u.id === session.user.id);
    const updaterName = updater ? `${updater.firstName} ${updater.lastName}` : 'Unknown user';

    const unitTax = await prisma.unitTax.update({
      where: { id },
      data: {
        taxYear: parseInt(data.taxYear as string),
        taxDecNo: data.taxDecNo as string,
        taxAmount: parseFloat(data.taxAmount as string),
        dueDate: new Date(data.dueDate as string),
        isPaid: data.isPaid === "true",
        paidDate: data.isPaid === "true" ? new Date() : null,
      },
      include: {
        unit: {
          include: {
            property: true
          }
        }
      },
    });

    await createAuditLog({
      entityId: unitTax.id,
      entityType: EntityType.UNIT_TAX,
      action: "UPDATE",
      changes: data,
    });

    // Notify all users about the unit tax update
    await Promise.all(
      users.map(user =>
        createNotification({
          userId: user.id,
          title: "Unit Tax Updated",
          message: `Real Property Tax record has been updated for space ${unitTax.unit.unitNumber} in ${unitTax.unit.property.propertyName} by ${updaterName}.`,
          type: NotificationType.TAX,
          entityId: unitTax.id,
          entityType: EntityType.UNIT_TAX,
          actionUrl: `/dashboard/spaces?/${unitTax.unit.id}`,
        })
      )
    );

    revalidatePath("/dashboard/spaces");
    return unitTax;
  } catch (error) {
    throw new AppError(
      "Failed to update property tax record",
      500,
      "UNIT_TAX_UPDATE_ERROR"
    );
  }
}

export async function deleteUnitTax(id: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new AppError("Unauthorized", 401);
  }

  try {
    const users = await prisma.user.findMany({
      select: { id: true, firstName: true, lastName: true }
    });

    const deleter = users.find(u => u.id === session.user.id);
    const deleterName = deleter ? `${deleter.firstName} ${deleter.lastName}` : 'Unknown user';

    const unitTax = await prisma.unitTax.delete({
      where: { id },
      include: {
        unit: {
          include: {
            property: true
          }
        }
      },
    });

    await createAuditLog({
      entityId: unitTax.id,
      entityType: EntityType.UNIT_TAX,
      action: "DELETE",
    });

    // Notify all users about the unit tax deletion
    await Promise.all(
      users.map(user =>
        createNotification({
          userId: user.id,
          title: "Unit Tax Deleted",
          message: `Real Property Tax record has been deleted for space ${unitTax.unit.unitNumber} in ${unitTax.unit.property.propertyName} by ${deleterName}.`,
          type: NotificationType.TAX,
          priority: "HIGH",
          entityId: unitTax.id,
          entityType: EntityType.UNIT_TAX,
          actionUrl: `/dashboard/spaces/${unitTax.unit.id}`,
        })
      )
    );

    revalidatePath("/dashboard/spaces");
    return unitTax;
  } catch (error) {
    throw new AppError(
      "Failed to delete property tax record",
      500,
      "UNIT_TAX_DELETE_ERROR"
    );
  }
}