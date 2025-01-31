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
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"
import {
  BuildingIcon,
  DownloadIcon,
  FileIcon,
  HomeIcon,
  LayersIcon,
  ReceiptIcon,
  UsersIcon,
  WrenchIcon,
} from "lucide-react"
import { exportToCSV } from "@/lib/export"

const EXPORTABLE_SECTIONS = {
  propertyDetails: {
    label: "Property Details",
    icon: <BuildingIcon className="h-4 w-4" />,
    fields: {
      propertyCode: "Property Code",
      propertyName: "Property Name",
      titleNo: "Title No",
      lotNo: "Lot No",
      registeredOwner: "Registered Owner",
      leasableArea: "Leasable Area",
      address: "Address",
      propertyType: "Property Type",
      totalUnits: "Total Units",
    },
  },
  units: {
    label: "Units",
    icon: <HomeIcon className="h-4 w-4" />,
    fields: {
      unitDetails: "Unit Details",
      leases: "Lease Information",
      maintenance: "Maintenance History",
    },
  },
  financial: {
    label: "Financial",
    icon: <ReceiptIcon className="h-4 w-4" />,
    fields: {
      propertyTaxes: "Property Taxes",
      utilityBills: "Utility Bills",
      revenue: "Revenue",
    },
  },
  documents: {
    label: "Documents",
    icon: <FileIcon className="h-4 w-4" />,
    fields: {
      propertyDocs: "Property Documents",
      unitDocs: "Unit Documents",
    },
  },
} as const

interface PropertyReportsListProps {
  reports: any[] // Replace with proper type from your reports.ts
}

export function PropertyReportsList({ reports }: PropertyReportsListProps) {
  const [selectedSections, setSelectedSections] = useState<Set<string>>(new Set())
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())

  const handleExportCSV = () => {
    const selectedData = reports.map(report => {
      const filteredReport: Record<string, any> = {}
      
      Object.entries(EXPORTABLE_SECTIONS).forEach(([sectionKey, section]) => {
        if (selectedSections.has(sectionKey)) {
          Object.entries(section.fields).forEach(([fieldKey, fieldLabel]) => {
            if (report[fieldKey]) {
              filteredReport[fieldLabel] = report[fieldKey]
            }
          })
        }
      })
      
      return filteredReport
    })
    
    exportToCSV(selectedData, "property-reports")
  }

  const toggleSection = (section: string) => {
    const newSections = new Set(selectedSections)
    if (newSections.has(section)) {
      newSections.delete(section)
    } else {
      newSections.add(section)
    }
    setSelectedSections(newSections)
  }

  const toggleExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId)
    } else {
      newExpanded.add(itemId)
    }
    setExpandedItems(newExpanded)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-6">
          {Object.entries(EXPORTABLE_SECTIONS).map(([key, section]) => (
            <div key={key} className="flex items-center space-x-2">
              <Checkbox
                id={key}
                checked={selectedSections.has(key)}
                onCheckedChange={() => toggleSection(key)}
              />
              <label
                htmlFor={key}
                className="flex items-center space-x-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {section.icon}
                <span>{section.label}</span>
              </label>
            </div>
          ))}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <DownloadIcon className="mr-2 h-4 w-4" />
              Export Selected
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

      <ScrollArea className="h-[600px] rounded-md border">
        <div className="space-y-4 p-4">
          {reports.map((property) => (
            <Card key={property.id} className="overflow-hidden">
              <Accordion
                type="single"
                collapsible
                value={expandedItems.has(property.id) ? property.id : ""}
                onValueChange={() => toggleExpanded(property.id)}
              >
                <AccordionItem value={property.id} className="border-none">
                  <AccordionTrigger className="px-6 py-4 hover:no-underline">
                    <div className="flex items-center space-x-4">
                      <BuildingIcon className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <h3 className="text-lg font-semibold">{property.propertyName}</h3>
                        <p className="text-sm text-muted-foreground">
                          {property.propertyCode} • {property.address}
                        </p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <CardContent className="grid gap-6">
                      {/* Property Details */}
                      <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <BuildingIcon className="h-5 w-5 text-muted-foreground" />
                          <h4 className="text-lg font-semibold">Property Details</h4>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Title No</p>
                            <p>{property.titleNo}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Lot No</p>
                            <p>{property.lotNo}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Registered Owner</p>
                            <p>{property.registeredOwner}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Leasable Area</p>
                            <p>{property.leasableArea} sqm</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Property Type</p>
                            <Badge variant="outline">{property.propertyType}</Badge>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Total Spaces</p>
                            <p>{property.totalUnits}</p>
                          </div>
                        </div>
                      </div>

                      {/* Units Summary */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <LayersIcon className="h-5 w-5 text-muted-foreground" />
                            <h4 className="text-lg font-semibold">Spaces</h4>
                          </div>
                          <Badge variant="secondary">
                            {property.units.length} Spaces
                          </Badge>
                        </div>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Space Number</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead className="text-right">Area</TableHead>
                              <TableHead className="text-right">Rate</TableHead>
                              <TableHead className="text-right">Rent Amount</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {property.units.map((unit: any) => (
                              <TableRow key={unit.unitNumber}>
                                <TableCell className="font-medium">{unit.unitNumber}</TableCell>
                                <TableCell>
                                  <Badge variant={unit.status === 'OCCUPIED' ? 'default' : 'secondary'}>
                                    {unit.status}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right">{unit.unitArea} sqm</TableCell>
                                <TableCell className="text-right">₱{unit.unitRate}</TableCell>
                                <TableCell className="text-right">₱{unit.rentAmount}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>

                      {/* Financial Summary */}
                      <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <ReceiptIcon className="h-5 w-5 text-muted-foreground" />
                          <h4 className="text-lg font-semibold">Financial Summary</h4>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                          <Card>
                            <CardContent className="pt-6">
                              <div className="text-2xl font-bold">
                              ₱{property.totalPropertyTaxes}
                              </div>
                              <p className="text-xs text-muted-foreground">
                                Total Property Taxes
                              </p>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className="pt-6">
                              <div className="text-2xl font-bold">
                              ₱{property.totalUtilityBills}
                              </div>
                              <p className="text-xs text-muted-foreground">
                                Total Utility Bills
                              </p>
                            </CardContent>
                          </Card>
                        </div>
                      </div>

                      {/* Maintenance Summary */}
                      <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <WrenchIcon className="h-5 w-5 text-muted-foreground" />
                          <h4 className="text-lg font-semibold">Maintenance Summary</h4>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                          {property.units.map((unit: any) => (
                            unit.maintenanceRequests.length > 0 && (
                              <Card key={unit.unitNumber}>
                                <CardContent className="pt-6">
                                  <h5 className="font-semibold">Unit {unit.unitNumber}</h5>
                                  <div className="mt-2 space-y-1">
                                    {unit.maintenanceRequests.map((request: any, index: number) => (
                                      <div key={index} className="flex items-center justify-between text-sm">
                                        <Badge variant={
                                          request.status === 'COMPLETED' ? 'default' :
                                          request.status === 'IN_PROGRESS' ? 'secondary' :
                                          'outline'
                                        }>
                                          {request.status}
                                        </Badge>
                                        <span className="text-muted-foreground">
                                          {request.category}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </CardContent>
                              </Card>
                            )
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}