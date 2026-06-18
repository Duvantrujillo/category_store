import { useEffect, useState } from "react";
import { useAllProductVariant, useSearchProductVariant } from "../hooks/useProductVariant";
import { useAllAttributeValue } from "../../attribute-value/hooks/useAttributeValue";
import { getAllProducts } from "@/api/productApi";
import ProductVariantTable from "../components/product-variant-list/ProductVariantTable";
import ProductVariantCreateDialog from "../components/product-variant-create/ProductVariantCreateDialog";
import ProductVariantSearch from "../components/product-variant-search/ProductVariantSearch";

const PAGE_SIZE = 15;

function ProductVariantList() {
  const { variants = [], refetch } = useAllProductVariant();
  const { query, setQuery, results } = useSearchProductVariant();
  const { attributeValues = [] } = useAllAttributeValue();
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(variants.length / PAGE_SIZE));
  const paginated = variants.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const dataToShow = query.trim() ? results : paginated;

  useEffect(() => {
    getAllProducts()
      .then((data) => setProducts(data.data || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Variantes</h1>
          <p className="text-muted-foreground">Administra las variantes de productos.</p>
          <ProductVariantSearch query={query} setQuery={setQuery} resultsCount={results.length} />
        </div>
        <ProductVariantCreateDialog onRefresh={refetch} products={products} attributes={attributeValues} />
      </div>

      <ProductVariantTable
        variants={dataToShow}
        totalItems={query.trim() ? 0 : variants.length}
        page={page}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
        onRefresh={refetch}
        products={products}
        attributes={attributeValues}
      />
    </div>
  );
}

export default ProductVariantList;
