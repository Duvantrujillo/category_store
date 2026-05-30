import { useDeleteAttribute } from "../../hooks/useAttribute";

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

function DeleteAttributeDialog({
  open,
  onClose,
  attributeId,
  onDeleted,
}) {

  const {
    submitDelete,
    loading,
  } = useDeleteAttribute();

  const handleDelete = async () => {

    if (!attributeId) return;

    try {

      await submitDelete(attributeId);

      onDeleted?.();

      onClose?.();

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
            ¿Eliminar atributo?
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
              : "Eliminar"
            }

          </Button>

        </DialogFooter>

      </DialogContent>

    </Dialog>

  );
}

export default DeleteAttributeDialog;