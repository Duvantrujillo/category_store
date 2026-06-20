import { useEffect, useState } from "react";
import { ShieldOff } from "lucide-react";
import { useAllProductVariant, useSearchProductVariant } from "../hooks/useProductVariant";
import { useAllAttributeValue } from "../../attribute-value/hooks/useAttributeValue";
import { getAllProducts } from "@/api/productApi";
import ProductVariantTable from "../components/product-variant-list/ProductVariantTable";
import ProductVariantCreateDialog from "../components/product-variant-create/ProductVariantCreateDialog";
import ProductVariantSearch from "../components/product-variant-search/ProductVariantSearch";
import { useHasPermission } from "@/lib/permissions";

const PAGE_SIZE = 15;

function ProductVariantList() {
  const canView   = useHasPermission("product-variants.view");
  const canCreate = useHasPermission("product-variants.create");
  const { variants = [], refetch } = useAllProductVariant({ skip: !canView });
  const { query, setQuery, results } = useSearchProductVariant();
  const { attributeValues = [] } = useAllAttributeValue({ skip: !canView });
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(variants.length / PAGE_SIZE));
  const paginated = variants.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const dataToShow = query.trim() ? results : paginated;

  useEffect(() => {
    if (!canView) return;
    getAllProducts()
      .then((data) => setProducts(data.data || []))
      .catch(() => {});
  }, [canView]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  if (!canView) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24 text-slate-400">
        <ShieldOff size={40} className="opacity-40" />
        <p className="text-sm">No tienes permisos para visualizar esta sección.</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <ProductVariantSearch query={query} setQuery={setQuery} resultsCount={results.length} />
        <ProductVariantCreateDialog
          onRefresh={refetch}
          products={products}
          attributes={attributeValues}
          disabled={!canCreate}
        />
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
