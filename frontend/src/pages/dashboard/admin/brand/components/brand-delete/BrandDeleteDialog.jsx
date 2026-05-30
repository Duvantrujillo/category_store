import { useDeleteBrand } from "../../hooks/useBrand";

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

function DeleteBrandDialog({
  open,
  onClose,
  brandId,
  onDeleted,
}) {

  const {
    submitDelete,
    loading,
  } = useDeleteBrand();

  const handleDelete = async () => {

    if (!brandId) return;

    try {

      await submitDelete(brandId);

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
            ¿Eliminar marca?
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

export default DeleteBrandDialog;