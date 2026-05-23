import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger
} from "@/components/ui/dialog";
import { UserPen } from "lucide-react";

import ShippingEditForm from "./ShippingEditForm";
import useUpdateShipping from "../../hooks/useShipping";
import useDepartments  from "../../hooks/useDepartament"; // <-- Hook para departamentos 


export default function ShippingEditDialog({ item }) {
  const { form, handleChange, submitUpdate, loading, setForm } = useUpdateShipping();
  const { departments, municipalities, loading: loadingLocations } = useDepartments();
  const [open, setOpen] = useState(false);

  // Inicializa el formulario con los datos del item cuando se abre el diálogo
  useEffect(() => {
    if (item && open) {
      setForm({
        firstName: item.firstName || "",
        lastName: item.lastName || "",
        documentNumber: item.documentNumber || "",
        phoneNumber: item.phoneNumber || "",
        address: item.address || "",
        additionalDetails: item.additionalDetails || "",
        departament: item.departament || "",  // <-- nuevo
        municipality: item.municipality || "" // <-- nuevo
      });
    }
  }, [item, open, setForm]);

  const handleSubmit = async () => {
    try {
      await submitUpdate(item.id);
      setOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  if (loadingLocations) return <p>Cargando departamentos y municipios...</p>;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="icon">
          <UserPen className="w-4 h-4" />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-2xl rounded-2xl">
        <DialogHeader>
          <DialogTitle>Editar información del cliente</DialogTitle>
          <DialogDescription>Modifica los datos del envío.</DialogDescription>
        </DialogHeader>

        <ShippingEditForm
          form={form}
          handleChange={handleChange}
          loading={loading}
          onCancel={() => setOpen(false)}
          onSubmit={handleSubmit}
          departments={departments}               // <-- nuevo
          municipalities={municipalities}         // <-- nuevo
          selectedDepartment={form.departament}   // <-- nuevo
          setSelectedDepartment={(dep) =>
            handleChange("departament", dep)
          }                                        // <-- nuevo
        />
      </DialogContent>
    </Dialog>
  );
}