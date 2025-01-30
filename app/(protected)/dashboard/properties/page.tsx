import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Download, Building2 } from "lucide-react";
import Link from "next/link";
import { getProperties } from "@/lib/data/properties";
import { PropertyListSkeleton } from "./components/property-list-skeleton";
import { PropertyList } from "./components/property-list";

export const revalidate = 0;

export default async function PropertiesPage() {
  const properties = await getProperties();

  return (
    <div className="h-full flex-1 flex flex-col space-y-8 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Properties</h2>
          <p className="text-muted-foreground">
            Manage and monitor all your properties in one place
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button asChild>
            <Link href="/dashboard/properties/new">
              <Building2 className="mr-2 h-4 w-4" />
              Add Property
            </Link>
          </Button>
        </div>
      </div>

      <Suspense fallback={<PropertyListSkeleton />}>
        <PropertyList initialProperties={properties} />
      </Suspense>
    </div>
  );
}