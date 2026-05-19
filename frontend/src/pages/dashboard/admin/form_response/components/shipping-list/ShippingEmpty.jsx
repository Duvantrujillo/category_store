import {
  Card,
  CardContent,
} from "@/components/ui/card";

function ShippingEmpty() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">

      <Card className="w-full max-w-md">

        <CardContent className="py-10 text-center space-y-2">

          <p className="text-lg font-semibold">
            No hay registros
          </p>

          <p className="text-sm text-muted-foreground">
            Aún no existen envíos registrados.
          </p>

        </CardContent>

      </Card>

    </div>
  );
}

export default ShippingEmpty;