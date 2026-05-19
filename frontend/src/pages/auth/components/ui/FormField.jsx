import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function FormField({
  label,
  name,
  type = "text",
  value,
  onChange,
}) {
  return (
    <div className="space-y-2">

      <Label>{label}</Label>

      <Input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
      />

    </div>
  );
}

export default FormField;