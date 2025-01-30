'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PropertyWithRelations } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Edit, Trash, Plus, Download, FileText, Building2 } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PropertyType } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAsync } from "@/hooks/use-async";
import { deleteProperty, updateProperty } from "@/actions/property";
import { AddUnitDialog } from "./add-unit-dialog";
import { AddUtilityDialog } from "./add-utility-dialog";
import { AddPropertyTaxDialog } from "./add-property-tax-dialog";


interface PropertyDetailsProps {
  property: PropertyWithRelations;
}

export function PropertyDetails({ property }: PropertyDetailsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();

  const { execute: handleDelete, loading: isDeleting } = useAsync(
    async () => {
      if (confirm("Are you sure you want to delete this property?")) {
        await deleteProperty(property.id);
        router.push("/dashboard/properties");
      }
    },
    {
      successMessage: "Property deleted successfully",
    }
  );

  const { execute: handleUpdate, loading: isUpdating } = useAsync(
    async (formData: FormData) => {
      await updateProperty(property.id, formData);
      setIsEditing(false);
    },
    {
      successMessage: "Property updated successfully",
    }
  );

  const occupancyRate = property.units.length > 0
    ? (property.units.filter(unit => unit.status === "OCCUPIED").length / property.units.length) * 100
    : 0;

  const totalRentAmount = property.units.reduce((sum, unit) => sum + Number(unit.rentAmount), 0);
  const totalTaxAmount = property.propertyTaxes.reduce((sum, tax) => sum + Number(tax.taxAmount), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">{property.propertyName}</h2>
          <p className="text-muted-foreground">Property Code: {property.propertyCode}</p>
        </div>
        <div className="flex space-x-2">
          <Dialog open={isEditing} onOpenChange={setIsEditing}>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon" className="h-9 w-9">
                <Edit className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Edit Property</DialogTitle>
              </DialogHeader>
              <form action={handleUpdate} className="space-y-4">
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="propertyName" className="text-right">
                      Name
                    </Label>
                    <Input
                      id="propertyName"
                      name="propertyName"
                      defaultValue={property.propertyName}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="propertyCode" className="text-right">
                      Code
                    </Label>
                    <Input
                      id="propertyCode"
                      name="propertyCode"
                      defaultValue={property.propertyCode}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="titleNo" className="text-right">
                      Title No.
                    </Label>
                    <Input
                      id="titleNo"
                      name="titleNo"
                      defaultValue={property.titleNo}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="lotNo" className="text-right">
                      Lot No.
                    </Label>
                    <Input
                      id="lotNo"
                      name="lotNo"
                      defaultValue={property.lotNo}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="registeredOwner" className="text-right">
                      Owner
                    </Label>
                    <Input
                      id="registeredOwner"
                      name="registeredOwner"
                      defaultValue={property.registeredOwner}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="leasableArea" className="text-right">
                      Area (sqm)
                    </Label>
                    <Input
                      id="leasableArea"
                      name="leasableArea"
                      type="number"
                      step="0.01"
                      defaultValue={property.leasableArea.toString()}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="address" className="text-right">
                      Address
                    </Label>
                    <Input
                      id="address"
                      name="address"
                      defaultValue={property.address}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="propertyType" className="text-right">
                      Type
                    </Label>
                    <Select name="propertyType" defaultValue={property.propertyType}>
                      <SelectTrigger className="col-span-3">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(PropertyType).map((type) => (
                          <SelectItem key={type} value={type}>
                            {type.charAt(0) + type.slice(1).toLowerCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                    disabled={isUpdating}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isUpdating}>
                    {isUpdating ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
          <Button 
            variant="destructive" 
            size="icon" 
            onClick={() => handleDelete()}
            disabled={isDeleting}
            className="h-9 w-9"
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-background">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="units">Spaces ({property.units.length})</TabsTrigger>
          <TabsTrigger value="utilities">Utilities ({property.utilities.length})</TabsTrigger>
          <TabsTrigger value="taxes">Property Taxes</TabsTrigger>
          <TabsTrigger value="documents">Documents ({property.documents.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Leasable Area</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {property.leasableArea.toString()} sqm
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Spaces</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{property.totalUnits}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {property.units.length} spaces created
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{Math.round(occupancyRate)}%</div>
                <Progress value={occupancyRate} className="mt-2" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(totalRentAmount)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Monthly potential
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Property Details</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Title No.</TableCell>
                    <TableCell>{property.titleNo}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Lot No.</TableCell>
                    <TableCell>{property.lotNo}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Registered Owner</TableCell>
                    <TableCell>{property.registeredOwner}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Address</TableCell>
                    <TableCell>{property.address}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Property Type</TableCell>
                    <TableCell className="capitalize">
                      {property.propertyType.toLowerCase()}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Created At</TableCell>
                    <TableCell>{formatDate(property.createdAt)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="units" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Spaces</h3>
            <AddUnitDialog propertyId={property.id} />
          </div>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Space Number</TableHead>
                    <TableHead>Area (sqm)</TableHead>
                    <TableHead>Rate</TableHead>
                    <TableHead>Rent Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {property.units.map((unit) => (
                    <TableRow key={unit.id}>
                      <TableCell>{unit.unitNumber}</TableCell>
                      <TableCell>{unit.unitArea.toString()}</TableCell>
                      <TableCell>{formatCurrency(Number(unit.unitRate))}</TableCell>
                      <TableCell>{formatCurrency(Number(unit.rentAmount))}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={unit.status === "OCCUPIED" ? "default" : "secondary"}
                        >
                          {unit.status.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          <Building2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="utilities" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Utilities</h3>
            <AddUtilityDialog propertyId={property.id} />
          </div>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Provider</TableHead>
                    <TableHead>Account Number</TableHead>
                    <TableHead>Meter Number</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {property.utilities.map((utility) => (
                    <TableRow key={utility.id}>
                      <TableCell>
                        <Badge variant="outline">
                          {utility.utilityType.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>{utility.provider}</TableCell>
                      <TableCell>{utility.accountNumber}</TableCell>
                      <TableCell>{utility.meterNumber || "N/A"}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          <FileText className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="taxes" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Property Taxes</h3>
            <AddPropertyTaxDialog propertyId={property.id} />
          </div>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tax Year</TableHead>
                    <TableHead>Tax Declaration No.</TableHead>
                    <TableHead>Tax Amount</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {property.propertyTaxes?.map((tax) => (
                    <TableRow key={tax.id}>
                      <TableCell>{tax.taxYear}</TableCell>
                      <TableCell>{tax.TaxDecNo.toString()}</TableCell>
                      <TableCell>{formatCurrency(Number(tax.taxAmount))}</TableCell>
                      <TableCell>{formatDate(tax.dueDate)}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={tax.isPaid ? "default" : "secondary"}
                        >
                          {tax.isPaid ? "Paid" : "Unpaid"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          <FileText className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Documents</h3>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Upload Document
            </Button>
          </div>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Uploaded By</TableHead>
                    <TableHead>Uploaded</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {property.documents.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell>{doc.name}</TableCell>
                      <TableCell>
                        <span className="capitalize">{doc.documentType.toLowerCase()}</span>
                      </TableCell>
                      <TableCell>
                        {doc.uploadedById}
                      </TableCell>
                      <TableCell>{formatDate(doc.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}