import { useState, useEffect, useRef } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ChevronDown, Check } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const STATUS_OPTIONS = [
  { value: "PENDING",   label: "Pendiente" },
  { value: "RECEIVED",  label: "Recibida" },
  { value: "APPROVED",  label: "Aprobada" },
  { value: "REJECTED",  label: "Rechazada" },
  { value: "COMPLETED", label: "Completada" },
];

const VALID_TRANSITIONS = {
  PENDING:   ["RECEIVED"],
  RECEIVED:  ["APPROVED", "REJECTED"],
  APPROVED:  ["COMPLETED"],
  REJECTED:  ["COMPLETED"],
  COMPLETED: [],
};

const RESOLUTION_OPTIONS = [
  { value: "REFUND",       label: "Reembolso" },
  { value: "EXCHANGE",     label: "Cambio" },
  { value: "STORE_CREDIT", label: "Crédito tienda" },
];

function FieldError({ message }) {
  if (!message) return null;
  return <p className="text-xs text-destructive mt-1">{message}</p>;
}

function OrderCombobox({ orders = [], value, onChange, error }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef(null);

  const selected = orders.find((o) => o.id === value);

  const filtered = orders.filter((o) =>
    o.orderNumber?.toLowerCase().includes(search.toLowerCase()) ||
    `${o.firstName ?? ""} ${o.lastName ?? ""}`.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = (order) => {
    onChange(order.id);
    setOpen(false);
    setSearch("");
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        aria-invalid={!!error}
        className={cn(
          "flex h-8 w-full items-center justify-between rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm transition-colors outline-none",
          "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
          "aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20"
        )}
      >
        <span className={cn("truncate", !selected && "text-muted-foreground")}>
          {selected
            ? `${selected.orderNumber} — ${selected.firstName} ${selected.lastName}`
            : "Selecciona una orden"}
        </span>
        <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border bg-popover text-popover-foreground shadow-md ring-1 ring-foreground/10">
          <div className="p-2 border-b">
            <Input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por número de orden..."
              className="h-7 text-sm"
            />
          </div>
          <div className="max-h-52 overflow-y-auto p-1">
            {filtered.length === 0 ? (
              <p className="px-2 py-3 text-center text-sm text-muted-foreground">
                Sin resultados
              </p>
            ) : (
              filtered.map((order) => (
                <button
                  key={order.id}
                  type="button"
                  onClick={() => handleSelect(order)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-left",
                    "hover:bg-accent hover:text-accent-foreground",
                    value === order.id && "bg-accent text-accent-foreground"
                  )}
                >
                  {value === order.id && <Check className="size-3.5 shrink-0" />}
                  <span className="font-medium">{order.orderNumber}</span>
                  <span className="text-muted-foreground">
                    — {order.firstName} {order.lastName}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function BasicInfoSection({ mode, form, handleChange, orders = [], errors = {}, currentStatus }) {
  const isCreate = mode === "create";

  const currentStatusLabel = STATUS_OPTIONS.find((o) => o.value === currentStatus)?.label ?? currentStatus;
  const nextStatusOptions   = STATUS_OPTIONS.filter((o) => (VALID_TRANSITIONS[currentStatus] ?? []).includes(o.value));

  return (
    <div className="flex flex-col gap-4">

      {/* SELECTOR DE ORDEN (solo en crear) */}
      {isCreate && (
        <div className="flex flex-col gap-1.5">
          <Label>
            Orden <span className="text-red-500">*</span>
          </Label>
          <OrderCombobox
            orders={orders}
            value={form.orderId}
            onChange={(id) => handleChange("orderId", id)}
            error={errors.orderId}
          />
          <FieldError message={errors.orderId} />
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

      {/* ESTADO – solo editable en modo editar; en crear siempre es PENDING */}
      {!isCreate && (
        <>
          {/* Estado actual (solo lectura) */}
          <div className="flex flex-col gap-1.5">
            <Label>Estado actual</Label>
            <p className="text-sm px-3 py-2 rounded-md border bg-muted text-muted-foreground">
              {currentStatusLabel}
            </p>
          </div>

          {/* Nuevo estado (solo si hay transiciones disponibles) */}
          {nextStatusOptions.length > 0 ? (
            <div className="flex flex-col gap-1.5">
              <Label>
                Cambiar estado a <span className="text-red-500">*</span>
              </Label>
              <Select
                value={nextStatusOptions.some((o) => o.value === form.status) ? form.status : ""}
                onValueChange={(val) => handleChange("status", val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el nuevo estado" />
                </SelectTrigger>
                <SelectContent>
                  {nextStatusOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              Esta solicitud ha alcanzado su estado final y no puede avanzar más.
            </p>
          )}
        </>
      )}

      {/* RESOLUCIÓN */}
      <div className="flex flex-col gap-1.5">
        <Label>
          Resolución <span className="text-red-500">*</span>
        </Label>
        {isCreate ? (
          <>
            <Select
              value={form.resolution || ""}
              onValueChange={(val) => handleChange("resolution", val)}
            >
              <SelectTrigger aria-invalid={!!errors.resolution}>
                <SelectValue placeholder="Selecciona una resolución" />
              </SelectTrigger>
              <SelectContent>
                {RESOLUTION_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError message={errors.resolution} />
          </>
        ) : (
          <p className="text-sm px-3 py-2 rounded-md border bg-muted text-muted-foreground">
            {RESOLUTION_OPTIONS.find((o) => o.value === form.resolution)?.label ?? form.resolution ?? "—"}
          </p>
        )}
      </div>

      {/* MOTIVO */}
      <div className="flex flex-col gap-1.5">
        <Label>
          Motivo <span className="text-red-500">*</span>
        </Label>
        <Textarea
          placeholder="Describe el motivo de la devolución..."
          value={form.reason || ""}
          onChange={(e) => handleChange("reason", e.target.value)}
          maxLength={300}
          rows={3}
          aria-invalid={!!errors.reason}
        />
        <div className="flex justify-between items-start">
          <FieldError message={errors.reason} />
          <span className={`text-xs ml-auto ${(form.reason?.length || 0) >= 300 ? "text-destructive font-medium" : "text-muted-foreground"}`}>
            {form.reason?.length || 0}/300
          </span>
        </div>
      </div>

    </div>
  );
}
