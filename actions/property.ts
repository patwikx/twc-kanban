'use server';

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db"
import { PropertyType, NotificationType, EntityType } from "@prisma/client";
import { auth } from "@/auth";
import { createAuditLog } from "@/lib/audit";
import { createNotification } from "@/lib/utils/notifications";


export async function createProperty(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const data = Object.fromEntries(formData);
  
  const property = await prisma.property.create({
    data: {
      propertyName: data.propertyName as string,
      propertyCode: data.propertyCode as string,
      titleNo: data.titleNo as string,
      lotNo: data.lotNo as string,
      registeredOwner: data.registeredOwner as string,
      leasableArea: parseFloat(data.leasableArea as string),
      address: data.address as string,
      propertyType: data.propertyType as PropertyType,
      totalUnits: parseInt(data.totalUnits as string),
      createdById: session.user.id,
    },
  });

  await createAuditLog({
    entityId: property.id,
    entityType: EntityType.PROPERTY,
    action: "CREATE",
    changes: data,
  });

  await createNotification({
    userId: session.user.id,
    title: "New Property Created",
    message: `Property "${property.propertyName}" has been created successfully.`,
    type: NotificationType.SYSTEM,
    entityId: property.id,
    entityType: EntityType.PROPERTY,
  });

  revalidatePath("/dashboard/properties");
  return property;
}

export async function updateProperty(id: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const data = Object.fromEntries(formData);
  
  const property = await prisma.property.update({
    where: { id },
    data: {
      propertyName: data.propertyName as string,
      propertyCode: data.propertyCode as string,
      titleNo: data.titleNo as string,
      lotNo: data.lotNo as string,
      registeredOwner: data.registeredOwner as string,
      leasableArea: parseFloat(data.leasableArea as string),
      address: data.address as string,
      propertyType: data.propertyType as PropertyType,
      totalUnits: parseInt(data.totalUnits as string),
    },
  });

  await createAuditLog({
    entityId: property.id,
    entityType: EntityType.PROPERTY,
    action: "UPDATE",
    changes: data,
  });

  await createNotification({
    userId: session.user.id,
    title: "Property Updated",
    message: `Property "${property.propertyName}" has been updated successfully.`,
    type: NotificationType.SYSTEM,
    entityId: property.id,
    entityType: EntityType.PROPERTY,
  });

  revalidatePath("/dashboard/properties");
  return property;
}

export async function deleteProperty(id: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const property = await prisma.property.delete({
    where: { id },
  });

  await createAuditLog({
    entityId: property.id,
    entityType: EntityType.PROPERTY,
    action: "DELETE",
  });

  await createNotification({
    userId: session.user.id,
    title: "Property Deleted",
    message: `Property "${property.propertyName}" has been deleted successfully.`,
    type: NotificationType.SYSTEM,
    entityId: property.id,
    entityType: EntityType.PROPERTY,
  });

  revalidatePath("/dashboard/properties");
  return property;
}

export async function bulkDeleteProperties(ids: string[]) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const properties = await prisma.property.findMany({
    where: {
      id: {
        in: ids,
      },
    },
  });

  await prisma.property.deleteMany({
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
        entityType: EntityType.PROPERTY,
        action: "DELETE",
      })
    )
  );

  await Promise.all(
    properties.map((property) =>
      createNotification({
        userId: session.user.id,
        title: "Property Deleted",
        message: `Property "${property.propertyName}" has been deleted successfully.`,
        type: NotificationType.SYSTEM,
        entityId: property.id,
        entityType: EntityType.PROPERTY,
      })
    )
  );

  revalidatePath("/dashboard/properties");
}

export async function exportProperties() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const properties = await prisma.property.findMany({
    include: {
      units: true,
      documents: true,
      utilities: true,
    },
  });

  return properties;
}

function normalizePropertyType(type: string): PropertyType {
  // Convert to uppercase and remove spaces
  const normalized = type.toUpperCase().trim();
  
  // Validate that it's a valid PropertyType
  if (Object.values(PropertyType).includes(normalized as PropertyType)) {
    return normalized as PropertyType;
  }
  
  throw new Error(`Invalid property type: ${type}. Must be one of: ${Object.values(PropertyType).join(', ')}`);
}

export async function importPropertiesFromCSV(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const file = formData.get('file') as File;
  const text = await file.text();
  const [headers, ...rows] = text.split('\n').map(row => row.trim()).filter(Boolean);
  const headerArray = headers.split(',').map(h => h.trim());

  const properties = rows.map(row => {
    const values = row.split(',').map(v => v.trim());
    const property = headerArray.reduce((obj, header, index) => {
      obj[header] = values[index];
      return obj;
    }, {} as any);

    try {
      return {
        propertyName: property.propertyName,
        propertyCode: property.propertyCode,
        titleNo: property.titleNo,
        lotNo: property.lotNo,
        registeredOwner: property.registeredOwner,
        leasableArea: parseFloat(property.leasableArea),
        address: property.address,
        propertyType: normalizePropertyType(property.propertyType),
        totalUnits: parseInt(property.totalUnits),
        createdById: session.user.id,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Row error (${property.propertyName}): ${error.message}`);
      } else {
        throw new Error(`Row error (${property.propertyName}): Unknown error`);
      }
    }
  });

  const createdProperties = await prisma.$transaction(
    properties.map(property => 
      prisma.property.create({
        data: property
      })
    )
  );

  await Promise.all(
    createdProperties.map(property => 
      Promise.all([
        createAuditLog({
          entityId: property.id,
          entityType: EntityType.PROPERTY,
          action: "CREATE",
          changes: property,
          metadata: { source: "CSV_IMPORT" }
        }),
        createNotification({
          userId: session.user.id,
          title: "Property Imported",
          message: `Property "${property.propertyName}" has been imported successfully.`,
          type: NotificationType.SYSTEM,
          entityId: property.id,
          entityType: EntityType.PROPERTY,
        })
      ])
    )
  );

  revalidatePath("/dashboard/properties");
  return createdProperties;
}