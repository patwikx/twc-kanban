
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download, Upload } from "lucide-react";
import { format } from "date-fns";
import { getUnitDocuments } from "@/lib/data/units-get";

interface UnitDocumentsProps {
  unitId: string;
}

export async function UnitDocuments({ unitId }: UnitDocumentsProps) {
  const documents = await getUnitDocuments(unitId);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button>
          <Upload className="mr-2 h-4 w-4" />
          Upload Document
        </Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Uploaded By</TableHead>
              <TableHead>Upload Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.map((doc) => (
              <TableRow key={doc.id}>
                <TableCell>{doc.name}</TableCell>
                <TableCell>{doc.documentType}</TableCell>
                <TableCell>
                  {doc.uploadedBy.firstName} {doc.uploadedBy.lastName}
                </TableCell>
                <TableCell>{format(doc.createdAt, "PPP")}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {documents.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center text-muted-foreground"
                >
                  No documents found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}