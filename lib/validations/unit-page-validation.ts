import * as z from "zod";
import { UnitStatus } from "@prisma/client";

export const unitSchema = z.object({
  propertyId: z.string().min(1, "Property is required"),
  unitNumber: z.string().min(1, "Unit number is required"),
  unitArea: z.string().or(z.number()).pipe(
    z.coerce.number().positive("Area must be greater than 0")
  ),
  unitRate: z.string().or(z.number()).pipe(
    z.coerce.number().positive("Rate must be greater than 0")
  ),
  rentAmount: z.string().or(z.number()).pipe(
    z.coerce.number().positive("Rent amount must be greater than 0")
  ),
  status: z.nativeEnum(UnitStatus),
});