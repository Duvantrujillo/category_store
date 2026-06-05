import { useEffect, useState } from "react";

import { useAllProductVariant } from "../hooks/useProductVariant";
import { useAllAttributeValue } from "../../attribute-value/hooks/useAttributeValue";

import ProductVariantTable from "../components/product-variant-list/ProductVariantTable";
import TablePagination from "@/components/ui/TablePagination";

import ProductVariantCreateDialog from "../components/product-variant-create/ProductVariantCreateDialog";

import { getAllProducts } from "@/api/productApi";

const PAGE_SIZE = 10;

function ProductVariantList() {

  const {
    variants = [],
    refetch,
  } = useAllProductVariant();

  const [products, setProducts] = useState([]);
  const { attributeValues = [] } = useAllAttributeValue();
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(variants.length / PAGE_SIZE));
  const paginatedVariants = variants.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    loadProducts();
  }, []);

  useEffect(() => {
    if (page > totalPages) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPage(totalPages);
    }
  }, [page, totalPages]);

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
        variants={paginatedVariants}
        onRefresh={refetch}
        products={products}
        attributes={attributeValues}
      />

      <TablePagination
        page={page}
        pageSize={PAGE_SIZE}
        totalItems={variants.length}
        onPageChange={setPage}
        className="pt-4"
      />

    </div>

  );

}

export default ProductVariantList;