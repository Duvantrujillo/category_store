import { Label } from "@/components/ui/label";

const selectClass =
  "w-full rounded-xl border border-rose-200 px-3 py-2.5 text-sm text-rose-900 bg-white appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-rose-300 focus:border-rose-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";

function DepartmentSelect({
  departments,
  selectedDepartment,
  setSelectedDepartment,
  handleChange,
  labelClass,
}) {
  const handleDepartmentChange = (e) => {
    const departmentId = e.target.value;
    const selectedDep = departments.find((dep) => dep.id === Number(departmentId));
    setSelectedDepartment(departmentId);
    handleChange("departament", selectedDep?.name || "");
  };

  return (
    <div className="space-y-1.5">

      <Label className={labelClass}>Departamento</Label>

      <div className="relative">
        <select
          value={selectedDepartment || ""}
          onChange={handleDepartmentChange}
          className={selectClass}
        >
          <option value="" disabled>
            Selecciona un departamento
          </option>
          {departments.map((dep) => (
            <option key={dep.id} value={dep.id}>
              {dep.name}
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

export default DepartmentSelect;
