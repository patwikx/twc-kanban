'use client'

import { Unit, Property, MaintenanceRequest, Lease, Tenant, UnitTax, UnitUtilityAccount, User } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { MaintenanceList } from "./maintenance-list";
import { LeaseHistory } from "./lease-history";
import { UnitDocuments } from "./unit-documents";
import { DeleteUnitDialog } from "./delete-unit-dialog";
import { CurrentTenant } from "./current-tenant";
import { UnitTaxes } from "./unit-taxes";
import { UnitUtilities } from "./unit-utilities";
import { EditUnitDialog } from "./edit-unit-dialog";

interface UnitWithRelations extends Unit {
  property: Property;
  maintenanceRequests: MaintenanceRequest[];
  leases: (Lease & {
    tenant: Tenant;
  })[];
  unitTaxes: UnitTax[];
  utilityAccounts: UnitUtilityAccount[];
}

interface UnitDetailsClientViewProps {
  unit: UnitWithRelations;
  users: User[];
  currentUserId: string | undefined;
}

const statusColorMap = {
  VACANT: "bg-green-500",
  OCCUPIED: "bg-blue-500",
  MAINTENANCE: "bg-red-500",
  RESERVED: "bg-purple-500",
};

export function UnitDetailsClientView({ unit, users, currentUserId }: UnitDetailsClientViewProps) {
  const activeLease = unit.leases.find((lease: Lease) => lease.status === "ACTIVE");
  const currentTenant = activeLease?.tenant;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-8">
            <Link href="/dashboard/spaces">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Spaces
              </Button>
            </Link>
          </div>
          <h2 className="text-2xl font-bold">Space {unit.unitNumber}</h2>
          <p className="text-muted-foreground">{unit.property.propertyName}</p>
          <Badge
            variant="secondary"
            className={`${statusColorMap[unit.status]} text-white`}
          >
            {unit.status}
          </Badge>
        </div>
        <div className="flex gap-2">
          <EditUnitDialog unit={unit} />
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
      <Tabs defaultValue="leases" className="space-y-4">
        <TabsList>
          <TabsTrigger value="leases">Lease History ({unit.leases.length})</TabsTrigger>
          <TabsTrigger value="taxes">Real Property Taxes ({unit.unitTaxes.length})</TabsTrigger>
          <TabsTrigger value="utilities">Utilities ({unit.utilityAccounts.length})</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance History ({unit.maintenanceRequests.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="leases" className="space-y-4">
          <LeaseHistory leases={unit.leases} />
        </TabsContent>
        <TabsContent value="maintenance" className="space-y-4">
          <MaintenanceList requests={unit.maintenanceRequests} />
        </TabsContent>
        <TabsContent value="taxes" className="space-y-4">
          <UnitTaxes 
            taxes={unit.unitTaxes}
            unitId={unit.id}
            unitNumber={unit.unitNumber}
          />
        </TabsContent>
        <TabsContent value="utilities" className="space-y-4">
          <UnitUtilities utilities={unit.utilityAccounts} unitId={unit.id} />
        </TabsContent>
        <TabsContent value="documents" className="space-y-4">
          <UnitDocuments unitId={unit.id} />
        </TabsContent>
      </Tabs>

      {unit.status === "OCCUPIED" && currentTenant && (
        <CurrentTenant tenant={currentTenant} lease={activeLease!} />
      )}
    </div>
  );
} 