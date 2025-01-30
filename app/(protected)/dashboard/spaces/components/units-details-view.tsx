import { Unit, Property, MaintenanceRequest, Lease, Tenant, UnitTax, UnitUtilityAccount } from "@prisma/client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { Edit, ArrowLeft, Trash } from "lucide-react";
import Link from "next/link";
import { MaintenanceList } from "./maintenance-list";
import { LeaseHistory } from "./lease-history";
import { UnitDocuments } from "./unit-documents";
import { DeleteUnitDialog } from "./delete-unit-dialog";
import { CurrentTenant } from "./current-tenant";
import { UnitTaxes } from "./unit-taxes";
import { UnitUtilities } from "./unit-utilities";

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

const statusColorMap = {
  VACANT: "bg-yellow-500",
  OCCUPIED: "bg-green-500",
  MAINTENANCE: "bg-blue-500",
  RESERVED: "bg-purple-500",
};

export function UnitDetailsView({ unit }: UnitDetailsViewProps) {
  const activeLease = unit.leases.find(lease => lease.status === "ACTIVE");
  const currentTenant = activeLease?.tenant;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link href="/dashboard/spaces">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Units
              </Button>
            </Link>
            <Badge
              variant="secondary"
              className={`${statusColorMap[unit.status]} text-white`}
            >
              {unit.status}
            </Badge>
          </div>
          <h2 className="text-2xl font-bold">Unit {unit.unitNumber}</h2>
          <p className="text-muted-foreground">{unit.property.propertyName}</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/units/${unit.id}/edit`}>
            <Button>
              <Edit className="mr-2 h-4 w-4" />
              Edit Unit
            </Button>
          </Link>
          <DeleteUnitDialog unitId={unit.id} unitNumber={unit.unitNumber} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Area</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unit.unitArea.toString()} sqm</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(Number(unit.unitRate))}/sqm</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Rent Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(Number(unit.rentAmount))}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Current Lease</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activeLease ? "Active" : "No Active Lease"}
            </div>
          </CardContent>
        </Card>
      </div>

      {unit.status === "OCCUPIED" && currentTenant && (
        <CurrentTenant tenant={currentTenant} lease={activeLease!} />
      )}

      <Tabs defaultValue="maintenance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="maintenance">Maintenance History ({unit.maintenanceRequests.length})</TabsTrigger>
          <TabsTrigger value="leases">Lease History ({unit.leases.length})</TabsTrigger>
          <TabsTrigger value="taxes">Real Property Taxes ({unit.unitTaxes.length})</TabsTrigger>
          <TabsTrigger value="utilities">Utilities ({unit.utilityAccounts.length})</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>
        <TabsContent value="maintenance" className="space-y-4">
          <MaintenanceList requests={unit.maintenanceRequests} />
        </TabsContent>
        <TabsContent value="leases" className="space-y-4">
          <LeaseHistory leases={unit.leases} />
        </TabsContent>
        <TabsContent value="taxes" className="space-y-4">
          <UnitTaxes taxes={unit.unitTaxes} unitId={unit.id} />
        </TabsContent>
        <TabsContent value="utilities" className="space-y-4">
          <UnitUtilities utilities={unit.utilityAccounts} unitId={unit.id} />
        </TabsContent>
        <TabsContent value="documents" className="space-y-4">
          <UnitDocuments unitId={unit.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}