'use server';

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { createAuditLog } from "@/lib/audit";
import { EntityType, NotificationType } from "@prisma/client";
import { AppError } from "@/lib/utils/error";
import { auth } from "@/auth";
import { createNotification } from "@/lib/utils/notifications";

export async function createPropertyTax(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new AppError("Unauthorized", 401);
  }

  const data = Object.fromEntries(formData);
  
  try {
    // Get all users for global notification
    const users = await prisma.user.findMany({
      select: { id: true }
    });

    const propertyTax = await prisma.propertyTax.create({
      data: {
        property: {
          connect: {
            id: data.propertyId as string
          }
        },
        taxYear: parseInt(data.taxYear as string),
        TaxDecNo: data.taxDecNo as string,
        taxAmount: parseFloat(data.taxAmount as string),
        dueDate: new Date(data.dueDate as string),
        isAnnual: data.isAnnual === "true",
        isQuarterly: data.isQuarterly === "true",
        whatQuarter: data.whatQuarter as string,
        processedBy: data.processedBy as string,
        remarks: data.remarks as string,
      },
      include: {
        property: true,
      },
    });

    await createAuditLog({
      entityId: propertyTax.id,
      entityType: EntityType.PROPERTY_TAX,
      action: "CREATE",
      changes: data,
    });

    // Notify all users about the new property tax record
    await Promise.all(
      users.map(user =>
        createNotification({
          userId: user.id,
          title: "Property Tax Record Added",
          message: `Property tax record for ${propertyTax.property.propertyName} (${propertyTax.taxYear}) has been added.`,
          type: NotificationType.TAX,
          entityId: propertyTax.id,
          entityType: EntityType.PROPERTY_TAX,
          actionUrl: `/dashboard/properties?selected=${data.propertyId}`,
        })
      )
    );

    revalidatePath(`/dashboard/properties?selected=${data.propertyId}`);
    return propertyTax;
  } catch (error) {
    throw new AppError(
      "Failed to create property tax record. Please try again.",
      500
    );
  }
}

export async function updatePropertyTax(id: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new AppError("Unauthorized", 401);
  }

  const data = Object.fromEntries(formData);
  
  try {
    // Get all users for global notification
    const users = await prisma.user.findMany({
      select: { id: true }
    });

    const propertyTax = await prisma.propertyTax.update({
      where: { id },
      data: {
        taxYear: parseInt(data.taxYear as string),
        TaxDecNo: data.taxDecNo as string,
        taxAmount: parseFloat(data.taxAmount as string),
        dueDate: new Date(data.dueDate as string),
        isPaid: data.isPaid === "true",
        paidDate: data.isPaid === "true" ? new Date() : null,
        isAnnual: data.isAnnual === "true",
        isQuarterly: data.isQuarterly === "true",
        whatQuarter: data.whatQuarter as string,
        processedBy: data.processedBy as string,
        remarks: data.remarks as string,
      },
      include: {
        property: true,
      },
    });

    await createAuditLog({
      entityId: propertyTax.id,
      entityType: EntityType.PROPERTY_TAX,
      action: "UPDATE",
      changes: data,
    });

    // Notify all users about the property tax update
    await Promise.all(
      users.map(user =>
        createNotification({
          userId: user.id,
          title: "Property Tax Record Updated",
          message: `Property tax record for ${propertyTax.property.propertyName} (${propertyTax.taxYear}) has been updated.`,
          type: NotificationType.TAX,
          entityId: propertyTax.id,
          entityType: EntityType.PROPERTY_TAX,
          actionUrl: `/dashboard/properties?selected=${propertyTax.propertyId}`,
        })
      )
    );

    revalidatePath(`/dashboard/properties?selected=${propertyTax.propertyId}`);
    return propertyTax;
  } catch (error) {
    throw new AppError(
      "Failed to update property tax record. Please try again.",
      500
    );
  }
}

export async function deletePropertyTax(id: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new AppError("Unauthorized", 401);
  }

  try {
    // Get all users for global notification
    const users = await prisma.user.findMany({
      select: { id: true }
    });

    const propertyTax = await prisma.propertyTax.delete({
      where: { id },
      include: {
        property: true,
      },
    });

    await createAuditLog({
      entityId: propertyTax.id,
      entityType: EntityType.PROPERTY_TAX,
      action: "DELETE",
    });

    // Notify all users about the property tax deletion
    await Promise.all(
      users.map(user =>
        createNotification({
          userId: user.id,
          title: "Property Tax Record Deleted",
          message: `Property tax record for ${propertyTax.property.propertyName} (${propertyTax.taxYear}) has been deleted.`,
          type: NotificationType.TAX,
          priority: "HIGH",
          entityId: propertyTax.id,
          entityType: EntityType.PROPERTY_TAX,
          actionUrl: `/dashboard/properties?selected=${propertyTax.propertyId}`,
        })
      )
    );

    revalidatePath(`/dashboard/properties?selected=${propertyTax.propertyId}`);
    return propertyTax;
  } catch (error) {
    throw new AppError(
      "Failed to delete property tax record. Please try again.",
      500
    );
  }
}

export async function updatePropertyTaxStatus(id: string, isPaid: boolean) {
  const tax = await prisma.propertyTax.update({
    where: { id },
    data: {
      isPaid,
      paidDate: isPaid ? new Date() : null,
    },
  });

  revalidatePath(`/dashboard/property/${tax.propertyId}`);
  return tax;
}

export async function updateUtilityStatus(id: string, isActive: boolean) {
  const utility = await prisma.propertyUtility.update({
    where: { id },
    data: {
      isActive,
    },
  });

  revalidatePath(`/dashboard/property/${utility.propertyId}`);
  return utility;
}

export async function deletePropertyUtility(id: string) {
  const utility = await prisma.propertyUtility.delete({
    where: { id },
  });

  revalidatePath(`/dashboard/property/${utility.propertyId}`);
  return utility;
}