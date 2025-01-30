import { Unit, Property, MaintenanceRequest, Lease } from "@prisma/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { Edit, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { MaintenanceList } from "./maintenance-list";
import { LeaseHistory } from "./lease-history";
import { UnitDocuments } from "./unit-documents";


interface UnitWithRelations extends Unit {
  property: Property;
  maintenanceRequests: MaintenanceRequest[];
  leases: (Lease & {
    tenant: {
      firstName: string;
      lastName: string;
    };
  })[];
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
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-4">
            <Link href="/dashboard/spaces">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Units
              </Button>
            </Link>

          </div>
          <h2 className="text-2xl font-bold">Unit {unit.unitNumber}</h2>
          <p className="text-muted-foreground">{unit.property.propertyName}</p>
          <Badge
              variant="secondary"
              className={`${statusColorMap[unit.status]} text-white`}
            >
              {unit.status}
            </Badge>
        </div>
        <Link href={`/dashboard/spaces/${unit.id}/edit`}>
          <Button>
            <Edit className="mr-2 h-4 w-4" />
            Edit Unit
          </Button>
        </Link>
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
              {unit.leases.find(lease => lease.status === "ACTIVE")
                ? "Active"
                : "No Active Lease"}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="maintenance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="maintenance">Maintenance History</TabsTrigger>
          <TabsTrigger value="leases">Lease History</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>
        <TabsContent value="maintenance" className="space-y-4">
          <MaintenanceList requests={unit.maintenanceRequests} />
        </TabsContent>
        <TabsContent value="leases" className="space-y-4">
          <LeaseHistory leases={unit.leases} />
        </TabsContent>
        <TabsContent value="documents" className="space-y-4">
          <UnitDocuments unitId={unit.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}