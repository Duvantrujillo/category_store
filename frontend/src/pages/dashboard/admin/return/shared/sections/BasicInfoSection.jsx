import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const STATUS_OPTIONS = [
  { value: "PENDING",   label: "Pendiente" },
  { value: "APPROVED",  label: "Aprobada" },
  { value: "REJECTED",  label: "Rechazada" },
  { value: "RECEIVED",  label: "Recibida" },
  { value: "COMPLETED", label: "Completada" },
];

const RESOLUTION_OPTIONS = [
  { value: "REFUND",       label: "Reembolso" },
  { value: "EXCHANGE",     label: "Cambio" },
  { value: "STORE_CREDIT", label: "Crédito tienda" },
];

export default function BasicInfoSection({ mode, form, handleChange, orders = [] }) {
  const isCreate = mode === "create";

  return (
    <div className="flex flex-col gap-4">

      {/* SELECTOR DE ORDEN (solo en crear) */}
      {isCreate && (
        <div className="flex flex-col gap-1.5">
          <Label>Orden <span className="text-red-500">*</span></Label>
          <Select
            value={String(form.orderId)}
            onValueChange={(val) => handleChange("orderId", Number(val))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona una orden" />
            </SelectTrigger>
            <SelectContent>
              {orders.map((order) => (
                <SelectItem key={order.id} value={String(order.id)}>
                  {order.orderNumber} — {order.firstName} {order.lastName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* ORDEN (solo en editar, lectura) */}
      {!isCreate && form.orderNumber && (
        <div className="flex flex-col gap-1.5">
          <Label>Orden</Label>
          <p className="text-sm px-3 py-2 rounded-md border bg-muted text-muted-foreground">
            {form.orderNumber}
          </p>
        </div>
      )}

      {/* ESTADO */}
      <div className="flex flex-col gap-1.5">
        <Label>Estado</Label>
        <Select
          value={form.status}
          onValueChange={(val) => handleChange("status", val)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecciona un estado" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* RESOLUCIÓN */}
      <div className="flex flex-col gap-1.5">
        <Label>Resolución</Label>
        <Select
          value={form.resolution || ""}
          onValueChange={(val) => handleChange("resolution", val)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecciona una resolución (opcional)" />
          </SelectTrigger>
          <SelectContent>
            {RESOLUTION_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* MOTIVO */}
      <div className="flex flex-col gap-1.5">
        <Label>Motivo</Label>
        <Textarea
          placeholder="Describe el motivo de la devolución..."
          value={form.reason || ""}
          onChange={(e) => handleChange("reason", e.target.value)}
          rows={3}
        />
      </div>

    </div>
  );
}
