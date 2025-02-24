'use client'

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UnitStatus } from "@prisma/client";
import { Search, SlidersHorizontal, Download } from "lucide-react";
import { exportToCSV } from "@/lib/utils/export-to-csv";

interface DataTableToolbarProps {
  units: any[]; // Add proper type based on your unit type
}

export function DataTableToolbar({ units }: DataTableToolbarProps) {  
  const handleExportUnits = () => {
    if (!units || units.length === 0) return;

    const exportData = units.map(unit => ({
      "Space Number": unit.unitNumber,
      "Property": unit.property.propertyName,
      "Area (sqm)": unit.unitArea.toString(),
      "Rate": unit.unitRate.toString(),
      "Rent Amount": unit.rentAmount.toString(),
      "First Floor": unit.isFirstFloor ? "Yes" : "No",
      "Second Floor": unit.isSecondFloor ? "Yes" : "No",
      "Third Floor": unit.isThirdFloor ? "Yes" : "No",
      "Rooftop Floor": unit.isRoofTop ? "Yes" : "No",
      "Mezzanine": unit.isMezzanine ? "Yes" : "No",
      "Status": unit.status
    }));

    exportToCSV(exportData, `spaces_`);
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search spaces..."
            className="pl-8"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="ml-auto">
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[200px]">
            {Object.values(UnitStatus).map((status) => (
              <DropdownMenuCheckboxItem
                key={status}
                checked={true}
              >
                {status}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <Button
          variant="outline"
          onClick={handleExportUnits}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Export to CSV
        </Button>
      </div>
    </div>
  );
}