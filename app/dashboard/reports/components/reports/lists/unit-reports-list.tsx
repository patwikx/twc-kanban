'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { DownloadIcon, FileIcon } from "@radix-ui/react-icons"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useState } from "react"
import { exportToCSV } from "@/lib/export"

interface UnitReport {
  id: string
  unitNumber: string
  propertyName: string
  status: string
  area: number
  currentRent: number
  totalLeases: number
  maintenanceRequestsCount: number
}

interface UnitReportsListProps {
  reports: UnitReport[]
}

const EXPORTABLE_FIELDS = {
  unitNumber: "Unit Number",
  propertyName: "Property Name",
  status: "Status",
  area: "Area",
  currentRent: "Current Rent",
  totalLeases: "Total Leases",
  maintenanceRequestsCount: "Maintenance Requests",
} as const

export function UnitReportsList({ reports }: UnitReportsListProps) {
  const [selectedFields, setSelectedFields] = useState<Set<keyof typeof EXPORTABLE_FIELDS>>(
    new Set(Object.keys(EXPORTABLE_FIELDS) as (keyof typeof EXPORTABLE_FIELDS)[])
  )

  const handleExportCSV = () => {
    const selectedData = reports.map(report => {
      const filteredReport: Record<string, any> = {}
      Array.from(selectedFields).forEach(field => {
        filteredReport[EXPORTABLE_FIELDS[field]] = report[field]
      })
      return filteredReport
    })
    exportToCSV(selectedData, "unit-reports")
  }



  const toggleField = (field: keyof typeof EXPORTABLE_FIELDS) => {
    const newFields = new Set(selectedFields)
    if (newFields.has(field)) {
      newFields.delete(field)
    } else {
      newFields.add(field)
    }
    setSelectedFields(newFields)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-4">
          {Object.entries(EXPORTABLE_FIELDS).map(([key, label]) => (
            <div key={key} className="flex items-center space-x-2">
              <Checkbox
                id={key}
                checked={selectedFields.has(key as keyof typeof EXPORTABLE_FIELDS)}
                onCheckedChange={() => toggleField(key as keyof typeof EXPORTABLE_FIELDS)}
              />
              <label
                htmlFor={key}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {label}
              </label>
            </div>
          ))}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <DownloadIcon className="mr-2 h-4 w-4" />
              Export
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={handleExportCSV}>
              <FileIcon className="mr-2 h-4 w-4" />
              Export to CSV
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Unit Number</TableHead>
            <TableHead>Property Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Area</TableHead>
            <TableHead className="text-right">Current Rent</TableHead>
            <TableHead className="text-right">Total Leases</TableHead>
            <TableHead className="text-right">Maintenance Requests</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reports.map((report) => (
            <TableRow key={report.id}>
              <TableCell className="font-medium">{report.unitNumber}</TableCell>
              <TableCell>{report.propertyName}</TableCell>
              <TableCell>{report.status}</TableCell>
              <TableCell className="text-right">{report.area} sqft</TableCell>
              <TableCell className="text-right">${report.currentRent.toFixed(2)}</TableCell>
              <TableCell className="text-right">{report.totalLeases}</TableCell>
              <TableCell className="text-right">{report.maintenanceRequestsCount}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}