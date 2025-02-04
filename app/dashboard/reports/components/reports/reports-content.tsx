import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PropertyReports } from "./sections/property-reports"
import { FinancialReports } from "./sections/financial-reports"
import { TenantReportsList } from "./sections/tenant-reports"
import { UnitReportsList } from "./sections/unit-reports"

export function ReportsContent() {
  return (
    <Tabs defaultValue="properties" className="space-y-4">
      <TabsList>
        <TabsTrigger value="properties">Properties</TabsTrigger>
        <TabsTrigger value="tenants">Tenants</TabsTrigger>
        <TabsTrigger value="units">Units</TabsTrigger>
        <TabsTrigger value="financial">Financial</TabsTrigger>
      </TabsList>
      <TabsContent value="properties" className="space-y-4">
        <PropertyReports />
      </TabsContent>
      <TabsContent value="tenants" className="space-y-4">
        <TenantReportsList reports={[]} />
      </TabsContent>
      <TabsContent value="units" className="space-y-4">
        <UnitReportsList reports={[]} />
      </TabsContent>
      <TabsContent value="financial" className="space-y-4">
        <FinancialReports />
      </TabsContent>
    </Tabs>
  )
}