import { Unit } from '@prisma/client'
import { UnitCard } from './units-card'


interface UnitListProps {
  propertyId: string
  units: Unit[]
}

export function UnitList({ propertyId, units }: UnitListProps) {
  if (units.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <h3 className="mt-2 text-lg font-semibold">No units found</h3>
        <p className="mt-1 text-sm text-gray-500">Get started by adding a new unit.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {units.map((unit) => (
        <UnitCard key={unit.id} unit={unit} />
      ))}
    </div>
  )
}