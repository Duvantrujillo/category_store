import { useState, useEffect, useRef } from "react";
import { Pencil } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import BannerSharedForm from "../../shared/BannerSharedForm";
import { useUpdateBanner } from "../../hooks/useBanner";

export default function BannerEditDialog({ item, onRefresh, disabled = false }) {
  const [open, setOpen] = useState(false);

  const { form, handleChange, submitUpdate, loading, setInitialData } = useUpdateBanner();

  const hasInitialized = useRef(false);

  useEffect(() => {
    if (open && item && !hasInitialized.current) {
      setInitialData(item);
      hasInitialized.current = true;
    }
    if (!open) {
      hasInitialized.current = false;
    }
  }, [open, item, setInitialData]);

  async function handleSubmit() {
    try {
      await submitUpdate(item.id);
      onRefresh?.();
      setOpen(false);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <>
      <Button
        variant="secondary"
        size="icon"
        className="text-blue-500 disabled:opacity-40 disabled:pointer-events-none"
        onClick={() => setOpen(true)}
        disabled={disabled}
      >
        <Pencil className="w-4 h-4" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-2xl rounded-2xl">
          <DialogHeader>
            <DialogTitle>Editar banner</DialogTitle>
            <DialogDescription>
              Modifica la información del banner.
            </DialogDescription>
          </DialogHeader>

          {open && (
            loading ? (
              <div className="flex flex-col items-center gap-10">
                <Button variant="outline" disabled size="sm">
                  <Spinner data-icon="inline-start" />
                  Cargando...
                </Button>
              </div>
            ) : (
              <BannerSharedForm
                mode="edit"
                form={form}
                handleChange={handleChange}
                loading={loading}
                onCancel={() => setOpen(false)}
                onSubmit={handleSubmit}
              />
            )
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
