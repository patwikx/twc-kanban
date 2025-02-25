'use client'

import { Unit, Property, MaintenanceRequest, Lease, Tenant, UnitTax, UnitUtilityAccount, User } from "@prisma/client";
import { UnitDetailsClientView } from "./unit-details-client-view";

interface UnitWithRelations extends Unit {
  property: Property;
  maintenanceRequests: MaintenanceRequest[];
  leases: (Lease & {
    tenant: Tenant;
  })[];
  unitTaxes: UnitTax[];
  utilityAccounts: UnitUtilityAccount[];
}

interface UnitDetailsViewProps {
  unit: UnitWithRelations;
  users: User[];
  currentUserId: string | undefined;
}

export function UnitDetailsView({ unit, users, currentUserId }: UnitDetailsViewProps) {
  return (
    <UnitDetailsClientView 
      unit={unit}
      users={users}
      currentUserId={currentUserId}
    />
  );
}