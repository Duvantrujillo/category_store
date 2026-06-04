import { useState } from "react";
import { useEffect } from "react";

import { Spinner } from "@/components/ui/spinner";

import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import { Plus } from "lucide-react";

import ProductSharedForm from "../../shared/ProductSharedForm";

import { useCreateProduct } from "../../hooks/useProduct";

import { activeCategory } from "@/pages/dashboard/admin/category/api/categoryApi";
import { AllBrands } from "@/pages/dashboard/admin/brand/api/brandApi";

export default function ProductCreateDialog({
  onRefresh,
}) {
  const [open, setOpen] =
    useState(false);

  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loadingData, setLoadingData] = useState(false);

  /*
    🔥 HOOK CREATE
  */

  const {
    form,
    handleChange,
    submitCreate,
    loading,
    resetForm,
  } = useCreateProduct();

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
    🔥 SUBMIT
  */

  const handleSubmit =
    async () => {
      try {
        await submitCreate();

        onRefresh?.();

        setOpen(false);

        resetForm();
      } catch (err) {
        console.error(err);
      }
    };

  /*
    🔥 CERRAR MODAL
  */

  const handleClose = () => {
    setOpen(false);

    resetForm();
  };

  return (
    <>
      {/* BOTÓN CREAR */}

      <Button
        onClick={() =>
          setOpen(true)
        }
        className="gap-2"
      >
        <Plus className="w-4 h-4" />

        Nuevo producto
      </Button>

      {/* MODAL */}

      <Dialog
        open={open}
        onOpenChange={setOpen}
      >
        <DialogContent className="sm:max-w-2xl rounded-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg">
              Crear Producto
            </DialogTitle>

            <DialogDescription className="text-xs">
              Completa los datos del nuevo producto
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

                  {loadingData ? "Cargando opciones..." : "Guardando..."}
                </Button>
              </div>
            ) : (
              <ProductSharedForm
                mode="create"
                form={form}
                handleChange={
                  handleChange
                }
                loading={loading}
                onCancel={
                  handleClose
                }
                onSubmit={
                  handleSubmit
                }
                categories={categories}
                brands={brands}
              />
            ))}
        </DialogContent>
      </Dialog>
    </>
  );
}