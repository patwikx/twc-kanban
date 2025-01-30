'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { Edit, Trash, Plus, Download, FileText, Building2, User, Mail, AlertCircle } from "lucide-react";
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

export function TenantDetails({ tenant }: TenantDetailsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();

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

  const { execute: handleDelete, loading: isDeleting } = useAsync(
    async () => {
      const confirmed = window.confirm("Are you sure you want to delete this tenant?");
      if (confirmed) {
        try {
          await deleteTenant(tenant.id);
          toast({
            title: "Success",
            description: "Tenant has been deleted successfully.",
            variant: "default",
          });
          router.push("/tenants");
        } catch (error) {
          toast({
            title: "Error",
            description: (error instanceof Error ? error.message : "Failed to delete tenant. Please try again."),
            variant: "destructive",
          });
        }
      }
    },
    {
      // Remove successMessage since we're handling it with toast
      showSuccessToast: false, // Disable default success toast
      showErrorToast: false, // Disable default error toast
    }
  );

  const { execute: handleUpdate, loading: isUpdating } = useAsync(
    async (values: TenantFormValues) => {
      try {
        const formData = new FormData();
        
        // Add each form value to the FormData object
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
        form.reset(); // Reset form after successful submission
      } catch (error) {
        toast({
          title: "Error",
          description: (error instanceof Error ? error.message : "Failed to update tenant details. Please try again."),
          variant: "destructive",
        });
      }
    },
    {
      showSuccessToast: true, // Disable default success toast
      showErrorToast: true, // Disable default error toast
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
          <TabsTrigger value="leases">Leases ({activeLeases.length})</TabsTrigger>
          <TabsTrigger value="maintenance">
            Maintenance ({openMaintenanceRequests.length})
          </TabsTrigger>
          <TabsTrigger value="documents">
            Documents ({tenant.documents.length})
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

          <Card>
            <CardHeader>
              <CardTitle>Tenant Details</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Status</TableCell>
                    <TableCell>
                      <Badge variant={tenant.status === "ACTIVE" ? "default" : "secondary"}>
                        {tenant.status.toLowerCase()}
                      </Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Email</TableCell>
                    <TableCell>{tenant.email}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Phone</TableCell>
                    <TableCell>{formatPhoneNumber(tenant.phone)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Company</TableCell>
                    <TableCell>{tenant.company}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Emergency Contact</TableCell>
                    <TableCell>
                      {tenant.emergencyContactName && tenant.emergencyContactPhone ? (
                        <>
                          {tenant.emergencyContactName} ({formatPhoneNumber(tenant.emergencyContactPhone)})
                        </>
                      ) : (
                        "Not provided"
                      )}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Created At</TableCell>
                    <TableCell>{formatDate(tenant.createdAt)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leases" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Leases</h3>
            <AddLeaseDialog 
              tenant={tenant}
              availableUnits={availableUnits}
            />
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
                  {tenant.leases.map((lease) => (
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
    <TerminateLeaseDialog lease={lease} />
  )}
  <EditLeaseDialog lease={lease} />
</TableCell>
                    </TableRow>
                  ))}
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
                  {tenant.maintenanceRequests.map((request) => (
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
                    <TableHead>Uploaded</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tenant.documents.map((doc) => (
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