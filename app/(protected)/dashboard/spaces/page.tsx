
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { UnitStats } from "./components/units-stats";
import { UnitsTableSkeleton } from "./components/units-loading";
import { UnitsDataTable } from "./components/units-table";
import Link from "next/link";


export default function UnitsPage() {


  return (
    <div className="h-full flex-1 flex flex-col space-y-8 p-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Spaces Management</h1>
          <p className="text-muted-foreground">
            Manage and monitor all your property spaces in one place
          </p>
        </div>
      </div>

      <Suspense fallback={<div className="space-y-4">Loading statistics...</div>}>
        <UnitStats />
      </Suspense>

      <Suspense fallback={<UnitsTableSkeleton />}>
        <UnitsDataTable />
      </Suspense>
    </div>
  );
}