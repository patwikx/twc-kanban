'use server';

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";

import { createAuditLog } from "@/lib/audit";

import { EntityType, NotificationType, LeaseStatus, UnitStatus } from "@prisma/client";
import { AppError } from "@/lib/utils/error";
import { auth } from "@/auth";
import { createNotification } from "@/lib/utils/notifications";

export async function createLease(formData: FormData) {
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

    // Start a transaction since we need to update multiple records
    const lease = await prisma.$transaction(async (tx) => {
      // Create the lease
      const lease = await tx.lease.create({
        data: {
          tenant: {
            connect: {
              id: data.tenantId as string
            }
          },
          unit: {
            connect: {
              id: data.unitId as string
            }
          },
          startDate: new Date(data.startDate as string),
          endDate: new Date(data.endDate as string),
          rentAmount: parseFloat(data.rentAmount as string),
          securityDeposit: parseFloat(data.securityDeposit as string),
          status: data.status as LeaseStatus || LeaseStatus.PENDING,
        },
        include: {
          tenant: true,
          unit: {
            include: {
              property: true
            }
          }
        }
      });

    // Update unit status to OCCUPIED if lease is active
  if (lease.status === LeaseStatus.ACTIVE) {
    await tx.unit.update({
      where: { id: data.unitId as string },
      data: { status: UnitStatus.OCCUPIED }
    });
  }

      return lease;
    });

    await createAuditLog({
      entityId: lease.id,
      entityType: EntityType.LEASE,
      action: "CREATE",
      changes: data,
    });

    // Notify all users about the new lease
    await Promise.all(
      users.map(user =>
        createNotification({
          userId: user.id,
          title: "New Lease Created",
          message: `Lease for ${lease.tenant.firstName} ${lease.tenant.lastName} at ${lease.unit.property.propertyName} - ${lease.unit.unitNumber} has been created.`,
          type: NotificationType.LEASE,
          entityId: lease.id,
          entityType: EntityType.LEASE,
          actionUrl: `/dashboard/tenants?selected=${lease.tenantId}`,
        })
      )
    );

    // Revalidate all necessary paths
    revalidatePath("/dashboard/tenants");
    revalidatePath("/dashboard/spaces");
    revalidatePath(`/dashboard/tenants/${data.tenantId}`);
    
    return lease;
  } catch (error) {
    throw new AppError(
      "Failed to create lease. Please try again.",
      500,
      "LEASE_CREATE_ERROR"
    );
  }
}

export async function updateLease(id: string, formData: FormData) {
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

    const lease = await prisma.$transaction(async (tx) => {
      const lease = await tx.lease.update({
        where: { id },
        data: {
          startDate: new Date(data.startDate as string),
          endDate: new Date(data.endDate as string),
          rentAmount: parseFloat(data.rentAmount as string),
          securityDeposit: parseFloat(data.securityDeposit as string),
          status: data.status as LeaseStatus,
        },
        include: {
          tenant: true,
          unit: {
            include: {
              property: true
            }
          }
        }
      });

      // Update unit status based on lease status
      await tx.unit.update({
        where: { id: lease.unitId },
        data: {
          status: lease.status === LeaseStatus.ACTIVE ? UnitStatus.OCCUPIED : UnitStatus.VACANT
        }
      });

      return lease;
    });

    await createAuditLog({
      entityId: lease.id,
      entityType: EntityType.LEASE,
      action: "UPDATE",
      changes: data,
    });

    // Notify all users about the lease update
    await Promise.all(
      users.map(user =>
        createNotification({
          userId: user.id,
          title: "Lease Updated",
          message: `Lease for ${lease.tenant.firstName} ${lease.tenant.lastName} at ${lease.unit.property.propertyName} - ${lease.unit.unitNumber} has been updated.`,
          type: NotificationType.LEASE,
          entityId: lease.id,
          entityType: EntityType.LEASE,
          actionUrl: `/dashboard/tenants?selected=${lease.tenantId}`,
        })
      )
    );

    revalidatePath("/dashboard/tenants");
    return lease;
  } catch (error) {
    throw new AppError(
      "Failed to update lease. Please try again.",
      500,
      "LEASE_UPDATE_ERROR"
    );
  }
}

export async function terminateLease(id: string, formData: FormData) {
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

    const lease = await prisma.$transaction(async (tx) => {
      const lease = await tx.lease.update({
        where: { id },
        data: {
          status: LeaseStatus.TERMINATED,
          terminationDate: new Date(data.terminationDate as string),
          terminationReason: data.reason as string,
        },
        include: {
          tenant: true,
          unit: {
            include: {
              property: true
            }
          }
        }
      });

      // Update unit status to VACANT
      await tx.unit.update({
        where: { id: lease.unitId },
        data: { status: UnitStatus.VACANT }
      });

      return lease;
    });

    await createAuditLog({
      entityId: lease.id,
      entityType: EntityType.LEASE,
      action: "UPDATE",
      changes: { status: LeaseStatus.TERMINATED, ...data },
    });

    // Notify all users about the lease termination
    await Promise.all(
      users.map(user =>
        createNotification({
          userId: user.id,
          title: "Lease Terminated",
          message: `Lease for ${lease.tenant.firstName} ${lease.tenant.lastName} at ${lease.unit.property.propertyName} - ${lease.unit.unitNumber} has been terminated.`,
          type: NotificationType.LEASE,
          priority: "HIGH",
          entityId: lease.id,
          entityType: EntityType.LEASE,
          actionUrl: `/dashboard/tenants?selected=${lease.tenantId}`,
        })
      )
    );

    revalidatePath("/dashboard/tenants");
    return lease;
  } catch (error) {
    throw new AppError(
      "Failed to terminate lease. Please try again.",
      500,
      "LEASE_TERMINATE_ERROR"
    );
  }
}

export async function deleteLease(id: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new AppError("Unauthorized", 401);
  }

  try {
    // Get all users for global notification
    const users = await prisma.user.findMany({
      select: { id: true }
    });

    const lease = await prisma.$transaction(async (tx) => {
      const lease = await tx.lease.delete({
        where: { id },
        include: {
          tenant: true,
          unit: {
            include: {
              property: true
            }
          }
        }
      });

      // Update unit status to VACANT
      await tx.unit.update({
        where: { id: lease.unitId },
        data: { status: UnitStatus.VACANT }
      });

      return lease;
    });

    await createAuditLog({
      entityId: lease.id,
      entityType: EntityType.LEASE,
      action: "DELETE",
    });

    // Notify all users about the lease deletion
    await Promise.all(
      users.map(user =>
        createNotification({
          userId: user.id,
          title: "Lease Deleted",
          message: `Lease for ${lease.tenant.firstName} ${lease.tenant.lastName} at ${lease.unit.property.propertyName} - ${lease.unit.unitNumber} has been deleted.`,
          type: NotificationType.LEASE,
          priority: "HIGH",
          entityId: lease.id,
          entityType: EntityType.LEASE,
          actionUrl: `/dashboard/tenants?selected=${lease.tenantId}`,
        })
      )
    );

    revalidatePath("/dashboard/tenants");
    return lease;
  } catch (error) {
    throw new AppError(
      "Failed to delete lease. Please try again.",
      500,
      "LEASE_DELETE_ERROR"
    );
  }
}