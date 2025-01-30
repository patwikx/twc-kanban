'use server'

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { unitSchema } from "@/lib/validations/unit-page-validation";
import { UnitStatus } from "@prisma/client";

export async function createUnit(data: any) {
  const validated = unitSchema.parse(data);

  const unit = await prisma.unit.create({
    data: {
      propertyId: validated.propertyId,
      unitNumber: validated.unitNumber,
      unitArea: validated.unitArea,
      unitRate: validated.unitRate,
      rentAmount: validated.rentAmount,
      status: validated.status,
    },
  });

  revalidatePath("/units");
  return unit;
}

export async function updateUnit(id: string, data: any) {
  const validated = unitSchema.parse(data);

  const unit = await prisma.unit.update({
    where: { id },
    data: {
      propertyId: validated.propertyId,
      unitNumber: validated.unitNumber,
      unitArea: validated.unitArea,
      unitRate: validated.unitRate,
      rentAmount: validated.rentAmount,
      status: validated.status,
    },
  });

  revalidatePath("/units");
  revalidatePath(`/units/${id}`);
  return unit;
}

export async function deleteUnit(id: string) {
  const unit = await prisma.unit.delete({
    where: { id },
  });

  revalidatePath("/units");
  return unit;
}

export async function getProperties() {
  return await prisma.property.findMany({
    select: {
      id: true,
      propertyName: true,
    },
    orderBy: {
      propertyName: 'asc',
    },
  });
}

export async function getUnits() {
  return await prisma.unit.findMany({
    include: {
      property: {
        select: {
          propertyName: true,
        },
      },
    },
    orderBy: {
      unitNumber: 'asc',
    },
  });
}

export async function getUnitStats() {
  const total = await prisma.unit.count();
  const occupied = await prisma.unit.count({
    where: { status: UnitStatus.OCCUPIED },
  });
  const vacant = await prisma.unit.count({
    where: { status: UnitStatus.VACANT },
  });
  const maintenance = await prisma.unit.count({
    where: { status: UnitStatus.MAINTENANCE },
  });

  return {
    total,
    occupied,
    vacant,
    maintenance,
  };
}

export async function getUnitDetails(id: string) {
  return await prisma.unit.findUnique({
    where: { id },
    include: {
      property: true,
      maintenanceRequests: {
        orderBy: {
          createdAt: 'desc',
        },
      },
      leases: {
        include: {
          tenant: true,
        },
        orderBy: {
          startDate: 'desc',
        },
      },
      unitTaxes: {
        orderBy: {
          taxYear: 'desc',
        },
      },
      utilityAccounts: {
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  });
}


export async function getUnitDocuments(unitId: string) {
  return await prisma.document.findMany({
    where: {
      unitId,
    },
    include: {
      uploadedBy: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}