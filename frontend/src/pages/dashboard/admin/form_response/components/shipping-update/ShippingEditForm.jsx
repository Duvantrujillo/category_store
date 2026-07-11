import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import DepartmentSelect from "../shipping-form/DepartmentSelect";
import MunicipalitySelect from "../shipping-form/MunicipalitySelect";

export default function ShippingEditForm({
  form,
  handleChange,
  loading,
  onCancel,
  onSubmit,
  departments = [],
  municipalities = [],
  selectedDepartment = "",
  setSelectedDepartment,
}) {
  const [attempted, setAttempted] = useState(false);

  // Mismas reglas que valida el backend (form.controller.js).
  const getErrors = () => {
    const errors = {};
    if (!(form.firstName || "").trim()) errors.firstName = "El nombre es obligatorio";
    if (!(form.lastName || "").trim()) errors.lastName = "El apellido es obligatorio";

    const documentNumber = (form.documentNumber || "").trim();
    if (!documentNumber) errors.documentNumber = "El documento es obligatorio";
    else if (isNaN(Number(documentNumber)) || documentNumber.length < 4 || documentNumber.length > 10) {
      errors.documentNumber = "Documento inválido (4-10 dígitos)";
    }

    const phoneNumber = (form.phoneNumber || "").trim();
    if (!phoneNumber) errors.phoneNumber = "El teléfono es obligatorio";
    else if (isNaN(Number(phoneNumber)) || phoneNumber.length < 7 || phoneNumber.length > 10) {
      errors.phoneNumber = "Teléfono inválido (7-10 dígitos)";
    }

    if (!(form.departament || "").trim()) errors.departament = "Selecciona un departamento";
    if (!(form.municipality || "").trim()) errors.municipality = "Selecciona un municipio";
    if (!(form.address || "").trim()) errors.address = "La dirección es obligatoria";

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

      {/* Nombre y Apellido */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Nombre <span className="text-red-400">*</span></Label>
          <Input
            value={form.firstName || ""}
            onChange={(e) => handleChange("firstName", e.target.value)}
            aria-invalid={!!errors.firstName}
          />
          {errors.firstName && <p className="text-xs text-destructive">{errors.firstName}</p>}
        </div>
        <div>
          <Label>Apellido <span className="text-red-400">*</span></Label>
          <Input
            value={form.lastName || ""}
            onChange={(e) => handleChange("lastName", e.target.value)}
            aria-invalid={!!errors.lastName}
          />
          {errors.lastName && <p className="text-xs text-destructive">{errors.lastName}</p>}
        </div>
      </div>

      {/* Documento */}
      <div>
        <Label>Documento <span className="text-red-400">*</span></Label>
        <Input
          value={form.documentNumber || ""}
          onChange={(e) => handleChange("documentNumber", e.target.value)}
          aria-invalid={!!errors.documentNumber}
        />
        {errors.documentNumber && <p className="text-xs text-destructive">{errors.documentNumber}</p>}
      </div>

      {/* Teléfono */}
      <div>
        <Label>Teléfono <span className="text-red-400">*</span></Label>
        <Input
          value={form.phoneNumber || ""}
          onChange={(e) => handleChange("phoneNumber", e.target.value)}
          aria-invalid={!!errors.phoneNumber}
        />
        {errors.phoneNumber && <p className="text-xs text-destructive">{errors.phoneNumber}</p>}
      </div>

      <div>
        <DepartmentSelect
          departments={departments}
          selectedDepartment={selectedDepartment}
          setSelectedDepartment={(dep) => {
            setSelectedDepartment(dep);
            handleChange("municipality", "");
          }}
          handleChange={handleChange}
          invalid={!!errors.departament}
        />
        {errors.departament && <p className="text-xs text-destructive mt-1">{errors.departament}</p>}
      </div>

      <div>
        <MunicipalitySelect
          municipalities={municipalities}
          selectedDepartment={selectedDepartment}
          value={form.municipality || ""}
          handleChange={handleChange}
          invalid={!!errors.municipality}
        />
        {errors.municipality && <p className="text-xs text-destructive mt-1">{errors.municipality}</p>}
      </div>

      {/* Dirección */}
      <div>
        <Label>Dirección <span className="text-red-400">*</span></Label>
        <Input
          value={form.address || ""}
          onChange={(e) => handleChange("address", e.target.value)}
          aria-invalid={!!errors.address}
        />
        {errors.address && <p className="text-xs text-destructive">{errors.address}</p>}
      </div>

      {/* Detalles adicionales */}
      <div>
        <Label>
          Detalles adicionales{" "}
          <span className="text-muted-foreground font-normal normal-case">(opcional)</span>
        </Label>
        <Textarea
          value={form.additionalDetails || ""}
          onChange={(e) => handleChange("additionalDetails", e.target.value)}
        />
      </div>

      {/* Botones */}
      <div className="flex justify-end gap-2 mt-4">
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? "Guardando..." : "Guardar cambios"}
        </Button>
      </div>
    </div>
  );
}