'use client'

import { Tenant, Lease } from "@prisma/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/utils";
import { Phone, Mail, Building2, Calendar } from "lucide-react";

interface CurrentTenantProps {
  tenant: Tenant;
  lease: Lease;
}

export function CurrentTenant({ tenant, lease }: CurrentTenantProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Current Tenant</CardTitle>
        <CardDescription>Details of the current occupant</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">
                {tenant.firstName} {tenant.lastName}
              </h3>
              <p className="text-sm text-muted-foreground">{tenant.bpCode}</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{tenant.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{tenant.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span>{tenant.company}</span>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">Lease Details</h3>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Start: {format(lease.startDate, "PPP")}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>End: {format(lease.endDate, "PPP")}</span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Security Deposit</p>
                <p className="font-medium">{formatCurrency(Number(lease.securityDeposit))}</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}