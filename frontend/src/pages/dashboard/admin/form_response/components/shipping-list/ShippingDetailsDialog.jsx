import { Label } from "@/components/ui/label";
import { Eye } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  Card,
  CardContent,
} from "@/components/ui/card";


import {
  Phone,
  MapPin,
  FileText,
  User,
} from "lucide-react";

function ShippingDetailsDialog({ item }) {
  return (
    <Dialog>

      <DialogTrigger asChild>
        <button
          className="inline-flex items-center justify-center rounded-md border border-green-600 px-3 py-2 text-green-600 hover:bg-green-600 hover:text-white transition"
        >
          <Eye className="w-4 h-4" />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl rounded-2xl">

        <DialogHeader>

          <DialogTitle className="text-2xl">
            Información del Cliente
          </DialogTitle>

          <DialogDescription>
            Información completa del envío registrado.
          </DialogDescription>

        </DialogHeader>

        <div className="max-h-[70vh] overflow-y-auto pr-2">

          <div className="grid gap-4 md:grid-cols-2">

            {/* Nombre */}
            <Card className="rounded-xl">

              <CardContent className="p-4 space-y-2">

                <div className="flex items-center gap-2">

                  <User className="h-4 w-4" />

                  <Label>
                    Nombre completo
                  </Label>

                </div>

                <p className="text-sm text-muted-foreground">
                  {item.firstName} {item.lastName}
                </p>

              </CardContent>

            </Card>

            {/* Documento */}
            <Card className="rounded-xl">

              <CardContent className="p-4 space-y-2">

                <div className="flex items-center gap-2">

                  <FileText className="h-4 w-4" />

                  <Label>
                    Documento
                  </Label>

                </div>

                <p className="text-sm text-muted-foreground">
                  {item.documentNumber}
                </p>

              </CardContent>

            </Card>

            {/* Teléfono */}
            <Card className="rounded-xl">

              <CardContent className="p-4 space-y-2">

                <div className="flex items-center gap-2">

                  <Phone className="h-4 w-4" />

                  <Label>
                    Teléfono
                  </Label>

                </div>

                <p className="text-sm text-muted-foreground">
                  {item.phoneNumber}
                </p>

              </CardContent>

            </Card>

            {/* Ubicación */}
            <Card className="rounded-xl">

              <CardContent className="p-4 space-y-2">

                <div className="flex items-center gap-2">

                  <MapPin className="h-4 w-4" />

                  <Label>
                    Ubicación
                  </Label>

                </div>

                <div className="text-sm text-muted-foreground space-y-1">

                  <p>
                    Departamento: {item.departament}
                  </p>

                  <p>
                    Municipio: {item.municipality}
                  </p>

                </div>

              </CardContent>

            </Card>

          </div>

          {/* Dirección */}
          <Card className="rounded-xl mt-4">

            <CardContent className="p-4 space-y-2">

              <Label>
                Dirección
              </Label>

              <p className="text-sm text-muted-foreground">
                {item.address}
              </p>

            </CardContent>

          </Card>

          {/* Detalles */}
          <Card className="rounded-xl mt-4">

            <CardContent className="p-4 space-y-2">

              <Label>
                Detalles adicionales
              </Label>

              <p className="text-sm text-muted-foreground whitespace-pre-wrap wrap-break-word">
                {item.additionalDetails || "Sin detalles adicionales"}
              </p>

            </CardContent>

          </Card>

        </div>

      </DialogContent>

    </Dialog>


  );

}

export default ShippingDetailsDialog;