import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function ShippingStats({ total }) {
  return (
    <div className="grid gap-4 md:grid-cols-3">

      <Card className="rounded-2xl shadow-sm">

        <CardHeader className="pb-2">

          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total de registros
          </CardTitle>

        </CardHeader>

        <CardContent>

          <div className="text-3xl font-bold">
            {total}
          </div>

        </CardContent>

      </Card>

    </div>
  );
}

export default ShippingStats;