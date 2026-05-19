import {
  Card,
  CardContent,
} from "@/components/ui/card";

function ShippingError() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">

      <Card className="w-full max-w-md border-red-200">

        <CardContent className="py-10 text-center space-y-2">

          <p className="text-lg font-semibold text-red-500">
            Error al cargar registros
          </p>

          <p className="text-sm text-muted-foreground">
            Ocurrió un problema obteniendo la información.
          </p>

        </CardContent>

      </Card>

    </div>
  );
}

export default ShippingError;