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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatCurrency } from "@/lib/utils";
import { MoreHorizontal, Eye, Edit, Trash, Download } from "lucide-react";
import { UnitStatus } from "@prisma/client";

import { DataTableToolbar } from "./units-toolbar";
import Link from "next/link";
import { getUnits } from "@/lib/data/units-get";
import { DataTablePagination } from "./data-table-pagination";
import { exportToCSV } from "@/lib/utils/export-to-csv";


const statusColorMap: Record<UnitStatus, string> = {
  VACANT: "bg-yellow-500",
  OCCUPIED: "bg-green-500",
  MAINTENANCE: "bg-blue-500",
  RESERVED: "bg-purple-500",
};

export async function UnitsDataTable() {
  const units = await getUnits();

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <DataTableToolbar />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Unit Number</TableHead>
              <TableHead>Property</TableHead>
              <TableHead>Area (sqm)</TableHead>
              <TableHead>Rate</TableHead>
              <TableHead>Rent Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {units.map((unit) => (
              <TableRow key={unit.id}>
                <TableCell className="font-medium">{unit.unitNumber}</TableCell>
                <TableCell>{unit.property.propertyName}</TableCell>
                <TableCell>{unit.unitArea.toString()}</TableCell>
                <TableCell>{formatCurrency(Number(unit.unitRate))}</TableCell>
                <TableCell>{formatCurrency(Number(unit.rentAmount))}</TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={`${statusColorMap[unit.status]} text-white`}
                  >
                    {unit.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <Link href={`/dashboard/spaces/${unit.id}`}>
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                      </Link>
                      <Link href={`/dashboard/spaces/${unit.id}/edit`}>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Unit
                        </DropdownMenuItem>
                      </Link>
                      <DropdownMenuItem className="text-destructive">
                        <Trash className="mr-2 h-4 w-4" />
                        Delete Unit
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination />
    </div>
  );
}