
import { MaintenanceRequest } from "@prisma/client";
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

interface MaintenanceListProps {
  requests: MaintenanceRequest[];
}

const priorityColorMap = {
  EMERGENCY: "bg-red-500",
  HIGH: "bg-orange-500",
  MEDIUM: "bg-yellow-500",
  LOW: "bg-blue-500",
};

const statusColorMap = {
  PENDING: "bg-yellow-500",
  ASSIGNED: "bg-blue-500",
  IN_PROGRESS: "bg-purple-500",
  COMPLETED: "bg-green-500",
  CANCELLED: "bg-gray-500",
};

export function MaintenanceList({ requests }: MaintenanceListProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Description</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((request) => (
            <TableRow key={request.id}>
              <TableCell>{format(request.createdAt, "PPP")}</TableCell>
              <TableCell>{request.category}</TableCell>
              <TableCell>
                <Badge
                  variant="secondary"
                  className={`${priorityColorMap[request.priority]} text-white`}
                >
                  {request.priority}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge
                  variant="secondary"
                  className={`${statusColorMap[request.status]} text-white`}
                >
                  {request.status}
                </Badge>
              </TableCell>
              <TableCell>{request.description}</TableCell>
            </TableRow>
          ))}
          {requests.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground">
                No maintenance requests found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}