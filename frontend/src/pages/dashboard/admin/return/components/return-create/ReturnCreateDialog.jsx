import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import { Plus } from "lucide-react";

import ReturnSharedForm from "../../shared/ReturnSharedForm";
import { useCreateReturnRequest } from "../../hooks/useReturn";
import { allOrder } from "@/pages/dashboard/admin/order/api/orderApi";

const INITIAL_FORM = {
  orderId: "",
  status: "PENDING",
  resolution: "",
  reason: "",
  selectedItems: [],
};

function countBusinessDays(start, end) {
  let count = 0;
  const cur = new Date(start);
  cur.setHours(0, 0, 0, 0);
  const endDay = new Date(end);
  endDay.setHours(0, 0, 0, 0);
  while (cur <= endDay) {
    const d = cur.getDay();
    if (d !== 0 && d !== 6) count++;
    cur.setDate(cur.getDate() + 1);
  }
  return count;
}

export default function ReturnCreateDialog({ onRefresh, disabled = false }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);
  const [orders, setOrders] = useState([]);
  const [orderItems, setOrderItems] = useState([]);

  const { submitCreate, loading } = useCreateReturnRequest();

  /* Cargar órdenes al abrir — solo PAID dentro de 7 días hábiles con items devolvibles */
  useEffect(() => {
    if (!open) return;
    allOrder()
      .then((res) => {
        const raw = res?.orders ?? [];
        const today = new Date();
        const filtered = raw
          .filter((order) => {
            if (order.status !== "PAID") return false;
            const paymentDate = order.payment?.createdAt;
            if (!paymentDate) return false;
            return countBusinessDays(new Date(paymentDate), today) <= 7;
          })
          .map((order) => ({
            ...order,
            items: order.items
              .map((item) => {
                const returnedQty = (item.returnItems ?? []).reduce(
                  (sum, ri) => sum + ri.quantity,
                  0
                );
                return { ...item, availableQty: item.quantity - returnedQty };
              })
              .filter((item) => item.availableQty > 0),
          }))
          .filter((order) => order.items.length > 0);
        setOrders(filtered);
      })
      .catch(() => setOrders([]));
  }, [open]);

  /* Cuando cambia la orden seleccionada, actualizar los items disponibles */
  useEffect(() => {
    if (!form.orderId) {
      setOrderItems([]);
      return;
    }
    const order = orders.find((o) => o.id === form.orderId);
    setOrderItems(order?.items ?? []);
    /* limpiar selección de items al cambiar de orden */
    setForm((prev) => ({ ...prev, selectedItems: [] }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.orderId, orders]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      await submitCreate(form);
      onRefresh?.();
      setForm(INITIAL_FORM);
      setOpen(false);
    } catch {
      // toast ya lo maneja el hook
    }
  };

  const handleClose = () => {
    setOpen(false);
    setForm(INITIAL_FORM);
  };

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="gap-2 disabled:opacity-40"
        disabled={disabled}
        title={disabled ? "Sin permiso para crear devoluciones" : undefined}
      >
        <Plus className="w-4 h-4" />
        Nueva solicitud
      </Button>

      <Dialog
        open={open}
        onOpenChange={(val) => {
          if (!val) handleClose();
          else setOpen(true);
        }}
      >
        <DialogContent className="sm:max-w-2xl rounded-2xl">

          <DialogHeader>
            <DialogTitle>Crear solicitud de devolución</DialogTitle>
            <DialogDescription>
              Registra una nueva solicitud de devolución o reembolso.
            </DialogDescription>
          </DialogHeader>

          {loading ? (
            <div className="flex flex-col items-center gap-10">
              <Button variant="outline" disabled size="sm">
                <Spinner data-icon="inline-start" />
                Creando...
              </Button>
            </div>
          ) : (
            <ReturnSharedForm
              mode="create"
              form={form}
              handleChange={handleChange}
              loading={loading}
              onCancel={handleClose}
              onSubmit={handleSubmit}
              orders={orders}
              orderItems={orderItems}
            />
          )}

        </DialogContent>
      </Dialog>
    </>
  );
}
