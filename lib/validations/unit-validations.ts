import { z } from 'zod'
import { UnitStatus } from '@prisma/client'

export const CreateUnitSchema = z.object({
  propertyId: z.string().min(1, 'Property is required'),
  unitNumber: z.string().min(1, 'Unit number is required'),
  floorPlanType: z.string().optional(),
  squareFeet: z.number().positive().optional(),
  bedrooms: z.number().int().min(0).optional(),
  bathrooms: z.number().min(0).optional(),
  rentAmount: z.number().min(0),
  status: z.nativeEnum(UnitStatus).default('VACANT')
})

export const UpdateUnitSchema = CreateUnitSchema.partial()

export type CreateUnitInput = z.infer<typeof CreateUnitSchema>
export type UpdateUnitInput = z.infer<typeof UpdateUnitSchema>