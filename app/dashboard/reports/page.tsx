import { Metadata } from "next"
import { Suspense } from "react"
import { ReportsPageHeader } from "./components/reports/reports-header"
import { ReportsShell } from "./components/reports/reports-shell"
import { ReportsContent } from "./components/reports/reports-content"


export const metadata: Metadata = {
  title: "Reports | Property Management System",
  description: "Comprehensive reporting system for property management",
}

export default function ReportsPage() {
  return (
    <div className="flex flex-col gap-4 p-8">
      <ReportsPageHeader />
      <Suspense fallback={<ReportsShell />}>
        <ReportsContent />
      </Suspense>
    </div>
  )
}