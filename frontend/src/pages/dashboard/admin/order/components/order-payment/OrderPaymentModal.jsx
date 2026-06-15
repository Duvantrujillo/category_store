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

const getPaymentStatusLabel = (
  status
) => {
  switch (status) {
    case "APPROVED":
      return "Aprobado";

    case "PENDING":
      return "Pendiente";

    case "DECLINED":
      return "Rechazado";

    case "ERROR":
      return "Error";

    case "VOIDED":
      return "Anulado";

    default:
      return status;
  }
};

const getPaymentBadgeClass = (
  status
) => {
  switch (status) {
    case "APPROVED":
      return "bg-green-100 text-green-700 border-green-200";

    case "PENDING":
      return "bg-yellow-100 text-yellow-700 border-yellow-200";

    case "DECLINED":
      return "bg-red-100 text-red-700 border-red-200";

    case "ERROR":
      return "bg-red-100 text-red-700 border-red-200";

    case "VOIDED":
      return "bg-slate-100 text-slate-700 border-slate-200";

    default:
      return "";
  }
};

function OrderPaymentModal({
  open,
  order,
  onClose,
}) {
  if (!order) return null;

  const payment = order.payment;

  return (
    <Dialog
      open={open}
      onOpenChange={onClose}
    >
      <DialogContent className="sm:max-w-6xl">

        <DialogHeader>

          <div className="flex items-center justify-between">

            <div>

              <DialogTitle>
                Información del Pago
              </DialogTitle>

              <DialogDescription>
                Orden {order.orderNumber}
              </DialogDescription>

            </div>

            {payment && (
              <Badge
                variant="outline"
                className={getPaymentBadgeClass(
                  payment.status
                )}
              >
                {getPaymentStatusLabel(
                  payment.status
                )}
              </Badge>
            )}

          </div>

        </DialogHeader>

        {!payment ? (
          <Card>

            <CardContent className="py-10 text-center text-muted-foreground">

              Esta orden no tiene información de pago.

            </CardContent>

          </Card>
        ) : (
          <>
            {/* RESUMEN */}

            <div className="grid gap-4 md:grid-cols-3">

              <Card>

                <CardContent className="pt-6">

                  <p className="text-sm text-muted-foreground">
                    Monto
                  </p>

                  <p className="text-3xl font-bold">

                    $
                    {Number(
                      payment.amount
                    ).toLocaleString(
                      "es-CO"
                    )}

                  </p>

                  <p className="text-xs text-muted-foreground">
                    {payment.currency}
                  </p>

                </CardContent>

              </Card>

              <Card>

                <CardContent className="pt-6">

                  <p className="text-sm text-muted-foreground">
                    Proveedor
                  </p>

                  <p className="text-2xl font-bold">
                    {payment.provider}
                  </p>

                </CardContent>

              </Card>

              <Card>

                <CardContent className="pt-6">

                  <p className="text-sm text-muted-foreground">
                    Método de pago
                  </p>

                  <p className="text-2xl font-bold">
                    {payment.paymentMethod ||
                      "N/A"}
                  </p>

                </CardContent>

              </Card>

            </div>

            {/* DETALLES */}

            <div className="grid gap-4 md:grid-cols-2">

              <Card>

                <CardHeader>

                  <CardTitle>
                    Información General
                  </CardTitle>

                </CardHeader>

                <CardContent className="space-y-3">

                  <p>
                    <strong>
                      Proveedor:
                    </strong>{" "}
                    {payment.provider}
                  </p>

                  <p>
                    <strong>
                      Estado:
                    </strong>{" "}
                    {getPaymentStatusLabel(
                      payment.status
                    )}
                  </p>

                  <p>
                    <strong>
                      Método:
                    </strong>{" "}
                    {payment.paymentMethod ||
                      "N/A"}
                  </p>

                  <p>
                    <strong>
                      Moneda:
                    </strong>{" "}
                    {payment.currency}
                  </p>

                </CardContent>

              </Card>

              <Card>

                <CardHeader>

                  <CardTitle>
                    Referencias
                  </CardTitle>

                </CardHeader>

                <CardContent className="space-y-4">

                  <div>

                    <p className="font-medium mb-2">
                      Referencia
                    </p>

                    <div className="rounded-md border bg-muted p-3 text-sm break-all font-mono">

                      {payment.reference}

                    </div>

                  </div>

                  <div>

                    <p className="font-medium mb-2">
                      Transaction ID
                    </p>

                    <div className="rounded-md border bg-muted p-3 text-sm break-all font-mono">

                      {payment.transactionId ||
                        "N/A"}

                    </div>

                  </div>

                </CardContent>

              </Card>

              <Card>

                <CardHeader>

                  <CardTitle>
                    Fechas
                  </CardTitle>

                </CardHeader>

                <CardContent className="space-y-3">

                  <div>

                    <p className="font-medium">
                      Creado
                    </p>

                    <p className="text-muted-foreground">
                      {new Date(
                        payment.createdAt
                      ).toLocaleString(
                        "es-CO"
                      )}
                    </p>

                  </div>

                  <div>

                    <p className="font-medium">
                      Actualizado
                    </p>

                    <p className="text-muted-foreground">
                      {new Date(
                        payment.updatedAt
                      ).toLocaleString(
                        "es-CO"
                      )}
                    </p>

                  </div>

                </CardContent>

              </Card>

              <Card className="border-primary">

                <CardHeader>

                  <CardTitle>
                    Resumen Financiero
                  </CardTitle>

                </CardHeader>

                <CardContent>

                  <p className="text-4xl font-bold">

                    $
                    {Number(
                      payment.amount
                    ).toLocaleString(
                      "es-CO"
                    )}

                  </p>

                  <p className="text-muted-foreground mt-2">
                    {payment.currency}
                  </p>

                </CardContent>

              </Card>

            </div>
          </>
        )}

        <div className="flex justify-end">

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

export default OrderPaymentModal;