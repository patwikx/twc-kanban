import * as z from "zod";
import { UtilityType } from "@prisma/client";

export const utilityAccountSchema = z.object({
  utilityType: z.nativeEnum(UtilityType),
  accountNumber: z.string().min(1, "Account number is required"),
  meterNumber: z.string().optional(),
});

