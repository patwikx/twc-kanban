import { prisma } from "@/lib/db";
import { cache } from "react";

export const getProperties = cache(async () => {
  return prisma.property.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      units: true,
      documents: true,
      utilities: true,
      propertyTaxes: true,
      titleMovements: true,
    },
  });
});

export const getPropertyById = cache(async (id: string) => {
  return prisma.property.findUnique({
    where: { id },
    include: {
      units: true,
      documents: true,
      utilities: true,
      propertyTaxes: true,
    },
  });
});