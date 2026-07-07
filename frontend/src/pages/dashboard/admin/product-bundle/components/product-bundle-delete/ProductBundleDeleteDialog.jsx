import { useDeleteProductBundle } from "../../hooks/useProductBundle";

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

function DeleteProductBundleDialog({
  open,
  onClose,
  bundleId,
  onDeleted,
}) {

  const {
    submitDelete,
    loading,
  } = useDeleteProductBundle();

  const handleDelete = async () => {

    if (!bundleId) return;

    try {

      await submitDelete(bundleId);

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
            ¿Eliminar combo?
          </DialogTitle>

          <DialogDescription>
            Esta acción no se puede deshacer. Si el combo ya tiene pedidos asociados, no podrá eliminarse.
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

export default DeleteProductBundleDialog;
