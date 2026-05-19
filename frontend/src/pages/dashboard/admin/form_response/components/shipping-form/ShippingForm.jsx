import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import DepartmentSelect from "./DepartmentSelect";
import MunicipalitySelect from "./MunicipalitySelect";

function ShippingForm({
  form,
  handleChange,
  handleSubmit,
  loading,
  loadingCol,
  departments,
  municipalities,
  selectedDepartment,
  setSelectedDepartment,
}) {
  return (
    <div className="flex items-center justify-center min-h-screen p-4">

      <Card className="w-full max-w-xl rounded-2xl shadow-sm">

        <CardHeader>

          <CardTitle className="text-2xl">
            Registrar envío
          </CardTitle>

        </CardHeader>

        <CardContent>

          <form
            onSubmit={handleSubmit}
            className="space-y-4"
          >

            {/* Nombre */}
            <div className="space-y-2">

              <Label>
                Nombre
              </Label>

              <Input
                value={form.firstName || ""}
                onChange={(e) =>
                  handleChange("firstName", e.target.value)
                }
              />

            </div>

            {/* Apellido */}
            <div className="space-y-2">

              <Label>
                Apellido
              </Label>

              <Input
                value={form.lastName || ""}
                onChange={(e) =>
                  handleChange("lastName", e.target.value)
                }
              />

            </div>

            {/* Documento */}
            <div className="space-y-2">

              <Label>
                Número de documento
              </Label>

              <Input
                value={form.documentNumber || ""}
                placeholder="Ej: 123456789"
                onChange={(e) =>
                  handleChange(
                    "documentNumber",
                    e.target.value
                  )
                }
              />

            </div>

            {/* Teléfono */}
            <div className="space-y-2">

              <Label>
                Teléfono
              </Label>

              <Input
                type="tel"
                value={form.phoneNumber || ""}
                placeholder="Ej: 3001234567"
                onChange={(e) =>
                  handleChange(
                    "phoneNumber",
                    e.target.value
                  )
                }
              />

            </div>

            <DepartmentSelect
              departments={departments}
              selectedDepartment={selectedDepartment}
              setSelectedDepartment={setSelectedDepartment}
              handleChange={handleChange}
            />

            <MunicipalitySelect
              municipalities={municipalities}
              selectedDepartment={selectedDepartment}
              value={form.municipality}
              handleChange={handleChange}
            />

            {/* Dirección */}
            <div className="space-y-2">

              <Label>
                Dirección
              </Label>

              <Input
                value={form.address || ""}
                onChange={(e) =>
                  handleChange(
                    "address",
                    e.target.value
                  )
                }
              />

            </div>

            {/* Detalles */}
            <div className="space-y-2">

              <Label>
                Detalles adicionales
              </Label>

              <Textarea
                value={form.additionalDetails || ""}
                placeholder="Escribe aquí cualquier detalle adicional..."
                onChange={(e) =>
                  handleChange(
                    "additionalDetails",
                    e.target.value
                  )
                }
              />

            </div>

            <button
              type="submit"
              disabled={loading || loadingCol}
              className="w-full rounded-md bg-black text-white py-2 hover:bg-gray-800 disabled:opacity-50"
            >
              {loading || loadingCol
                ? "Cargando..."
                : "Enviar"}
            </button>

          </form>

        </CardContent>

      </Card>

    </div>
  );
}

export default ShippingForm;