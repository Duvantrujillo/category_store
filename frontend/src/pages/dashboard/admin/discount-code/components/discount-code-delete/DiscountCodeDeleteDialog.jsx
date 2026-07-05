import { useDeleteDiscountCode } from "../../hooks/useDiscountCode";

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

function DiscountCodeDeleteDialog({
  open,
  onClose,
  discountCodeId,
  onDeleted,
}) {
  const { submitDelete, loading } = useDeleteDiscountCode();

  const handleDelete = async () => {
    if (!discountCodeId) return;

    try {
      await submitDelete(discountCodeId);
      onDeleted?.();
      onClose?.();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>¿Eliminar cupón?</DialogTitle>
          <DialogDescription>Esta acción no se puede deshacer.</DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>

          <Button variant="destructive" onClick={handleDelete} disabled={loading}>
            {loading ? "Eliminando..." : "Eliminar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default DiscountCodeDeleteDialog;
