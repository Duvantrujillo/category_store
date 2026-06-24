import { useState } from "react";
import { Plus } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import BannerSharedForm from "../../shared/BannerSharedForm";
import { useCreateBanner } from "../../hooks/useBanner";

export default function BannerCreateDialog({ onRefresh, disabled = false }) {
  const [open, setOpen] = useState(false);

  const { form, handleChange, submitCreate, loading, resetForm } = useCreateBanner();

  async function handleSubmit() {
    try {
      await submitCreate();
      onRefresh?.();
      setOpen(false);
      resetForm();
    } catch (err) {
      console.error(err);
    }
  }

  function handleClose() {
    setOpen(false);
    resetForm();
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} className="gap-2" disabled={disabled}>
        <Plus className="w-4 h-4" />
        Nuevo banner
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-2xl rounded-2xl">
          <DialogHeader>
            <DialogTitle>Crear banner</DialogTitle>
            <DialogDescription>
              Agrega un nuevo banner al carrusel del hero.
            </DialogDescription>
          </DialogHeader>

          {open && (
            loading ? (
              <div className="flex flex-col items-center gap-10">
                <Button variant="outline" disabled size="sm">
                  <Spinner data-icon="inline-start" />
                  Guardando...
                </Button>
              </div>
            ) : (
              <BannerSharedForm
                mode="create"
                form={form}
                handleChange={handleChange}
                loading={loading}
                onCancel={handleClose}
                onSubmit={handleSubmit}
              />
            )
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
