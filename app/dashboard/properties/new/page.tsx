import { PropertyForm } from "../components/property-form";

export const revalidate = 0;

export default function NewPropertyPage() {
  return (
    <div className="h-full flex-1 flex flex-col space-y-8 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Add New Property</h2>
          <p className="text-muted-foreground">
            Create a new property or import multiple properties via CSV
          </p>
        </div>
      </div>
      <PropertyForm />
    </div>
  );
}