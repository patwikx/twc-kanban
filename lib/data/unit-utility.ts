'use server'

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { utilityAccountSchema } from "@/lib/validations/unit-utility";

export async function createUtilityAccount(data: any) {
  const validated = utilityAccountSchema.parse(data);

  const utility = await prisma.unitUtilityAccount.create({
    data: {
      unitId: data.unitId,
      utilityType: validated.utilityType,
      accountNumber: validated.accountNumber,
      meterNumber: validated.meterNumber || null,
      isActive: true,
    },
  });

  revalidatePath(`/units/${data.unitId}`);
  return utility;
}

export async function updateUtilityStatus(id: string, isActive: boolean) {
  const utility = await prisma.unitUtilityAccount.update({
    where: { id },
    data: {
      isActive,
    },
  });

  revalidatePath(`/units/${utility.unitId}`);
  return utility;
}

export async function deleteUtilityAccount(id: string) {
  const utility = await prisma.unitUtilityAccount.delete({
    where: { id },
  });

  revalidatePath(`/units/${utility.unitId}`);
  return utility;
}