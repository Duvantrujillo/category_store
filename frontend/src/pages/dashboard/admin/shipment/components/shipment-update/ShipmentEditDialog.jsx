import { useEffect, useRef, useState } from "react";

import { CalendarIcon, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useUpdateShipment } from "../../hooks/useShipment";

const STATUS_ORDER = ["CREATED", "PREPARING", "SHIPPED", "DELIVERED", "RETURNED"];

const STATUS_OPTIONS = [
  { value: "CREATED",   label: "Creado" },
  { value: "PREPARING", label: "Preparando" },
  { value: "SHIPPED",   label: "Enviado" },
  { value: "DELIVERED", label: "Entregado" },
  { value: "RETURNED",  label: "Devuelto" },
];

const CARRIER_OPTIONS = [
  { value: "SERVIENTREGA",    label: "Servientrega" },
  { value: "INTERRAPIDISIMO", label: "Interrapidísimo" },
  { value: "COORDINADORA",    label: "Coordinadora" },
  { value: "ENVIA",           label: "Envía" },
];

/* Convierte "YYYY-MM-DD" → Date local sin drift de zona horaria */
function strToDate(str) {
  if (!str) return undefined;
  const [y, m, d] = str.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/* Convierte Date → "YYYY-MM-DD" */
function dateToStr(date) {
  if (!date) return "";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function DatePickerField({ label, value, onClear, isActive, onOpen }) {
  const selected = strToDate(value);

  const display = selected
    ? selected.toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" })
    : "Seleccionar fecha";

  return (
    <div className="flex flex-col gap-1.5">
      <Label>{label}</Label>
      <button
        type="button"
        onClick={onOpen}
        className={`
          flex items-center justify-between gap-2 w-full px-3 py-2 rounded-lg border text-sm
          transition-colors text-left bg-white
          ${isActive
            ? "border-indigo-400 ring-2 ring-indigo-100"
            : "border-input hover:border-slate-300"}
          ${selected ? "text-slate-800" : "text-slate-400"}
        `}
      >
        <span className="flex items-center gap-2">
          <CalendarIcon size={14} className="text-slate-400 shrink-0" />
          {display}
        </span>
        {selected && (
          <span
            role="button"
            onClick={(e) => { e.stopPropagation(); onClear(); }}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={13} />
          </span>
        )}
      </button>
    </div>
  );
}

export default function ShipmentEditDialog({ shipment, open, onClose, onRefresh }) {
  const { form, handleChange, setInitialData, submitUpdate, loading } = useUpdateShipment();

  const hasInitialized = useRef(false);
  const calendarRef    = useRef(null);

  /* Campo activo del picker: null | 'shippedAt' | 'deliveredAt' */
  const [activePicker, setActivePicker] = useState(null);

  useEffect(() => {
    if (open && shipment && !hasInitialized.current) {
      setInitialData(shipment);
      hasInitialized.current = true;
    }
    if (!open) {
      hasInitialized.current = false;
      setActivePicker(null);
    }
  }, [open, shipment, setInitialData]);

  /* Cierra el picker al hacer click fuera del calendario */
  useEffect(() => {
    if (!activePicker) return;
    const handler = (e) => {
      if (calendarRef.current && !calendarRef.current.contains(e.target)) {
        setActivePicker(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [activePicker]);

  const handleSubmit = async () => {
    try {
      await submitUpdate(shipment.id);
      onRefresh?.();
      onClose();
    } catch { /* el hook ya muestra el toast */ }
  };

  const handleDateSelect = (date) => {
    handleChange(activePicker, dateToStr(date));
    setActivePicker(null);
  };

  const showShippedAt   = form.status === "SHIPPED"   || form.status === "DELIVERED";
  const showDeliveredAt = form.status === "DELIVERED";

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg rounded-2xl">

        <DialogHeader>
          <DialogTitle>Editar envío</DialogTitle>
          <DialogDescription>
            {shipment?.order?.orderNumber
              ? `Pedido ${shipment.order.orderNumber}`
              : `Envío #${shipment?.id}`}
          </DialogDescription>
        </DialogHeader>

        {/* Área del formulario — relative para contener el overlay */}
        <div className="relative flex flex-col gap-4 pt-2">

          {/* ESTADO */}
          {(() => {
            const currentIdx = STATUS_ORDER.indexOf(shipment?.status ?? "");
            return (
              <div className="flex flex-col gap-1.5">
                <Label>Estado</Label>
                <Select value={form.status} onValueChange={(val) => handleChange("status", val)}>
                  <SelectTrigger><SelectValue placeholder="Selecciona un estado" /></SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((opt) => {
                      const optIdx = STATUS_ORDER.indexOf(opt.value);
                      const used   = optIdx <= currentIdx;
                      return (
                        <SelectItem key={opt.value} value={opt.value} disabled={used}>
                          <span className={used ? "text-slate-400 line-through" : ""}>
                            {opt.label}
                          </span>
                          {used && (
                            <span className="ml-2 text-[10px] text-slate-400">ya registrado</span>
                          )}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            );
          })()}

          {/* TRANSPORTISTA */}
          <div className="flex flex-col gap-1.5">
            <Label>Transportista</Label>
            <Select value={form.carrier} onValueChange={(val) => handleChange("carrier", val)}>
              <SelectTrigger><SelectValue placeholder="Selecciona un transportista" /></SelectTrigger>
              <SelectContent>
                {CARRIER_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* NÚMERO DE RASTREO */}
          <div className="flex flex-col gap-1.5">
            <Label>Número de rastreo</Label>
            <Input
              placeholder="Ej: SRV123456789"
              value={form.trackingNumber}
              onChange={(e) => handleChange("trackingNumber", e.target.value)}
            />
          </div>

          {/* FECHA DE ENVÍO */}
          {showShippedAt && (
            <DatePickerField
              label="Fecha de envío"
              value={form.shippedAt}
              isActive={activePicker === "shippedAt"}
              onOpen={() => setActivePicker((p) => p === "shippedAt" ? null : "shippedAt")}
              onClear={() => handleChange("shippedAt", "")}
            />
          )}

          {/* FECHA DE ENTREGA */}
          {showDeliveredAt && (
            <DatePickerField
              label="Fecha de entrega"
              value={form.deliveredAt}
              isActive={activePicker === "deliveredAt"}
              onOpen={() => setActivePicker((p) => p === "deliveredAt" ? null : "deliveredAt")}
              onClear={() => handleChange("deliveredAt", "")}
            />
          )}

          {/* NOTA */}
          <div className="flex flex-col gap-1.5">
            <Label>Nota (opcional)</Label>
            <Input
              placeholder="Observación sobre este cambio"
              value={form.note}
              onChange={(e) => handleChange("note", e.target.value)}
            />
          </div>

          {/* ACCIONES */}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={onClose} disabled={loading}>Cancelar</Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? "Guardando..." : "Guardar cambios"}
            </Button>
          </div>

          {/* CALENDARIO OVERLAY — centrado en el formulario, arriba */}
          {activePicker && (
            <div className="absolute inset-x-0 top-0 z-50 flex justify-center pointer-events-none">
              <div
                ref={calendarRef}
                className="pointer-events-auto bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden"
              >
                <Calendar
                  mode="single"
                  selected={strToDate(form[activePicker])}
                  onSelect={handleDateSelect}
                  initialFocus
                  className="[--cell-size:1.85rem] p-3 text-xs"
                />
              </div>
            </div>
          )}

        </div>
      </DialogContent>
    </Dialog>
  );
}
