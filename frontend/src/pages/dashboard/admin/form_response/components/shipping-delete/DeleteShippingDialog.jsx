import { useDeleteShipping } from "../../hooks/useShipping";

import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

function DeleteShippingDialog({
  open,
  onClose,
  shippingId,
  onDeleted,
}) {

  const { submitDelete, loading } =
    useDeleteShipping();

  const handleDelete = async () => {

    if (!shippingId) return;

    try {

      await submitDelete(shippingId);

      onDeleted();

      onClose();

    } catch (error) {

      console.error(error);

    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onClose}
    >

      <DialogContent>

        <DialogHeader>

          <DialogTitle>
            ¿Eliminar registro?
          </DialogTitle>

          <DialogDescription>
            Esta acción no se puede deshacer.
          </DialogDescription>

        </DialogHeader>

        <DialogFooter>

          <DialogClose asChild>

            <Button variant="outline">
              Cancelar
            </Button>

          </DialogClose>

          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
          >

            {loading
              ? "Eliminando..."
              : "Eliminar"}

          </Button>

        </DialogFooter>

      </DialogContent>

    </Dialog>
  );
}

export default DeleteShippingDialog;