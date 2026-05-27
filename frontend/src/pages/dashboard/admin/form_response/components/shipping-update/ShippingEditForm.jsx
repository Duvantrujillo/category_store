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
  // Filtramos los municipios según el departamento seleccionado
  

  return (
    <div className="grid gap-4">

      {/* Nombre y Apellido */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Nombre</Label>
          <Input
            value={form.firstName || ""}
            onChange={(e) => handleChange("firstName", e.target.value)}
          />
        </div>
        <div>
          <Label>Apellido</Label>
          <Input
            value={form.lastName || ""}
            onChange={(e) => handleChange("lastName", e.target.value)}
          />
        </div>
      </div>

      {/* Documento */}
      <div>
        <Label>Documento</Label>
        <Input
          value={form.documentNumber || ""}
          onChange={(e) => handleChange("documentNumber", e.target.value)}
        />
      </div>

      {/* Teléfono */}
      <div>
        <Label>Teléfono</Label>
        <Input
          value={form.phoneNumber || ""}
          onChange={(e) => handleChange("phoneNumber", e.target.value)}
        />
      </div>

      <DepartmentSelect
        departments={departments}
        selectedDepartment={selectedDepartment}
        setSelectedDepartment={(dep) => {
          setSelectedDepartment(dep);
          handleChange("municipality", "");
        }}
        handleChange={handleChange}
      />

      <MunicipalitySelect
        municipalities={municipalities}
        selectedDepartment={selectedDepartment}
        value={form.municipality || ""}
        handleChange={handleChange}
      />

      {/* Dirección */}
      <div>
        <Label>Dirección</Label>
        <Input
          value={form.address || ""}
          onChange={(e) => handleChange("address", e.target.value)}
        />
      </div>

      {/* Detalles adicionales */}
      <div>
        <Label>Detalles adicionales</Label>
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
        <Button onClick={onSubmit} disabled={loading}>
          {loading ? "Guardando..." : "Guardar cambios"}
        </Button>
      </div>
    </div>
  );
}