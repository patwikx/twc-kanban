'use server';

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { createAuditLog } from "@/lib/audit";
import { EntityType, NotificationType, UnitStatus } from "@prisma/client";
import { AppError } from "@/lib/utils/error";
import { auth } from "@/auth";
import { createNotification } from "@/lib/utils/notifications";

export async function createUnit(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new AppError("Unauthorized", 401);
  }

  const data = Object.fromEntries(formData);
  
  try {
    const unit = await prisma.unit.create({
      data: {
        property: {
          connect: {
            id: data.propertyId as string
          }
        },
        unitNumber: data.unitNumber as string,
        unitArea: parseFloat(data.unitArea as string),
        unitRate: parseFloat(data.unitRate as string),
        rentAmount: parseFloat(data.rentAmount as string),
        status: data.status as any,
      },
      include: {
        property: true,
      },
    });

    // Update property total units count
    await prisma.property.update({
      where: { id: data.propertyId as string },
      data: {
        totalUnits: {
          increment: 1
        }
      }
    });

    await createAuditLog({
      entityId: unit.id,
      entityType: EntityType.UNIT,
      action: "CREATE",
      changes: data,
    });

    await createNotification({
      userId: session.user.id,
      title: "New Unit Added",
      message: `Unit ${unit.unitNumber} has been added to ${unit.property.propertyName}.`,
      type: NotificationType.UNIT,
      entityId: unit.id,
      entityType: EntityType.UNIT,
    });

    revalidatePath(`/properties?selected=${data.propertyId}`);
    return unit;
  } catch (error) {
    throw new AppError(
      "Failed to create unit. Please try again.",
      500
    );
  }
}

export async function updateUnit(id: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new AppError("Unauthorized", 401);
  }

  const data = Object.fromEntries(formData);
  
  try {
    const unit = await prisma.unit.update({
      where: { id },
      data: {
        unitNumber: data.unitNumber as string,
        unitArea: parseFloat(data.unitArea as string),
        unitRate: parseFloat(data.unitRate as string),
        rentAmount: parseFloat(data.rentAmount as string),
        status: data.status as any,
      },
      include: {
        property: true,
      },
    });

    await createAuditLog({
      entityId: unit.id,
      entityType: EntityType.UNIT,
      action: "UPDATE",
      changes: data,
    });

    await createNotification({
      userId: session.user.id,
      title: "Unit Updated",
      message: `Unit ${unit.unitNumber} in ${unit.property.propertyName} has been updated.`,
      type: NotificationType.UNIT,
      entityId: unit.id,
      entityType: EntityType.UNIT,
    });

    revalidatePath(`/properties?selected=${unit.propertyId}`);
    return unit;
  } catch (error) {
    throw new AppError(
      "Failed to update unit. Please try again.",
      500
    );
  }
}

export async function deleteUnit(id: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new AppError("Unauthorized", 401);
  }

  try {
    const unit = await prisma.unit.delete({
      where: { id },
      include: {
        property: true,
      },
    });

    // Update property total units count
    await prisma.property.update({
      where: { id: unit.propertyId },
      data: {
        totalUnits: {
          decrement: 1
        }
      }
    });

    await createAuditLog({
      entityId: unit.id,
      entityType: EntityType.UNIT,
      action: "DELETE",
    });

    await createNotification({
      userId: session.user.id,
      title: "Unit Deleted",
      message: `Unit ${unit.unitNumber} has been deleted from ${unit.property.propertyName}.`,
      type: NotificationType.UNIT,
      entityId: unit.id,
      entityType: EntityType.UNIT,
    });

    revalidatePath(`/properties?selected=${unit.propertyId}`);
    return unit;
  } catch (error) {
    throw new AppError(
      "Failed to delete unit. Please try again.",
      500
    );
  }
}

export async function getAvailableUnits() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new AppError("Unauthorized", 401);
  }

  try {
    return await prisma.unit.findMany({
      where: {
        OR: [
          { status: UnitStatus.VACANT },
          { status: UnitStatus.RESERVED }
        ]
      },
      include: {
        property: true
      }
    });
  } catch (error) {
    throw new AppError(
      "Failed to fetch available units",
      500,
      "UNIT_FETCH_ERROR"
    );
  }
}

export async function bulkDeleteUnits(ids: string[]) {
  const session = await auth();
  if (!session?.user?.id) {
  throw new AppError("Unauthorized", 401);
  }
  
  try {
  const units = await prisma.unit.findMany({
  where: {
  id: {
  in: ids,
  },
  },
  include: {
  property: true,
  },
  });
  
  
  await prisma.unit.deleteMany({
    where: {
      id: {
        in: ids,
      },
    },
  });
  
  await Promise.all(
    ids.map((id) =>
      createAuditLog({
        entityId: id,
        entityType: EntityType.UNIT,
        action: "DELETE",
      })
    )
  );
  
  await Promise.all(
    units.map((unit) =>
      createNotification({
        userId: session.user.id,
        title: "Unit Deleted",
        message: `Unit ${unit.unitNumber} has been deleted from ${unit.property.propertyName}.`,
        type: NotificationType.UNIT,
        entityId: unit.id,
        entityType: EntityType.UNIT,
      })
    )
  );
  
  revalidatePath("/units");
  } catch (error) {
  throw new AppError(
  "Failed to delete units",
  500,
  "UNIT_BULK_DELETE_ERROR"
  );
  }
  }