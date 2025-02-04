'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Download, Upload } from "lucide-react";
import { importTenantsFromCSV } from "@/actions/tenants";


export function TenantCSVImport() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const [headers, ...rows] = text.split('\n').map(row => row.trim()).filter(Boolean);
        const headerArray = headers.split(',').map(h => h.trim());
        const data = rows
          .filter(row => row.length > 0)
          .map(row => {
            const values = row.split(',').map(v => v.trim());
            return headerArray.reduce((obj, header, i) => {
              obj[header] = values[i];
              return obj;
            }, {} as any);
          });
        setPreview(data.slice(0, 5));
      };
      reader.readAsText(file);
    }
  };

  const handleImport = async () => {
    if (!file) return;

    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append('file', file);

      await importTenantsFromCSV(formData);

      toast({
        title: "Success",
        description: "Tenants have been imported successfully.",
      });
      router.refresh();
      setFile(null);
      setPreview([]);
    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: "Error",
        description: "Failed to import tenants. Please check your CSV file and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const downloadTemplate = () => {
    const headers = [
      "bpCode",
      "firstName",
      "lastName",
      "email",
      "phone",
      "company",
      "status",
      "emergencyContactName",
      "emergencyContactPhone"
    ].join(',');
    
    const blob = new Blob([headers], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tenant-import-template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardContent className="pt-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-lg font-medium">Import Tenants from CSV</h3>
            <p className="text-sm text-muted-foreground">
              Upload a CSV file containing tenant details for bulk import.
            </p>
          </div>
          <Button variant="outline" onClick={downloadTemplate}>
            <Download className="w-4 h-4 mr-2" />
            Download Template
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <Input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="flex-1"
          />
          <Button 
            onClick={handleImport} 
            disabled={!file || isLoading}
          >
            <Upload className="w-4 h-4 mr-2" />
            {isLoading ? "Importing..." : "Import"}
          </Button>
        </div>

        {preview.length > 0 && (
          <div className="space-y-4">
            <Alert>
              <AlertTitle>Preview</AlertTitle>
              <AlertDescription>
                Showing first 5 rows of the CSV file
              </AlertDescription>
            </Alert>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    {Object.keys(preview[0]).map((header) => (
                      <TableHead key={header}>{header}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {preview.map((row, i) => (
                    <TableRow key={i}>
                      {Object.values(row).map((value, j) => (
                        <TableCell key={j}>{value as React.ReactNode}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}