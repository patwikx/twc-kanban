import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PropertyReportsList } from "../lists/property-reports-list"
import { getPropertyReports } from "@/actions/reports"


export async function PropertyReports() {
  const reports = await getPropertyReports()
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Property Reports</CardTitle>
        <CardDescription>
          Comprehensive reports on property performance, occupancy, and maintenance
        </CardDescription>
      </CardHeader>
      <CardContent>
        <PropertyReportsList reports={reports} />
      </CardContent>
    </Card>
  )
}