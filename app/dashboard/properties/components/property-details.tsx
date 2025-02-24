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
import { Edit, Trash, Plus, Download, FileText, Building2, Droplets, Power, Wifi, Eye, Receipt, Calendar, MapPin, User } from "lucide-react";
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
import { PropertyType, UtilityType } from "@prisma/client";
import type { User as PrismaUser } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAsync } from "@/hooks/use-async";
import { deleteProperty, updateProperty } from "@/actions/property";
import { AddUnitDialog } from "./add-unit-dialog";
import { AddUtilityDialog } from "./add-utility-dialog";
import { AddPropertyTaxDialog } from "./add-property-tax-dialog";
import { toast } from "sonner";
import { updatePropertyTaxStatus, updateUtilityStatus } from "@/actions/property-tax";
import { QuestionMarkCircledIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import { format } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";


interface PropertyDetailsProps {
  property: PropertyWithRelations;
  currentUserId: string;
  users: PrismaUser[];
}

export function PropertyDetails({ property, currentUserId, users }: PropertyDetailsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();

  const { execute: handleDelete, loading: isDeleting } = useAsync(
    async () => {
      await deleteProperty(property.id);
      router.push("/dashboard/properties");
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

  const handleTaxStatusChange = async (taxId: string, currentStatus: boolean) => {
    try {
      await updatePropertyTaxStatus(taxId, !currentStatus);
      toast.success("Tax status updated successfully");
      router.refresh();
    } catch (error) {
      toast.error("Failed to update tax status");
    }
  };

  const { execute: handleUtilityStatusChange } = useAsync(
    async (id: string, currentStatus: boolean) => {
      try {
        await updateUtilityStatus(id, !currentStatus);
        toast.success("Utility status updated successfully");
      } catch (error) {
        toast.error("Failed to update utility status");
      }
    }
  );


  const totalUnitArea = property.units.reduce((sum, unit) => sum + Number(unit.unitArea), 0);
  const leasableArea = Number(property.leasableArea);
  const occupancyRate = leasableArea > 0
    ? (totalUnitArea / leasableArea) * 100
    : 0;

  const totalRentAmount = property.units.reduce((sum, unit) => sum + Number(unit.rentAmount), 0);
  const totalTaxAmount = property.propertyTaxes.reduce((sum, tax) => sum + Number(tax.taxAmount), 0);

  const handleExportTaxesCSV = () => {
    const csvData = property.propertyTaxes.map(tax => ({
      'Tax Year': tax.taxYear,
      'Tax Declaration No.': tax.TaxDecNo,
      'Amount': Number(tax.taxAmount).toFixed(2),
      'Annual': tax.isAnnual ? 'Yes' : 'No',
      'Quarterly': tax.isQuarterly ? 'Yes' : 'No',
      'Quarter': tax.whatQuarter || '-',
      'Due Date': formatDate(tax.dueDate),
      'Status': tax.isPaid ? 'Paid' : 'Unpaid',
      'Processed By': tax.processedBy ? 
        `${users.find(user => user.id === tax.processedBy)?.firstName} ${users.find(user => user.id === tax.processedBy)?.lastName}` 
        : '-',
      'Remarks': tax.remarks || '-',
      'Payment Date': tax.paidDate ? format(tax.paidDate, "PPP") : '-'
    }));

    const headers = Object.keys(csvData[0]);
    const csvString = [
      headers.join(','),
      ...csvData.map(row => headers.map(header => {
        const value = row[header as keyof typeof row];
        return `"${value}"`;
      }).join(','))
    ].join('\n');

    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    const filename = `property_${property.propertyName}_rpt_${new Date().toISOString().split('T')[0]}.csv`;
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportUnitsCSV = () => {
    const csvData = property.units.map(unit => ({
      'Space Number': unit.unitNumber,
      'Area (sqm)': unit.unitArea.toString(),
      'Rate': Number(unit.unitRate).toFixed(2),
      'Rent Amount': Number(unit.rentAmount).toFixed(2),
      'Ground Floor': unit.isFirstFloor ? 'Yes' : 'No',
      'Second Floor': unit.isSecondFloor ? 'Yes' : 'No',
      'Third Floor': unit.isThirdFloor ? 'Yes' : 'No',
      'Rooftop': unit.isRoofTop ? 'Yes' : 'No',
      'Mezzanine': unit.isMezzanine ? 'Yes' : 'No',
      'Status': unit.status,
    }));

    const headers = Object.keys(csvData[0]);
    const csvString = [
      headers.join(','),
      ...csvData.map(row => headers.map(header => {
        const value = row[header as keyof typeof row];
        return `"${value}"`;
      }).join(','))
    ].join('\n');

    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    const filename = `property_${property.propertyName}_spaces_${new Date().toISOString().split('T')[0]}.csv`;
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportUtilitiesCSV = () => {
    const csvData = property.utilities.map(utility => ({
      'Type': utility.utilityType,
      'Provider': utility.provider,
      'Account Number': utility.accountNumber,
      'Meter Number': utility.meterNumber || '-',
      'Status': utility.isActive ? 'Active' : 'Inactive'
    }));

    const headers = Object.keys(csvData[0]);
    const csvString = [
      headers.join(','),
      ...csvData.map(row => headers.map(header => {
        const value = row[header as keyof typeof row];
        return `"${value}"`;
      }).join(','))
    ].join('\n');

    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    const filename = `property_${property.propertyName}_utilities_${new Date().toISOString().split('T')[0]}.csv`;
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="icon" className="h-9 w-9">
                <Trash className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the property
                  &quot;{property.propertyName}&quot; and all its associated data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {isDeleting ? "Deleting..." : "Delete Property"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-background">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="units">Spaces ({property.units.length})</TabsTrigger>
          <TabsTrigger value="taxes">Real Property Taxes ({property.propertyTaxes.length})</TabsTrigger>
          <TabsTrigger value="documents">Documents ({property.documents.length})</TabsTrigger>
          <TabsTrigger value="utilities">Utilities ({property.utilities.length})</TabsTrigger>


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
    <p className="text-xs text-muted-foreground mt-1">
      {totalUnitArea} / {Number(property.leasableArea)} sqm used
    </p>
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
  <CardHeader className="border-b">
    <CardTitle className="flex items-center gap-2">
      <Building2 className="h-5 w-5 text-primary" />
      Property Details
    </CardTitle>
  </CardHeader>
  <CardContent className="p-6">
    <div className="grid gap-6">
      {/* Legal Information */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Legal Information
        </h4>
        <div className="grid gap-3">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
            <FileText className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">{property.titleNo || "—"}</p>
              <p className="text-xs text-muted-foreground">Title Number</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
            <FileText className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">{property.lotNo || "—"}</p>
              <p className="text-xs text-muted-foreground">Lot Number</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
            <User className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">{property.registeredOwner}</p>
              <p className="text-xs text-muted-foreground">Registered Owner</p>
            </div>
          </div>
        </div>
      </div>

      {/* Property Information */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Property Information
        </h4>
        <div className="grid gap-3">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
          <FileText className="h-5 w-5 text-muted-foreground" />
          <div>
          <p className="text-sm font-medium">{property.propertyCode}</p>
                <p className="text-xs text-muted-foreground">Property Code</p>
    
          </div>

          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
            <MapPin className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">{property.address}</p>
              <p className="text-xs text-muted-foreground">Address</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
            <Building2 className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">
                <Badge variant="outline" className="font-normal">
                  {property.propertyType.toUpperCase()}
                </Badge>
              </p>
              <p className="text-xs text-muted-foreground">Property Type</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">{formatDate(property.createdAt)}</p>
              <p className="text-xs text-muted-foreground">
                Date Created
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </CardContent>
</Card>
        </TabsContent>

        <TabsContent value="units" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Spaces</h3>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleExportUnitsCSV}
                disabled={!property.units.length}
              >
                <Download className="h-4 w-4 mr-2" />
                Export to CSV
              </Button>
              <AddUnitDialog propertyId={property.id} />
            </div>
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
                    <TableHead>Ground Floor</TableHead>
                    <TableHead>Second Floor</TableHead>
                    <TableHead>Third Floor</TableHead>
                    <TableHead>Rooftop Floor</TableHead>
                    <TableHead>Mezzanine</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {property.units.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={11} className="h-24 text-center text-muted-foreground">
                        No space records found
                      </TableCell>
                    </TableRow>
                  ) : (
                    property.units.map((unit) => (
                      <TableRow key={unit.id}>
                        <TableCell>{unit.unitNumber}</TableCell>
                        <TableCell>{unit.unitArea.toString()}</TableCell>
                        <TableCell>{formatCurrency(Number(unit.unitRate))}</TableCell>
                        <TableCell>{formatCurrency(Number(unit.rentAmount))}</TableCell>
                        <TableCell>
                          <Badge variant={unit.isFirstFloor ? "default" : "secondary"} className={unit.isFirstFloor ? "bg-orange-500" : ""}>
                            {unit.isFirstFloor ? "Yes" : "No"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={unit.isSecondFloor ? "default" : "secondary"} className={unit.isSecondFloor ? "bg-orange-500" : ""}>
                            {unit.isSecondFloor ? "Yes" : "No"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={unit.isThirdFloor ? "default" : "secondary"} className={unit.isThirdFloor ? "bg-orange-500" : ""}>
                            {unit.isThirdFloor ? "Yes" : "No"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={unit.isRoofTop ? "default" : "secondary"} className={unit.isRoofTop ? "bg-orange-500" : ""}>
                            {unit.isRoofTop ? "Yes" : "No"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={unit.isMezzanine ? "default" : "secondary"} className={unit.isMezzanine ? "bg-orange-500" : ""}>
                            {unit.isMezzanine ? "Yes" : "No"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={unit.status === "OCCUPIED" ? "default" : "secondary"}
                          >
                            {unit.status.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Link href={`/dashboard/spaces/${unit.id}`}>
                            <Button variant='outline'>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="utilities" className="space-y-6">
  <div className="flex justify-between items-center">
    <div>
      <h3 className="text-lg font-semibold">Utility Accounts</h3>
      <p className="text-sm text-muted-foreground">
        Manage utility accounts and meters for this property
      </p>
    </div>
    <div className="flex gap-2">
      <Button
        variant="outline"
        onClick={handleExportUtilitiesCSV}
        disabled={!property.utilities.length}
      >
        <Download className="h-4 w-4 mr-2" />
        Export to CSV
      </Button>
      <AddUtilityDialog propertyId={property.id} />
    </div>
  </div>

  <div className="grid gap-6 md:grid-cols-3">
    {Object.values(UtilityType).map((type) => {
      const account = property.utilities.find(u => u.utilityType === type);
      return (
        <div key={type} className="rounded-lg border bg-card p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              {type === 'WATER' && <Droplets className="h-4 w-4" />}
              {type === 'ELECTRICITY' && <Power className="h-4 w-4" />}
              {type === 'OTHERS' && <QuestionMarkCircledIcon className="h-4 w-4" />}
              <h4 className="font-medium">{type.charAt(0) + type.slice(1).toLowerCase()}</h4>
            </div>
            <Badge variant={account?.isActive ? "default" : "secondary"}>
              {account?.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
          {account ? (
            <div className="space-y-2">
              <div>
                <p className="text-sm text-muted-foreground">Provider</p>
                <p className="font-medium">{account.provider}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Account Number</p>
                <p className="font-mono">{account.accountNumber}</p>
              </div>
              {account.meterNumber && (
                <div>
                  <p className="text-sm text-muted-foreground">Meter Number</p>
                  <p className="font-mono">{account.meterNumber}</p>
                </div>
              )}
              <div className="pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => handleUtilityStatusChange(account.id, account.isActive)}
                >
                  Mark as {account.isActive ? "Inactive" : "Active"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground">No account configured</p>
            </div>
          )}
        </div>
      );
    })}
  </div>

  <div className="rounded-md border">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Type</TableHead>
          <TableHead>Provider</TableHead>
          <TableHead>Account Number</TableHead>
          <TableHead>Meter Number</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {property.utilities.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
              No utility records found
            </TableCell>
          </TableRow>
        ) : (
          property.utilities.map((utility) => (
            <TableRow key={utility.id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  {utility.utilityType === 'WATER' && <Droplets className="h-4 w-4" />}
                  {utility.utilityType === 'ELECTRICITY' && <Power className="h-4 w-4" />}
                  {utility.utilityType === UtilityType.OTHERS && <QuestionMarkCircledIcon className="h-4 w-4" />}
                  <span>{utility.utilityType}</span>
                </div>
              </TableCell>
              <TableCell>{utility.provider}</TableCell>
              <TableCell className="font-mono">{utility.accountNumber}</TableCell>
              <TableCell className="font-mono">{utility.meterNumber || "-"}</TableCell>
              <TableCell>
                <Badge variant={utility.isActive ? "default" : "secondary"}>
                  {utility.isActive ? "Active" : "Inactive"}
                </Badge>
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleUtilityStatusChange(utility.id, utility.isActive)}
                >
                  {utility.isActive ? "Deactivate" : "Activate"}
                </Button>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  </div>
</TabsContent>

        <TabsContent value="taxes" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Real Property Taxes</h3>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleExportTaxesCSV}
                disabled={!property.propertyTaxes.length}
              >
                <Download className="h-4 w-4 mr-2" />
                Export to CSV
              </Button>
              <AddPropertyTaxDialog 
                propertyId={property.id} 
                users={users} 
                currentUserId={currentUserId} 
              />
            </div>
          </div>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tax Year</TableHead>
                    <TableHead>Tax Declaration No.</TableHead>
                    <TableHead>Tax Amount</TableHead>
                    <TableHead>Annualy?</TableHead>
                    <TableHead>Quarterly?</TableHead>
                    <TableHead>Quarter?</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Remarks</TableHead>
                    <TableHead>Processed By</TableHead>
                    <TableHead>Payment Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {property.propertyTaxes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={12} className="h-24 text-center text-muted-foreground">
                        No tax records found
                      </TableCell>
                    </TableRow>
                  ) : (
                    property.propertyTaxes?.map((tax) => (
                      <TableRow key={tax.id}>
                        <TableCell>{tax.taxYear}</TableCell>
                        <TableCell>{tax.TaxDecNo.toString()}</TableCell>
                        <TableCell>{formatCurrency(Number(tax.taxAmount))}</TableCell>
                        <TableCell>{tax.isAnnual ? 'Yes' : 'No'}</TableCell>
                        <TableCell>{tax.isQuarterly ? 'Yes' : 'No'}</TableCell>
                        <TableCell>{tax.whatQuarter}</TableCell>
                        <TableCell>{formatDate(tax.dueDate)}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={tax.isPaid ? "default" : "secondary"}
                            className="cursor-pointer hover:opacity-80"
                            onClick={() => handleTaxStatusChange(tax.id, tax.isPaid)}
                          >
                            {tax.isPaid ? "Paid" : "Unpaid"}
                          </Badge>
                        </TableCell>
                        <TableCell>{tax.remarks}</TableCell>
                        <TableCell>
                          {tax.processedBy ? (
                            users.find(user => user.id === tax.processedBy)
                              ? `${users.find(user => user.id === tax.processedBy)?.firstName} ${users.find(user => user.id === tax.processedBy)?.lastName}`
                              : "Unknown User"
                          ) : "-"}
                        </TableCell>
                        <TableCell>
                          {tax.paidDate ? (
                            <div className="flex items-center gap-2">
                              <Receipt className="h-4 w-4 text-muted-foreground" />
                              {format(tax.paidDate, "PPP")}
                            </div>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleTaxStatusChange(tax.id, tax.isPaid)}
                          >
                            {tax.isPaid ? "Mark as Unpaid" : "Mark as Paid"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
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
                  {property.documents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                        No document records found
                      </TableCell>
                    </TableRow>
                  ) : (
                    property.documents.map((doc) => (
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
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}