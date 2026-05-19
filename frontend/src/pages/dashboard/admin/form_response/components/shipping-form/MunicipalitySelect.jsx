import { Label } from "@/components/ui/label";

function MunicipalitySelect({
  municipalities,
  selectedDepartment,
  value,
  handleChange,
}) {
  const handleMunicipalityChange = (e) => {
    handleChange(
      "municipality",
      e.target.value
    );
  };

  return (
    <div className="space-y-2">

      <Label>
        Municipio
      </Label>

      <select
        value={value || ""}
        onChange={handleMunicipalityChange}
        disabled={!selectedDepartment}
        className="w-full rounded-md border p-2 disabled:opacity-50"
      >

        <option value="">
          Selecciona un municipio
        </option>

        {municipalities.map((mun) => (
          <option
            key={mun.id}
            value={mun.name}
          >
            {mun.name}
          </option>
        ))}

      </select>

    </div>
  );
}

export default MunicipalitySelect;