import { useState, useEffect, useRef } from "react";

import { Spinner } from "@/components/ui/spinner";

import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { UserPen } from "lucide-react";

import ProductSharedForm from "@/pages/dashboard/admin/product/shared/ProductSharedForm";

import { useUpdateProduct } from "../../hooks/useProduct";

import { activeCategory } from "@/pages/dashboard/admin/category/api/categoryApi";
import { AllBrands } from "@/pages/dashboard/admin/brand/api/brandApi";

export default function ProductEditDialog({
  item,
  onRefresh,
  disabled = false,
}) {
  const [open, setOpen] = useState(false);

  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loadingData, setLoadingData] = useState(false);

  const {
    form,
    handleChange,
    submitUpdate,
    loading,
    setInitialData,
  } = useUpdateProduct();

  /*
    🔥 CARGAR CATEGORÍAS Y MARCAS
  */

  useEffect(() => {
    if (open && (categories.length === 0 || brands.length === 0)) {
      // eslint-disable-next-line react-hooks/immutability
      loadCategoriesAndBrands();
    }
  }, [brands.length, categories.length, open]);

  const loadCategoriesAndBrands = async () => {
    try {
      setLoadingData(true);
      const [catResponse, brandResponse] = await Promise.all([
        activeCategory(),
        AllBrands(),
      ]);

      console.log("Category Response:", catResponse);
      console.log("Brand Response:", brandResponse);

      // Las respuestas vienen con estructura { data: [...] }
      const categoriesData = Array.isArray(catResponse?.data) ? catResponse.data : [];
      const brandsData = Array.isArray(brandResponse?.data) ? brandResponse.data : [];

      console.log("Categories Data:", categoriesData);
      console.log("Brands Data:", brandsData);

      setCategories(categoriesData);
      setBrands(brandsData);
    } catch (err) {
      console.error("Error al cargar categorías y marcas:", err);
      setCategories([]);
      setBrands([]);
    } finally {
      setLoadingData(false);
    }
  };

  /*
    🔥 INICIALIZAR FORM
    SOLO CUANDO ABRE EL MODAL
  */

  const hasInitialized = useRef(false);

  useEffect(() => {
    if (
      open &&
      item &&
      !hasInitialized.current
    ) {
      setInitialData(item);

      hasInitialized.current = true;
    }

    if (!open) {
      hasInitialized.current = false;
    }
  }, [open, item, setInitialData]);

  /*
    🔥 SUBMIT
  */

  const handleSubmit = async () => {
    try {
      await submitUpdate(item.id);

      onRefresh?.();

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
        disabled={disabled}
        title={disabled ? "Sin permiso para editar productos" : undefined}
      >
        <UserPen className="w-4 h-4" />
      </Button>

      {/* MODAL */}

      <Dialog
        open={open}
        onOpenChange={setOpen}
      >
        <DialogContent className="sm:max-w-2xl rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-lg">
              Editar Producto
            </DialogTitle>

            <DialogDescription className="text-xs">
              Actualiza los datos del producto
            </DialogDescription>
          </DialogHeader>

          {open &&
            (loading || loadingData ? (
              <div className="flex flex-col items-center gap-10">
                <Button
                  variant="outline"
                  disabled
                  size="sm"
                >
                  <Spinner data-icon="inline-start" />

                  {loadingData ? "Cargando opciones..." : "Cargando..."}
                </Button>
              </div>
            ) : (
              <ProductSharedForm
                mode="edit"
                form={form}
                handleChange={
                  handleChange
                }
                loading={loading}
                onCancel={() =>
                  setOpen(false)
                }
                onSubmit={handleSubmit}
                categories={categories}
                brands={brands}
              />
            ))}
        </DialogContent>
      </Dialog>
    </>
  );
}