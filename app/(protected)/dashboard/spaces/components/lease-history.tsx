import { Lease } from "@prisma/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/utils";

interface LeaseHistoryProps {
  leases: (Lease & {
    tenant: {
      firstName: string;
      lastName: string;
    };
  })[];
}

const statusColorMap = {
  ACTIVE: "bg-green-500",
  PENDING: "bg-yellow-500",
  TERMINATED: "bg-red-500",
  EXPIRED: "bg-gray-500",
};

export function LeaseHistory({ leases }: LeaseHistoryProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tenant</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead>End Date</TableHead>
            <TableHead>Rent Amount</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leases.map((lease) => (
            <TableRow key={lease.id}>
              <TableCell>
                {lease.tenant.firstName} {lease.tenant.lastName}
              </TableCell>
              <TableCell>{format(lease.startDate, "PPP")}</TableCell>
              <TableCell>{format(lease.endDate, "PPP")}</TableCell>
              <TableCell>{formatCurrency(Number(lease.rentAmount))}</TableCell>
              <TableCell>
                <Badge
                  variant="secondary"
                  className={`${statusColorMap[lease.status]} text-white`}
                >
                  {lease.status}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
          {leases.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground">
                No lease history found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}