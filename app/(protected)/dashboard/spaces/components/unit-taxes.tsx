'use client'

import { UnitTax } from "@prisma/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Calendar, Receipt } from "lucide-react";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/utils";

import { Button } from "@/components/ui/button";

import { toast } from "sonner";
import { updateUnitTaxStatus } from "@/lib/data/unit-tax";
import { AddTaxModal } from "./add-unit-tax-modal";

interface UnitTaxesProps {
  taxes?: UnitTax[];
  unitId: string;
}

export function UnitTaxes({ taxes = [], unitId }: UnitTaxesProps) {
  const handleStatusChange = async (id: string, currentStatus: boolean) => {
    try {
      await updateUnitTaxStatus(id, !currentStatus);
      toast.success("Tax status updated successfully");
    } catch (error) {
      toast.error("Failed to update tax status");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Real Property Taxes</h3>
        <AddTaxModal unitId={unitId} />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tax Year</TableHead>
              <TableHead>Tax Dec. No.</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {taxes.map((tax) => (
              <TableRow key={tax.id}>
                <TableCell>{tax.taxYear}</TableCell>
                <TableCell className="font-mono">{tax.taxDecNo}</TableCell>
                <TableCell>{formatCurrency(Number(tax.taxAmount))}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {format(tax.dueDate, "PPP")}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={tax.isPaid ? "success" : "destructive"}
                    className={tax.isPaid ? "bg-green-500" : "bg-red-500"}
                  >
                    {tax.isPaid ? "Paid" : "Unpaid"}
                  </Badge>
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
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStatusChange(tax.id, tax.isPaid)}
                  >
                    Mark as {tax.isPaid ? "Unpaid" : "Paid"}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {(!taxes || taxes.length === 0) && (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center text-muted-foreground h-24"
                >
                  No tax records found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}