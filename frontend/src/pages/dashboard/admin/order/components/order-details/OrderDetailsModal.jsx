import { Badge } from "@/components/ui/badge";

import { Button } from "@/components/ui/button";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const getStatusVariant = (status) => {
  switch (status) {
    case "PAID":
      return "default";

    case "PENDING":
      return "secondary";

    case "CANCELLED":
      return "destructive";

    case "REFUNDED":
      return "outline";

    default:
      return "secondary";
  }
};

const getStatusLabel = (status) => {
  switch (status) {
    case "PAID":
      return "Pagada";

    case "PENDING":
      return "Pendiente";

    case "CANCELLED":
      return "Cancelada";

    case "REFUNDED":
      return "Reembolsada";

    default:
      return status;
  }
};

function OrderDetailsModal({
  open,
  order,
  onClose,
}) {
  if (!order) return null;

  return (
    <Dialog
      open={open}
      onOpenChange={onClose}
    >
      <DialogContent className="sm:max-w-5xl">

        <DialogHeader>

          <div className="flex items-center justify-between">

            <div>

              <DialogTitle>
                Orden {order.orderNumber}
              </DialogTitle>

              <DialogDescription>
                Información completa del pedido.
              </DialogDescription>

            </div>

            <Badge
              variant={getStatusVariant(
                order.status
              )}
            >
              {getStatusLabel(
                order.status
              )}
            </Badge>

          </div>

        </DialogHeader>

        <div className="grid gap-4 md:grid-cols-2">

          {/* CLIENTE */}

          <Card>

            <CardHeader>

              <CardTitle>
                Cliente
              </CardTitle>

            </CardHeader>

            <CardContent className="space-y-2">

              <p>
                <strong>Nombre:</strong>{" "}
                {order.firstName}{" "}
                {order.lastName}
              </p>

              <p>
                <strong>Documento:</strong>{" "}
                {order.documentNumber}
              </p>

              <p>
                <strong>Email:</strong>{" "}
                {order.email ||
                  "Sin correo"}
              </p>

              <p>
                <strong>Teléfono:</strong>{" "}
                {order.phoneNumber}
              </p>

            </CardContent>

          </Card>

          {/* DIRECCIÓN */}

          <Card>

            <CardHeader>

              <CardTitle>
                Dirección de entrega
              </CardTitle>

            </CardHeader>

            <CardContent className="space-y-2">

              <p>
                <strong>
                  Departamento:
                </strong>{" "}
                {order.departament}
              </p>

              <p>
                <strong>
                  Municipio:
                </strong>{" "}
                {order.municipality}
              </p>

              <p>
                <strong>
                  Dirección:
                </strong>{" "}
                {order.address}
              </p>

              <p>
                <strong>
                  Detalles:
                </strong>{" "}
                {order.additionalDetails ||
                  "N/A"}
              </p>

            </CardContent>

          </Card>

          {/* RESUMEN */}

          <Card>

            <CardHeader>

              <CardTitle>
                Resumen financiero
              </CardTitle>

            </CardHeader>

            <CardContent className="space-y-2">

              <p>
                <strong>
                  Subtotal:
                </strong>{" "}
                $
                {Number(
                  order.subtotal
                ).toLocaleString(
                  "es-CO"
                )}
              </p>

              <p className="text-lg font-semibold">

                <strong>
                  Total:
                </strong>{" "}
                $
                {Number(
                  order.total
                ).toLocaleString(
                  "es-CO"
                )}

              </p>

              <p>
                <strong>
                  Moneda:
                </strong>{" "}
                {order.currency}
              </p>

            </CardContent>

          </Card>

          {/* PEDIDO */}

          <Card>

            <CardHeader>

              <CardTitle>
                Información del pedido
              </CardTitle>

            </CardHeader>

            <CardContent className="space-y-2">


              <p>
                <strong>Fecha:</strong>{" "}
                {new Date(
                  order.createdAt
                ).toLocaleString(
                  "es-CO"
                )}
              </p>

              <p>
                <strong>
                  Número:
                </strong>{" "}
                {order.orderNumber}
              </p>

            </CardContent>

          </Card>

        </div>

        <div className="flex justify-end mt-6">

          <Button
            variant="outline"
            onClick={onClose}
          >
            Cerrar
          </Button>

        </div>

      </DialogContent>
    </Dialog>
  );
}

export default OrderDetailsModal;