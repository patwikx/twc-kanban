'use server';

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { createAuditLog } from "@/lib/audit";

import { EntityType, NotificationType, DocumentType } from "@prisma/client";
import { AppError } from "@/lib/utils/error";
import { uploadFile } from "@/lib/utils/api";
import { auth } from "@/auth";
import { createNotification } from "@/lib/utils/notifications";

export async function createDocument(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new AppError("Unauthorized", 401);
  }

  const file = formData.get('file') as File;
  if (!file) {
    throw new AppError("No file provided", 400);
  }

  const data = Object.fromEntries(formData);
  
  try {
    // Upload file to storage
    const fileUrl = await uploadFile(file);

    // Create document record with proper data structure
    const documentData = {
      name: data.name as string,
      description: data.description as string,
      documentType: data.documentType as DocumentType,
      fileUrl,
      uploadedById: session.user.id,
      propertyId: data.propertyId as string || null,
      unitId: data.unitId as string || null,
      tenantId: data.tenantId as string || null,
    };

    const document = await prisma.document.create({
      data: documentData,
      include: {
        property: true,
        unit: {
          include: {
            property: true
          }
        },
        tenant: true,
        uploadedBy: true,
      },
    });

    await createAuditLog({
      entityId: document.id,
      entityType: EntityType.DOCUMENT,
      action: "CREATE",
      changes: {
        name: document.name,
        type: document.documentType,
        fileUrl: document.fileUrl,
      },
    });

    // Create appropriate notification based on document context
    let notificationMessage = `Document "${document.name}" has been uploaded`;
    if (document.property) {
      notificationMessage += ` for property ${document.property.propertyName}`;
    } else if (document.unit) {
      notificationMessage += ` for space ${document.unit.unitNumber} in ${document.unit.property.propertyName}`;
    } else if (document.tenant) {
      notificationMessage += ` for tenant ${document.tenant.firstName} ${document.tenant.lastName}`;
    }

    await createNotification({
      userId: session.user.id,
      title: "Document Uploaded",
      message: notificationMessage,
      type: NotificationType.DOCUMENT,
      entityId: document.id,
      entityType: EntityType.DOCUMENT,
    });

    // Revalidate appropriate paths based on document context
    if (document.propertyId) {
      revalidatePath(`/dashboard/properties?selected=${document.propertyId}`);
    }
    if (document.unitId) {
      revalidatePath(`/dashboard/spaces?selected=${document.unitId}`);
    }
    if (document.tenantId) {
      revalidatePath(`/dashboard/tenants?selected=${document.tenantId}`);
    }

    return document;
  } catch (error) {
    throw new AppError(
      "Failed to upload document",
      500,
      "DOCUMENT_UPLOAD_ERROR"
    );
  }
}