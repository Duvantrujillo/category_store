import { Label } from "@/components/ui/label";

const selectClass =
  "w-full rounded-xl border border-rose-200 px-3 py-2.5 text-sm text-rose-900 bg-white appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-rose-300 focus:border-rose-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";

function MunicipalitySelect({
  municipalities,
  selectedDepartment,
  value,
  handleChange,
  labelClass,
  invalid = false,
}) {
  const handleMunicipalityChange = (e) => {
    handleChange("municipality", e.target.value);
  };

  return (
    <div className="space-y-1.5">

      <Label className={labelClass}>Municipio</Label>

      <div className="relative">
        <select
          value={value || ""}
          onChange={handleMunicipalityChange}
          disabled={!selectedDepartment}
          className={`${selectClass} ${invalid ? "border-destructive ring-1 ring-destructive/20" : ""}`}
        >
          <option value="" disabled>
            {selectedDepartment ? "Selecciona un municipio" : "Primero elige un departamento"}
          </option>
          {municipalities.map((mun) => (
            <option key={mun.id} value={mun.name}>
              {mun.name}
            </option>
          ))}
        </select>

        {/* Flecha personalizada */}
        <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
          <svg
            className="h-4 w-4 text-rose-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

    </div>
  );
}

export default MunicipalitySelect;
