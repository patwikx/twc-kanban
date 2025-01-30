import { Unit, Property, Lease, Document, UnitTax, UnitUtilityAccount, UtilityBill, MaintenanceRequest, Tenant } from "@prisma/client";

export type UnitWithRelationsx = Unit & {
  property: Property;
  leases: (Lease & {
    tenant: Tenant;
  })[];
  documents: Document[];
  unitTaxes: UnitTax[];
  utilityAccounts: (UnitUtilityAccount & {
    bills: UtilityBill[];
  })[];
  maintenanceRequests: (MaintenanceRequest & {
    tenant: Tenant;
  })[];
};