
import { getProperties } from "@/lib/data/properties";
import { CreateUnitForm } from "../components/create-unit-form";

export const metadata = {
  title: "Create New Unit",
  description: "Add a new unit to your property portfolio",
};

export default async function CreateUnitPage() {
  const properties = await getProperties();

  return (
    <div className="container mx-auto py-6">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create New Unit</h1>
          <p className="text-muted-foreground">
            Add a new unit to your property portfolio
          </p>
        </div>
        <CreateUnitForm properties={properties} />
      </div>
    </div>
  );
}