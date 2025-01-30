import Link from 'next/link'
import { BedDouble, Bath, Square, DollarSign } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Unit } from '@prisma/client'

interface UnitCardProps {
  unit: Unit
}

export function UnitCard({ unit }: UnitCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="line-clamp-1">Unit {unit.unitNumber}</CardTitle>
          <Badge
            variant={
              unit.status === 'VACANT'
                ? 'destructive'
                : unit.status === 'OCCUPIED'
                ? 'default'
                : 'secondary'
            }
          >
            {unit.status}
          </Badge>
        </div>
        <CardDescription>
          {unit.floorPlanType || 'No floor plan specified'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          {unit.bedrooms && (
            <div className="flex items-center gap-2">
              <BedDouble className="h-4 w-4 text-muted-foreground" />
              <span>{unit.bedrooms} Beds</span>
            </div>
          )}
          {unit.bathrooms && (
            <div className="flex items-center gap-2">
              <Bath className="h-4 w-4 text-muted-foreground" />
              <span>{unit.bathrooms.toString()} Baths</span>
            </div>
          )}
          {unit.squareFeet && (
            <div className="flex items-center gap-2">
              <Square className="h-4 w-4 text-muted-foreground" />
              <span>{unit.squareFeet.toString()} sq ft</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span>${unit.rentAmount.toLocaleString()}/mo</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="grid grid-cols-2 gap-4">
        <Button variant="default" asChild className="w-full">
          <Link href={`/units/${unit.id}`}>
            View Details
          </Link>
        </Button>
        <Button variant="outline" asChild className="w-full">
          <Link href={`/units/${unit.id}/edit`}>
            Edit Unit
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}