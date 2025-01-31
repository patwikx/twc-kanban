import { Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FinancialReportsList } from "../lists/financial-reports-list"
import { DollarSignIcon } from "lucide-react"
import { getFinancialReports } from "@/actions/reports"

export async function FinancialReports() {
  const reports = await getFinancialReports()
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-3">
          <div className="rounded-lg bg-primary/10 p-2">
            <DollarSignIcon className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle>Financial Reports</CardTitle>
            <CardDescription>
              Comprehensive financial overview including revenue streams, operational expenses, tax obligations, and utility costs
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Suspense fallback={<div>Loading financial data...</div>}>
          <FinancialReportsList reports={reports} />
        </Suspense>
      </CardContent>
    </Card>
  )
}