import { useState, useEffect } from "react";
import { Spinner } from "@/components/ui/spinner"
import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import { UserPen } from "lucide-react";

import ShippingEditForm from "./ShippingEditForm";

import useUpdateShipping from "../../hooks/useShipping";
import useDepartments from "../../hooks/useDepartament";

export default function ShippingEditDialog({ item }) {

  const [open, setOpen] = useState(false);

  /*
    🔥 SOLO CARGA DEPARTAMENTOS Y MUNICIPIOS
    CUANDO EL MODAL ESTÁ ABIERTO
  */
  const {
    departments,
    municipalities,
    selectedDepartment,
    setSelectedDepartment,
    loading: loadingLocations,
  } = useDepartments(open);
  const {
    form,
    handleChange,
    submitUpdate,
    loading,
    setForm,
  } = useUpdateShipping();

  /*
    🔥 INICIALIZAR FORM
    SOLO CUANDO ABRE EL MODAL
  */
  useEffect(() => {

    if (!open || !item) return;

    setForm({
      firstName: item.firstName || "",
      lastName: item.lastName || "",
      documentNumber: item.documentNumber || "",
      phoneNumber: item.phoneNumber || "",
      address: item.address || "",
      additionalDetails: item.additionalDetails || "",
      departament: item.departament || "",
      municipality: item.municipality || "",
    });
    const dep = departments.find(
      (d) => d.name === item.departament
    );

    setSelectedDepartment(dep?.id || "");

  }, [
    open,
    item,
    departments,
    setForm,
    setSelectedDepartment,
  ]);
  /*
    🔥 SUBMIT
  */
  const handleSubmit = async () => {

    try {

      await submitUpdate(item.id);

      setOpen(false);

    } catch (err) {

      console.error(err);

    }
  };

  return (
    <>

      {/* BOTÓN EDITAR */}
      <Button
        variant="secondary"
        size="icon"
        className="text-blue-500"
        onClick={() => setOpen(true)}
      >
        <UserPen className="w-4 h-4" />
      </Button>

      {/* MODAL */}
      <Dialog
        open={open}
        onOpenChange={setOpen}
      >

        <DialogContent className="sm:max-w-2xl rounded-2xl">

          <DialogHeader>

            <DialogTitle>
              Editar información del cliente
            </DialogTitle>

            <DialogDescription>
              Modifica los datos del envío.
            </DialogDescription>

          </DialogHeader>

          {/* 🔥 SOLO RENDERIZA FORMULARIO
              CUANDO EL MODAL YA ESTÁ ABIERTO */}
          {open && (

            loadingLocations ? (

              <div className="flex flex-col items-center gap-10">
                <Button variant="outline" disabled size="sm">
                  <Spinner data-icon="inline-start" />
                  Please wait
                </Button>
              </div>

            ) : (

              <ShippingEditForm
                form={form}
                handleChange={handleChange}
                loading={loading}
                onCancel={() => setOpen(false)}
                onSubmit={handleSubmit}
                departments={departments}
                municipalities={municipalities}
                selectedDepartment={selectedDepartment}

                setSelectedDepartment={setSelectedDepartment}
              />

            )

          )}

        </DialogContent>

      </Dialog>

    </>
  );
}