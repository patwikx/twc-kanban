'use server'

import { prisma } from "@/lib/db";
import { unitTaxSchema } from "@/schemas";
import { revalidatePath } from "next/cache";


export async function createUnitTax(data: any) {
  const validated = unitTaxSchema.parse(data);

  const tax = await prisma.unitTax.create({
    data: {
      unitId: data.unitId,
      taxYear: validated.taxYear,
      taxDecNo: validated.taxDecNo,
      taxAmount: validated.taxAmount,
      dueDate: new Date(validated.dueDate),
      isPaid: false,
    },
  });

  revalidatePath(`/units/${data.unitId}`);
  return tax;
}

export async function updateUnitTaxStatus(id: string, isPaid: boolean) {
  const tax = await prisma.unitTax.update({
    where: { id },
    data: {
      isPaid,
      paidDate: isPaid ? new Date() : null,
    },
  });

  revalidatePath(`/units/${tax.unitId}`);
  return tax;
}