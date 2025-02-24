'use client';

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { TenantWithRelations } from "@/types";
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
import { Edit, Trash, Plus, Download, FileText, Building2, User, Mail, AlertCircle, Calendar, Phone, ExternalLink } from "lucide-react";
import { formatDate, formatPhoneNumber, formatCurrency } from "@/lib/utils/format";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MaintenanceStatus, TenantStatus } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { useAsync } from "@/hooks/use-async";
import { deleteTenant, updateTenant } from "@/actions/tenants";
import { AddLeaseDialog } from "./add-lease-dialog";
import { TerminateLeaseDialog } from "./terminate-lease-dialog";
import { EditLeaseDialog } from "./edit-lease-dialog";
import { Separator } from "@/components/ui/separator";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { z } from 'zod';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@/components/ui/use-toast";
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

export const revalidate = 0;


// Add the form schema
const tenantFormSchema = z.object({
  bpCode: z.string().min(1, "BP code is required"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  company: z.string().min(1, "Company name is required"),
  status: z.nativeEnum(TenantStatus),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
});

type TenantFormValues = z.infer<typeof tenantFormSchema>;


interface TenantDetailsProps {
  tenant: TenantWithRelations;
}

export function TenantDetails({ tenant: initialTenant }: TenantDetailsProps) {
  const [tenant, setTenant] = useState(initialTenant);
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const form = useForm<TenantFormValues>({
    resolver: zodResolver(tenantFormSchema),
    defaultValues: {
      bpCode: tenant.bpCode,
      firstName: tenant.firstName,
      lastName: tenant.lastName,
      email: tenant.email,
      phone: tenant.phone,
      company: tenant.company,
      status: tenant.status,
      emergencyContactName: tenant.emergencyContactName || "",
      emergencyContactPhone: tenant.emergencyContactPhone || "",
    },
  });

  useEffect(() => {
    const selectedId = searchParams.get('selected');
    if (selectedId && selectedId !== tenant.id) {
      fetch(`/api/tenants/${selectedId}`)
        .then(res => res.json())
        .then(data => {
          setTenant(data);
          form.reset({
            bpCode: data.bpCode,
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            phone: data.phone,
            company: data.company,
            status: data.status,
            emergencyContactName: data.emergencyContactName || "",
            emergencyContactPhone: data.emergencyContactPhone || "",
          });
        });
    }
  }, [searchParams, form, tenant.id]);

  const { execute: handleDelete, loading: isDeleting } = useAsync(
    async () => {
      await deleteTenant(tenant.id);
      toast({
        title: "Success",
        description: "Tenant has been deleted successfully.",
        variant: "default",
      });
      router.push("/tenants");
    },
    {
      showSuccessToast: false,
      showErrorToast: false,
    }
  );

  const { execute: handleUpdate, loading: isUpdating } = useAsync(
    async (values: TenantFormValues) => {
      try {
        const formData = new FormData();
        
        Object.entries(values).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            formData.append(key, value.toString());
          }
        });
  
        await updateTenant(tenant.id, formData);
        toast({
          title: "Success",
          description: "Tenant details have been updated successfully.",
          variant: "default",
        });
        setIsEditing(false);
        form.reset();
        router.refresh();
      } catch (error) {
        toast({
          title: "Error",
          description: (error instanceof Error ? error.message : "Failed to update tenant details. Please try again."),
          variant: "destructive",
        });
      }
    },
    {
      showSuccessToast: true,
      showErrorToast: true,
    }
  );

  const activeLeases = tenant.leases.filter(lease => 
    lease.status === "ACTIVE" || lease.status === "PENDING"
  );

  const openMaintenanceRequests = tenant.maintenanceRequests.filter(request =>
    request.status !== "COMPLETED" && request.status !== "CANCELLED"
  );

  // Get available units (units that are vacant or reserved)
  const availableUnits = tenant.leases
    .filter(lease => lease.unit.status === "VACANT" || lease.unit.status === "RESERVED")
    .map(lease => ({
      id: lease.unit.id,
      unitNumber: lease.unit.unitNumber,
      property: {
        id: lease.unit.property.id,
        propertyName: lease.unit.property.propertyName
      }
    }));

  const handleLeaseCreated = (newLease: any) => {
    setTenant(prev => ({
      ...prev,
      leases: [...prev.leases, newLease]
    }));
  };

  const handleLeaseTerminated = (leaseId: string) => {
    setTenant(prev => ({
      ...prev,
      leases: prev.leases.map(lease => 
        lease.id === leaseId 
          ? { ...lease, status: "TERMINATED" }
          : lease
      )
    }));
  };

  const handleExportLeases = () => {
    // Define CSV headers
    const headers = [
      "Property",
      "Unit",
      "Start Date",
      "End Date",
      "Rent Amount",
      "Security Deposit",
      "Status",
      "Termination Date",
      "Termination Reason"
    ];

    // Format lease data for CSV
    const csvData = tenant.leases.map(lease => {
      // Remove currency symbols and commas from amounts
      const rentAmount = lease.rentAmount.toString().replace(/[₱,]/g, '');
      const securityDeposit = lease.securityDeposit.toString().replace(/[₱,]/g, '');

      return [
        lease.unit.property.propertyName,
        lease.unit.unitNumber,
        formatDate(lease.startDate),
        formatDate(lease.endDate),
        rentAmount,
        securityDeposit,
        lease.status,
        lease.terminationDate ? formatDate(lease.terminationDate) : '',
        lease.terminationReason || ''
      ];
    });

    // Add BOM for Excel to properly recognize UTF-8
    const BOM = "\uFEFF";
    
    // Combine headers and data
    const csvContent = BOM + [
      headers.join(','),
      ...csvData.map(row => 
        // Wrap fields in quotes to handle commas in text
        row.map(field => `"${field}"`).join(',')
      )
    ].join('\n');

    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `leases_${tenant.firstName}_${tenant.lastName}_${formatDate(new Date())}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url); // Clean up the URL object
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">
            {tenant.firstName} {tenant.lastName}
          </h2>
          <p className="text-muted-foreground">BP Code: {tenant.bpCode}</p>
        </div>
        <div className="flex space-x-2">
          <Dialog open={isEditing} onOpenChange={setIsEditing}>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon" className="h-9 w-9">
                <Edit className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Edit Tenant Profile</DialogTitle>
                <DialogDescription>
                  Update tenant information and preferences. All fields marked with * are required.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleUpdate)} className="space-y-6">
                  {/* Basic Information Section */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <User className="h-5 w-5 text-muted-foreground" />
                      <h3 className="text-lg font-medium">Basic Information</h3>
                    </div>
                    <Separator />
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="bpCode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                BP Code <span className="text-destructive">*</span>
                              </FormLabel>
                              <FormControl>
                                <Input placeholder="Enter BP code" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                First Name <span className="text-destructive">*</span>
                              </FormLabel>
                              <FormControl>
                                <Input placeholder="Enter first name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="status"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Status <span className="text-destructive">*</span>
                              </FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {Object.values(TenantStatus).map((status) => (
                                    <SelectItem key={status} value={status}>
                                      {status.charAt(0) + status.slice(1).toLowerCase()}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="lastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Last Name <span className="text-destructive">*</span>
                              </FormLabel>
                              <FormControl>
                                <Input placeholder="Enter last name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Contact Information Section */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-5 w-5 text-muted-foreground" />
                      <h3 className="text-lg font-medium">Contact Information</h3>
                    </div>
                    <Separator />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Email <span className="text-destructive">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="Enter email address" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Phone <span className="text-destructive">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="Enter phone number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Company Information Section */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Building2 className="h-5 w-5 text-muted-foreground" />
                      <h3 className="text-lg font-medium">Company Information</h3>
                    </div>
                    <Separator />
                    <FormField
                      control={form.control}
                      name="company"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Company Name <span className="text-destructive">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Enter company name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Emergency Contact Section */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="h-5 w-5 text-muted-foreground" />
                      <h3 className="text-lg font-medium">Emergency Contact</h3>
                    </div>
                    <Separator />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="emergencyContactName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Emergency Contact Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter emergency contact name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="emergencyContactPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Emergency Contact Phone</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter emergency contact phone" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                      disabled={isUpdating}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isUpdating}>
                      {isUpdating ? (
                        <>
                          <span className="animate-spin mr-2">⚪</span>
                          Saving Changes...
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
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
                  This action cannot be undone. This will permanently delete tenant
                  &quot;{tenant.firstName} {tenant.lastName}&quot; and all their associated data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {isDeleting ? "Deleting..." : "Delete Tenant"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-background">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="leases">Leases ({activeLeases.length})</TabsTrigger>
          <TabsTrigger value="documents">
            Documents ({tenant.documents.length})
          </TabsTrigger>
          <TabsTrigger value="maintenance">
            Maintenance ({openMaintenanceRequests.length})
          </TabsTrigger>

        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Leases</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeLeases.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Open Requests</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {openMaintenanceRequests.length}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-card">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-2xl flex items-center gap-2">
              Tenant Information

            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Comprehensive tenant details and contact information
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Edit Details
            </Button>
            <Button>
              <ExternalLink className="h-4 w-4 mr-2" />
              View Full Profile
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid gap-6">
          {/* Basic Information */}
          <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-semibold">
                {tenant.firstName} {tenant.lastName}               <Badge 
                variant={tenant.status === "ACTIVE" ? "default" : "secondary"}
                className="ml-2 mt-[-10px]"
              >
                {tenant.status.toUpperCase()}
              </Badge>
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                BP Code: <span className="font-mono">{tenant.bpCode}</span>
              </p>
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Contact Details
              </h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{tenant.email}</p>
                    <p className="text-xs text-muted-foreground">Primary Email</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{formatPhoneNumber(tenant.phone)}</p>
                    <p className="text-xs text-muted-foreground">Primary Phone</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                  <Building2 className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{tenant.company}</p>
                    <p className="text-xs text-muted-foreground">Company</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Additional Information
              </h4>
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-3 mb-2">
                    <AlertCircle className="h-5 w-5 text-muted-foreground" />
                    <p className="text-sm font-medium">Emergency Contact</p>
                  </div>
                  {tenant.emergencyContactName && tenant.emergencyContactPhone ? (
                    <div className="ml-8 space-y-1">
                      <p className="text-sm">{tenant.emergencyContactName}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatPhoneNumber(tenant.emergencyContactPhone)}
                      </p>
                    </div>
                  ) : (
                    <p className="ml-8 text-sm text-muted-foreground">Not provided</p>
                  )}
                </div>
                <div className="p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-3 mb-2">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <p className="text-sm font-medium">Account Created</p>
                  </div>
                  <p className="ml-8 text-sm text-muted-foreground">
                    {formatDate(tenant.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
        </TabsContent>

        <TabsContent value="leases" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Leases</h3>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleExportLeases}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export to CSV
              </Button>
              <AddLeaseDialog 
                tenant={tenant}
                availableUnits={availableUnits}
                onLeaseCreated={handleLeaseCreated}
              />
            </div>
          </div>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Property/Unit</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Rent Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tenant.leases.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                        No lease records found
                      </TableCell>
                    </TableRow>
                  ) : (
                    tenant.leases.map((lease) => (
                      <TableRow key={lease.id}>
                        <TableCell>
                          {lease.unit.property.propertyName} - {lease.unit.unitNumber}
                        </TableCell>
                        <TableCell>{formatDate(lease.startDate)}</TableCell>
                        <TableCell>{formatDate(lease.endDate)}</TableCell>
                        <TableCell>{formatCurrency(lease.rentAmount.toString())}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={lease.status === "ACTIVE" ? "default" : "secondary"}
                          >
                            {lease.status.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          {lease.status === "ACTIVE" && (
                            <TerminateLeaseDialog 
                              lease={lease} 
                              onLeaseTerminated={handleLeaseTerminated}
                            />
                          )}
                          <EditLeaseDialog lease={lease} />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Maintenance Requests</h3>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Request
            </Button>
          </div>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Property/Unit</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tenant.maintenanceRequests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                        No maintenance records found
                      </TableCell>
                    </TableRow>
                  ) : (
                    tenant.maintenanceRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell>
                          {request.unit.property.propertyName} - {request.unit.unitNumber}
                        </TableCell>
                        <TableCell>{request.category}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              request.priority === "HIGH" ? "destructive" :
                              request.priority === "MEDIUM" ? "default" :
                              "secondary"
                            }
                          >
                            {request.priority.toLowerCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              request.status === MaintenanceStatus.ASSIGNED ? "default" :
                              request.status === "IN_PROGRESS" ? "default" :
                              "secondary"
                            }
                          >
                            {request.status.toLowerCase().replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(request.createdAt)}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            <FileText className="h-4 w-4" />
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
                    <TableHead>Uploaded</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tenant.documents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                        No document records found
                      </TableCell>
                    </TableRow>
                  ) : (
                    tenant.documents.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell>{doc.name}</TableCell>
                        <TableCell>
                          <span className="capitalize">{doc.documentType.toLowerCase()}</span>
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