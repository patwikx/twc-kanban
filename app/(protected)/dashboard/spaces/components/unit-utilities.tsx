'use client'

import { UnitUtilityAccount, UtilityType } from "@prisma/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

import { Button } from "@/components/ui/button";

import { toast } from "sonner";
import { Power, Droplets, Wifi, Trash2 } from "lucide-react";
import { updateUtilityStatus } from "@/lib/data/unit-utility";
import { AddUtilityModal } from "./add-utility-modal";

const utilityIcons = {
  WATER: <Droplets className="h-4 w-4" />,
  ELECTRICITY: <Power className="h-4 w-4" />,
  INTERNET: <Wifi className="h-4 w-4" />,
};

interface UnitUtilitiesProps {
  utilities?: UnitUtilityAccount[];
  unitId: string;
}

export function UnitUtilities({ utilities = [], unitId }: UnitUtilitiesProps) {
  const handleStatusChange = async (id: string, currentStatus: boolean) => {
    try {
      await updateUtilityStatus(id, !currentStatus);
      toast.success("Utility status updated successfully");
    } catch (error) {
      toast.error("Failed to update utility status");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Utility Accounts</h3>
          <p className="text-sm text-muted-foreground">
            Manage utility accounts and meters for this space
          </p>
        </div>
        <AddUtilityModal unitId={unitId} />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {Object.values(UtilityType).map((type) => {
          const account = utilities.find(u => u.utilityType === type);
          return (
            <div key={type} className="rounded-lg border bg-card p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  {utilityIcons[type as keyof typeof utilityIcons]}
                  <h4 className="font-medium">{type.charAt(0) + type.slice(1).toLowerCase()}</h4>
                </div>
                <Badge variant={account?.isActive ? "default" : "secondary"}>
                  {account?.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
              {account ? (
                <div className="space-y-2">
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
                      onClick={() => handleStatusChange(account.id, account.isActive)}
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
              <TableHead>Account Number</TableHead>
              <TableHead>Meter Number</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {utilities.map((utility) => (
              <TableRow key={utility.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {utilityIcons[utility.utilityType as keyof typeof utilityIcons]}
                    <span>{utility.utilityType}</span>
                  </div>
                </TableCell>
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
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {utilities.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center text-muted-foreground h-24"
                >
                  No utility accounts found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}