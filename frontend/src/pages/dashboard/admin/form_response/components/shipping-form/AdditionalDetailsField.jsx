import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

function AdditionalDetailsField({
  value,
  onChange,
}) {
  return (
    <div className="space-y-2">

      <Label>
        Detalles adicionales
      </Label>

      <Textarea
        value={value || ""}
        placeholder="Escribe aquí cualquier detalle adicional..."
        onChange={(e) =>
          onChange(
            "additionalDetails",
            e.target.value
          )
        }
      />

    </div>
  );
}

export default AdditionalDetailsField;