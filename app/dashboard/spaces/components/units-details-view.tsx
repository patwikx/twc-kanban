import { getUsers } from "@/actions/get-users-property-tax";
import { auth } from "@/auth";
import { UnitDetailsClientView } from "./unit-details-client-view";
import { Unit, Property, MaintenanceRequest, Lease, Tenant, UnitTax, UnitUtilityAccount, User } from "@prisma/client";

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
}

export async function UnitDetailsView({ unit }: UnitDetailsViewProps) {
  const users = await getUsers();
  const session = await auth();
  const currentUserId = session?.user?.id;

  return (
    <UnitDetailsClientView 
      unit={unit}
      users={users}
      currentUserId={currentUserId}
    />
  );
}