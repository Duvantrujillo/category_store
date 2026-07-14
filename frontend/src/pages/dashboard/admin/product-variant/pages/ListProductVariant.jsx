import { useEffect, useState } from "react";
import { ShieldOff } from "lucide-react";
import { useAllProductVariant, useSearchProductVariant } from "../hooks/useProductVariant";
import { useAllAttributeValue } from "../../attribute-value/hooks/useAttributeValue";
import ProductVariantTable from "../components/product-variant-list/ProductVariantTable";
import ProductVariantCreateDialog from "../components/product-variant-create/ProductVariantCreateDialog";
import ProductVariantSearch from "../components/product-variant-search/ProductVariantSearch";
import ProductVariantStatusFilter from "../components/product-variant-filter/ProductVariantStatusFilter";
import { useHasPermission } from "@/lib/permissions";

const PAGE_SIZE = 15;

function applyStatusFilter(list, statusFilter) {
  if (statusFilter === "all")      return list;
  if (statusFilter === "active")   return list.filter((v) => v.isActive === true);
  if (statusFilter === "inactive") return list.filter((v) => v.isActive === false);
  return list;
}

function ProductVariantList() {
  const canView           = useHasPermission("product-variants.view");
  const canCreate         = useHasPermission("product-variants.create");
  const canViewAttrValues = useHasPermission("attribute-values.view");
  const { variants = [], loading, refetch } = useAllProductVariant({ skip: !canView });
  const { query, setQuery, results }  = useSearchProductVariant();
  const { attributeValues = [] } = useAllAttributeValue({ skip: !canView || !canViewAttrValues });
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage]               = useState(1);

  const filtered      = applyStatusFilter(variants, statusFilter);
  const totalPages    = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated     = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const searchFiltered = applyStatusFilter(results, statusFilter);
  const dataToShow    = query.trim() ? searchFiltered : paginated;
  const displayTotal  = query.trim() ? 0 : filtered.length;

  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [page, totalPages]);

  useEffect(() => { setPage(1); }, [statusFilter, query]);

  if (!canView) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24 text-slate-400">
        <ShieldOff size={40} className="opacity-40" />
        <p className="text-sm">No tienes permisos para visualizar esta sección.</p>
      </div>
    );
  }

  return (
    <div className="px-6 pt-2 pb-6 space-y-3">

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <ProductVariantSearch
            query={query}
            setQuery={setQuery}
            resultsCount={searchFiltered.length}
          />
          <ProductVariantStatusFilter value={statusFilter} onChange={setStatusFilter} />
        </div>
        <ProductVariantCreateDialog
          onRefresh={refetch}
          attributes={attributeValues}
          disabled={!canCreate}
        />
      </div>

      <ProductVariantTable
        variants={dataToShow}
        loading={loading}
        totalItems={displayTotal}
        page={page}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
        onRefresh={refetch}
        attributes={attributeValues}
      />

    </div>
  );
}

export default ProductVariantList;
