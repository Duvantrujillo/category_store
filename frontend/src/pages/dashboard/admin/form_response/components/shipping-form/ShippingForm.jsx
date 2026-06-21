import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

import DepartmentSelect from "./DepartmentSelect";
import MunicipalitySelect from "./MunicipalitySelect";

const inputClass =
  "border-rose-200 focus-visible:ring-rose-300 focus-visible:ring-1 focus-visible:border-rose-400 bg-white placeholder:text-rose-300 text-rose-900 rounded-xl transition-all duration-200 h-11";

const labelClass =
  "text-[10px] font-semibold tracking-widest uppercase text-rose-400";

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
    <div className="flex items-center justify-center min-h-screen p-4 bg-linear-to-br from-rose-50 via-pink-50 to-fuchsia-50">

      <Card className="w-full max-w-xl rounded-3xl border border-rose-100 shadow-2xl shadow-rose-100/60 overflow-hidden">

        {/* Barra decorativa superior */}
        <div className="h-1.5 bg-linear-to-r from-rose-300 via-pink-400 to-fuchsia-300" />

        <CardHeader className="pt-8 pb-2 text-center space-y-2">

          {/* Ícono decorativo */}
          <div className="flex justify-center">
            <div className="w-14 h-14 rounded-full bg-linear-to-br from-rose-100 to-pink-100 flex items-center justify-center shadow-inner shadow-rose-200/50">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                className="w-7 h-7 text-rose-400"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"
                />
              </svg>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-light tracking-wide text-rose-900">
              Datos de envío
            </h2>
            <p className="text-xs text-rose-400 font-light mt-1 tracking-wide">
              Completa tus datos para recibir tu pedido con amor
            </p>
          </div>

        </CardHeader>

        {/* Separador floral */}
        <div className="flex items-center justify-center gap-2 py-3 px-8">
          <div className="flex-1 h-px bg-linear-to-r from-transparent to-rose-200" />
          <span className="text-rose-300 text-xs">✦</span>
          <div className="flex-1 h-px bg-linear-to-l from-transparent to-rose-200" />
        </div>

        <CardContent className="px-8 pb-8">

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Nombre y Apellido */}
            <div className="grid grid-cols-2 gap-3">

              <div className="space-y-1.5">
                <Label className={labelClass}>Nombre</Label>
                <Input
                  className={inputClass}
                  value={form.firstName || ""}
                  placeholder="Tu nombre"
                  onChange={(e) => handleChange("firstName", e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label className={labelClass}>Apellido</Label>
                <Input
                  className={inputClass}
                  value={form.lastName || ""}
                  placeholder="Tu apellido"
                  onChange={(e) => handleChange("lastName", e.target.value)}
                />
              </div>

            </div>

            {/* Documento */}
            <div className="space-y-1.5">
              <Label className={labelClass}>Número de documento</Label>
              <Input
                className={inputClass}
                value={form.documentNumber || ""}
                placeholder="Ej: 1 234 567 890"
                onChange={(e) => handleChange("documentNumber", e.target.value)}
              />
            </div>

            {/* Teléfono */}
            <div className="space-y-1.5">
              <Label className={labelClass}>Teléfono</Label>
              <Input
                className={inputClass}
                type="tel"
                value={form.phoneNumber || ""}
                placeholder="Ej: 300 123 4567"
                onChange={(e) => handleChange("phoneNumber", e.target.value)}
              />
            </div>

            {/* Departamento y Municipio */}
            <DepartmentSelect
              departments={departments}
              selectedDepartment={selectedDepartment}
              setSelectedDepartment={setSelectedDepartment}
              handleChange={handleChange}
              labelClass={labelClass}
            />

            <MunicipalitySelect
              municipalities={municipalities}
              selectedDepartment={selectedDepartment}
              value={form.municipality}
              handleChange={handleChange}
              labelClass={labelClass}
            />

            {/* Dirección */}
            <div className="space-y-1.5">
              <Label className={labelClass}>Dirección</Label>
              <Input
                className={inputClass}
                value={form.address || ""}
                placeholder="Calle, carrera, barrio..."
                onChange={(e) => handleChange("address", e.target.value)}
              />
            </div>

            {/* Detalles adicionales */}
            <div className="space-y-1.5">
              <Label className={labelClass}>Detalles adicionales</Label>
              <Textarea
                className="border-rose-200 focus-visible:ring-rose-300 focus-visible:ring-1 focus-visible:border-rose-400 bg-white placeholder:text-rose-300 text-rose-900 rounded-xl resize-none transition-all duration-200 text-sm"
                value={form.additionalDetails || ""}
                placeholder="Apartamento, piso, portería, indicaciones especiales..."
                rows={3}
                onChange={(e) =>
                  handleChange("additionalDetails", e.target.value)
                }
              />
            </div>

            {/* Botón enviar */}
            <button
              type="submit"
              disabled={loading || loadingCol}
              className="w-full rounded-xl bg-linear-to-r from-rose-400 to-pink-500 text-white py-3 font-light tracking-[0.2em] text-sm uppercase hover:from-rose-500 hover:to-pink-600 transition-all duration-300 shadow-lg shadow-rose-200 hover:shadow-rose-300 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading || loadingCol ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    />
                  </svg>
                  Procesando...
                </span>
              ) : (
                "Confirmar envío"
              )}
            </button>

          </form>

        </CardContent>

      </Card>

    </div>
  );
}

export default ShippingForm;
