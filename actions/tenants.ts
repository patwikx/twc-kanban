'use server';

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";

import { createAuditLog } from "@/lib/audit";

import { TenantStatus, NotificationType, EntityType } from "@prisma/client";
import { AppError } from "@/lib/utils/error";
import { auth } from "@/auth";
import { createNotification } from "@/lib/utils/notifications";

export async function getTenants() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new AppError("Unauthorized", 401);
  }

  try {
    return await prisma.tenant.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        leases: {
          include: {
            unit: {
              include: {
                property: true,
              },
            },
            tenant: true,
            payments: true,
          },
        },
        maintenanceRequests: {
          include: {
            unit: {
              include: {
                property: true,
              },
            },
          },
        },
        documents: true,
      },
    });
  } catch (error) {
    throw new AppError(
      "Failed to fetch tenants",
      500,
      "TENANT_FETCH_ERROR"
    );
  }
}

  export async function getTenantById(id: string) {
    const session = await auth();
    if (!session?.user?.id) {
      throw new AppError("Unauthorized", 401);
    }
  
    try {
      return await prisma.tenant.findUnique({
        where: { id },
        include: {
          leases: {
            include: {
              unit: {
                include: {
                  property: true,
                },
              },
              tenant: true,
              payments: true,
            },
          },
          maintenanceRequests: {
            include: {
              unit: {
                include: {
                  property: true,
                },
              },
            },
          },
          documents: true,
        },
      });
    } catch (error) {
      throw new AppError(
        "Failed to fetch tenant",
        500,
        "TENANT_FETCH_ERROR"
      );
    }
  }

export async function createTenant(formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) {
      throw new AppError("Unauthorized", 401);
    }
  
    const data = Object.fromEntries(formData);
    
    try {
      const tenant = await prisma.tenant.create({
        data: {
          bpCode: data.bpCode as string,
          firstName: data.firstName as string,
          lastName: data.lastName as string,
          email: data.email as string,
          phone: data.phone as string,
          company: data.company as string,
          status: data.status as TenantStatus,
          emergencyContactName: data.emergencyContactName as string || null,
          emergencyContactPhone: data.emergencyContactPhone as string || null,
          createdById: session.user.id, // Add this line
        },
      });
  
      await createAuditLog({
        entityId: tenant.id,
        entityType: EntityType.TENANT,
        action: "CREATE",
        changes: data,
      });
  
      await createNotification({
        userId: session.user.id,
        title: "New Tenant Created",
        message: `Tenant ${tenant.firstName} ${tenant.lastName} has been created successfully.`,
        type: NotificationType.TENANT,
        entityId: tenant.id,
        entityType: EntityType.TENANT,
      });
  
      revalidatePath("/dashboard/tenants"); // Fix the path
      return tenant;
    } catch (error) {
      console.error("Tenant creation error:", error); // Add error logging
      throw new AppError(
        "Failed to create tenant. Please try again.",
        500,
        "TENANT_CREATE_ERROR"
      );
    }
  }

export async function updateTenant(id: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new AppError("Unauthorized", 401);
  }

  const data = Object.fromEntries(formData);
  
  try {
    const tenant = await prisma.tenant.update({
      where: { id },
      data: {
        bpCode: data.bpCode as string,
        firstName: data.firstName as string,
        lastName: data.lastName as string,
        email: data.email as string,
        phone: data.phone as string,
        company: data.company as string,
        status: data.status as TenantStatus,
        emergencyContactName: data.emergencyContactName as string,
        emergencyContactPhone: data.emergencyContactPhone as string,
      },
    });

    await createAuditLog({
      entityId: tenant.id,
      entityType: EntityType.TENANT,
      action: "UPDATE",
      changes: data,
    });

    await createNotification({
      userId: session.user.id,
      title: "Tenant Updated",
      message: `Tenant ${tenant.firstName} ${tenant.lastName} has been updated successfully.`,
      type: NotificationType.TENANT,
      entityId: tenant.id,
      entityType: EntityType.TENANT,
    });

    revalidatePath("/dashboard/tenants");
    return tenant;
  } catch (error) {
    throw new AppError(
      "Failed to update tenant",
      500,
      "TENANT_UPDATE_ERROR"
    );
  }
}

export async function deleteTenant(id: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new AppError("Unauthorized", 401);
  }

  try {
    const tenant = await prisma.tenant.delete({
      where: { id },
    });

    await createAuditLog({
      entityId: tenant.id,
      entityType: EntityType.TENANT,
      action: "DELETE",
    });

    await createNotification({
      userId: session.user.id,
      title: "Tenant Deleted",
      message: `Tenant ${tenant.firstName} ${tenant.lastName} has been deleted successfully.`,
      type: NotificationType.TENANT,
      entityId: tenant.id,
      entityType: EntityType.TENANT,
    });

    revalidatePath("/dashboard/tenants");
    return tenant;
  } catch (error) {
    throw new AppError(
      "Failed to delete tenant",
      500,
      "TENANT_DELETE_ERROR"
    );
  }
}

export async function bulkDeleteTenants(ids: string[]) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new AppError("Unauthorized", 401);
  }

  try {
    const tenants = await prisma.tenant.findMany({
      where: {
        id: {
          in: ids,
        },
      },
    });

    await prisma.tenant.deleteMany({
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
          entityType: EntityType.TENANT,
          action: "DELETE",
        })
      )
    );

    await Promise.all(
      tenants.map((tenant) =>
        createNotification({
          userId: session.user.id,
          title: "Tenant Deleted",
          message: `Tenant ${tenant.firstName} ${tenant.lastName} has been deleted successfully.`,
          type: NotificationType.TENANT,
          entityId: tenant.id,
          entityType: EntityType.TENANT,
        })
      )
    );

    revalidatePath("/dashboard/tenants");
  } catch (error) {
    throw new AppError(
      "Failed to delete tenants",
      500,
      "TENANT_BULK_DELETE_ERROR"
    );
  }
}

function normalizeTenantStatus(status: string): TenantStatus {
  const normalized = status.toUpperCase().trim();
  
  if (Object.values(TenantStatus).includes(normalized as TenantStatus)) {
    return normalized as TenantStatus;
  }
  
  throw new Error(`Invalid tenant status: ${status}. Must be one of: ${Object.values(TenantStatus).join(', ')}`);
}

export async function importTenantsFromCSV(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new AppError("Unauthorized", 401);
  }

  const file = formData.get('file') as File;
  const text = await file.text();
  const [headers, ...rows] = text.split('\n').map(row => row.trim()).filter(Boolean);
  const headerArray = headers.split(',').map(h => h.trim());

  try {
    const tenants = rows.map(row => {
      const values = row.split(',').map(v => v.trim());
      const tenant = headerArray.reduce((obj, header, index) => {
        obj[header] = values[index];
        return obj;
      }, {} as any);

      return {
        bpCode: tenant.bpCode,
        firstName: tenant.firstName,
        lastName: tenant.lastName,
        email: tenant.email,
        phone: tenant.phone,
        company: tenant.company,
        status: normalizeTenantStatus(tenant.status),
        emergencyContactName: tenant.emergencyContactName,
        emergencyContactPhone: tenant.emergencyContactPhone,
        createdById: session.user.id,
      };
    });

    const createdTenants = await prisma.$transaction(
      tenants.map(tenant => 
        prisma.tenant.create({
          data: tenant
        })
      )
    );

    await Promise.all(
      createdTenants.map(tenant => 
        Promise.all([
          createAuditLog({
            entityId: tenant.id,
            entityType: EntityType.TENANT,
            action: "CREATE",
            changes: tenant,
            metadata: { source: "CSV_IMPORT" }
          }),
          createNotification({
            userId: session.user.id,
            title: "Tenant Imported",
            message: `Tenant ${tenant.firstName} ${tenant.lastName} has been imported successfully.`,
            type: NotificationType.TENANT,
            entityId: tenant.id,
            entityType: EntityType.TENANT,
          })
        ])
      )
    );

    revalidatePath("/dashboard/tenants");
    return createdTenants;
  } catch (error) {
    throw new AppError(
      "Failed to import tenants",
      500,
      "TENANT_IMPORT_ERROR"
    );
  }
}