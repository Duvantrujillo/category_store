import { useEffect, useState } from "react";

import { useAllProductVariant } from "../hooks/useProductVariant";
import { useAllAttributeValue } from "../../attribute-value/hooks/useAttributeValue";

import ProductVariantTable from "../components/product-variant-list/ProductVariantTable";

import ProductVariantCreateDialog from "../components/product-variant-create/ProductVariantCreateDialog";

import { getAllProducts } from "@/api/productApi";

function ProductVariantList() {

  const {
    variants = [],
    refetch,
  } = useAllProductVariant();

  const [products, setProducts] = useState([]);
  const { attributeValues = [] } = useAllAttributeValue();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await getAllProducts();
      setProducts(data.data || []);
    } catch (error) {
      console.error("Error cargando productos:", error);
    }
  };

  return (

    <div className="space-y-6 p-6">

      <div
        className="
          flex flex-col gap-4
          md:flex-row
          md:items-center
          md:justify-between
        "
      >

        <div className="space-y-1">

          <h1 className="text-3xl font-bold tracking-tight">
            Gestión de Variantes
          </h1>

          <p className="text-muted-foreground">
            Administra las variantes de productos.
          </p>

        </div>

        <ProductVariantCreateDialog
          onRefresh={refetch}
          products={products}
          attributes={attributeValues}
        />

      </div>

      <ProductVariantTable
        variants={variants}
        onRefresh={refetch}
        products={products}
        attributes={attributeValues}
      />

    </div>

  );

}

export default ProductVariantList;