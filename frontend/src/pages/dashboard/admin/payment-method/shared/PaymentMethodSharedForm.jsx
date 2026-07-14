import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const TYPE_OPTIONS = [
  { value: "DIGITAL_WALLET", label: "Billetera digital" },
  { value: "BANK_TRANSFER",  label: "Transferencia bancaria" },
  { value: "CREDIT_CARD",    label: "Tarjeta de crédito" },
  { value: "INTERNATIONAL",  label: "Internacional" },
  { value: "CASH",           label: "Efectivo" },
];

export default function PaymentMethodSharedForm({
  mode = "create",
  form,
  handleChange,
  loading,
  onCancel,
  onSubmit,
}) {
  const isEdit = mode === "edit";
  const [attempted, setAttempted] = useState(false);

  // Mismas reglas que valida el backend (payment-method.controller.js).
  const getErrors = () => {
    const errors = {};
    const name = (form.name || "").trim();
    if (!name) errors.name = "El nombre es obligatorio";
    else if (name.length > 60) errors.name = "El nombre no puede superar 60 caracteres";
    if (!form.type) errors.type = "Selecciona un tipo";
    return errors;
  };

  const errors = attempted ? getErrors() : {};

  const handleSubmit = () => {
    if (Object.keys(getErrors()).length > 0) {
      setAttempted(true);
      return;
    }
    onSubmit();
  };

  return (
    <div className="grid gap-4">

      {/* Nombre */}
      <div className="space-y-1.5">
        <Label>Nombre <span className="text-red-400">*</span></Label>
        <Input
          value={form.name || ""}
          onChange={(e) => handleChange("name", e.target.value)}
          placeholder="Ej: Nequi, PSE, Visa..."
          maxLength={60}
          aria-invalid={!!errors.name}
        />
        {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
      </div>

      {/* Tipo */}
      <div className="space-y-1.5">
        <Label>Tipo <span className="text-red-400">*</span></Label>
        <Select value={form.type || "DIGITAL_WALLET"} onValueChange={(val) => handleChange("type", val)}>
          <SelectTrigger aria-invalid={!!errors.type}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TYPE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.type && <p className="text-xs text-destructive">{errors.type}</p>}
      </div>

      {/* Estado */}
      <div className="flex items-center justify-between rounded-lg border bg-muted/20 px-4 py-3">
        <div className="space-y-0.5">
          <Label className="text-sm font-medium">Estado</Label>
          <p className="text-xs text-muted-foreground">Se muestra en la tienda solo si está activo</p>
        </div>
        <Select
          value={form.isActive ? "true" : "false"}
          onValueChange={(val) => handleChange("isActive", val === "true")}
        >
          <SelectTrigger className="h-9 w-32 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="true"><span className="text-green-600 font-medium">Activo</span></SelectItem>
            <SelectItem value="false"><span className="text-red-600 font-medium">Inactivo</span></SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Botones */}
      <div className="flex justify-end gap-2 mt-4">
        <Button variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button onClick={handleSubmit} disabled={loading}>
          {loading
            ? isEdit ? "Guardando..." : "Creando..."
            : isEdit ? "Guardar cambios" : "Crear método de pago"}
        </Button>
      </div>

    </div>
  );
}
