'use client'

import { Card } from "@/components/ui/card"
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


interface FinancialReport {
  revenue: {
    total: number
    byType: Record<string, number>
  }
  expenses: {
    taxes: number
    utilities: number
  }
  netIncome: number
}

interface FinancialReportsListProps {
  reports: FinancialReport
}

const EXPORTABLE_FIELDS = {
  totalRevenue: "Total Revenue",
  revenueByType: "Revenue by Type",
  taxes: "Total Taxes",
  utilities: "Total Utilities",
  netIncome: "Net Income",
} as const

export function FinancialReportsList({ reports }: FinancialReportsListProps) {
  const [selectedFields, setSelectedFields] = useState<Set<keyof typeof EXPORTABLE_FIELDS>>(
    new Set(Object.keys(EXPORTABLE_FIELDS) as (keyof typeof EXPORTABLE_FIELDS)[])
  )

  const handleExportCSV = () => {
    const selectedData = {
      ...(selectedFields.has("totalRevenue") && { "Total Revenue": reports.revenue.total }),
      ...(selectedFields.has("revenueByType") && { "Revenue by Type": reports.revenue.byType }),
      ...(selectedFields.has("taxes") && { "Total Taxes": reports.expenses.taxes }),
      ...(selectedFields.has("utilities") && { "Total Utilities": reports.expenses.utilities }),
      ...(selectedFields.has("netIncome") && { "Net Income": reports.netIncome }),
    }
    exportToCSV([selectedData], "financial-reports")
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
    <div className="space-y-6">
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="p-6">
          <h3 className="text-lg font-semibold">Revenue</h3>
          <p className="mt-2 text-2xl font-bold">${reports.revenue.total.toFixed(2)}</p>
          <div className="mt-4 space-y-2">
            {Object.entries(reports.revenue.byType).map(([type, amount]) => (
              <div key={type} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{type}</span>
                <span>${amount.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold">Expenses</h3>
          <div className="mt-4 space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Taxes</p>
              <p className="text-xl font-semibold">${reports.expenses.taxes.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Utilities</p>
              <p className="text-xl font-semibold">${reports.expenses.utilities.toFixed(2)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold">Net Income</h3>
          <p className="mt-2 text-2xl font-bold">${reports.netIncome.toFixed(2)}</p>
        </Card>
      </div>
    </div>
  )
}