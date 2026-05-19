import { Label } from "@/components/ui/label";

function DepartmentSelect({
  departments,
  selectedDepartment,
  setSelectedDepartment,
  handleChange,
}) {

  const handleDepartmentChange = (e) => {
    const departmentId = e.target.value;

    const selectedDep = departments.find(
      (dep) => dep.id === Number(departmentId)
    );

    setSelectedDepartment(departmentId);

    handleChange(
      "departament",
      selectedDep?.name || ""
    );
  };

  return (
    <div className="space-y-2">

      <Label>
        Departamento
      </Label>

      <select
        value={selectedDepartment || ""}
        onChange={handleDepartmentChange}
        className="w-full rounded-md border p-2"
      >

        <option value="">
          Selecciona un departamento
        </option>

        {departments.map((dep) => (
          <option
            key={dep.id}
            value={dep.id}
          >
            {dep.name}
          </option>
        ))}

      </select>

    </div>
  );
}

export default DepartmentSelect;