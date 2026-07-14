import { useDeletePurchaseGift } from "../../hooks/usePurchaseGift";

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

function PurchaseGiftDeleteDialog({
  open,
  onClose,
  purchaseGiftId,
  onDeleted,
}) {
  const { submitDelete, loading } = useDeletePurchaseGift();

  const handleDelete = async () => {
    if (!purchaseGiftId) return;

    try {
      await submitDelete(purchaseGiftId);
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
          <DialogTitle>¿Eliminar regalo?</DialogTitle>
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

export default PurchaseGiftDeleteDialog;
