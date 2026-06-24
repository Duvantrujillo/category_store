import { useEffect, useState } from "react";
import { ShieldOff } from "lucide-react";
import { useAllBanners } from "../hooks/useBanner";
import BannerTable from "../components/banner-list/BannerTable";
import BannerCreateDialog from "../components/banner-create/BannerCreateDialog";
import BannerDeleteDialog from "../components/banner-delete/BannerDeleteDialog";
import BannerSearch from "../components/banner-search/BannerSearch";
import BannerStatusFilter from "../components/banner-filter/BannerStatusFilter";
import { useHasPermission } from "@/lib/permissions";

const PAGE_SIZE = 10;

function getBannerStatusKey(banner) {
  const now   = new Date();
  const start = new Date(banner.startDate);
  const end   = new Date(banner.endDate);
  if (!banner.isActive) return "inactive";
  if (now < start)      return "scheduled";
  if (now > end)        return "expired";
  return "active";
}

function applyFilters(list, query, statusFilter) {
  const q = query.toLowerCase().trim();
  return list.filter((b) => {
    const matchesSearch = q ? b.title?.toLowerCase().includes(q) : true;
    const matchesStatus = statusFilter === "all" ? true : getBannerStatusKey(b) === statusFilter;
    return matchesSearch && matchesStatus;
  });
}

export default function ListBanner() {
  const canView   = useHasPermission("banners.view");
  const canCreate = useHasPermission("banners.create");

  const { banners = [], refetch } = useAllBanners({ skip: !canView });

  const [query,        setQuery]        = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page,         setPage]         = useState(1);
  const [deleteOpen,   setDeleteOpen]   = useState(false);
  const [deleteId,     setDeleteId]     = useState(null);

  const filtered   = applyFilters(banners, query, statusFilter);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => { if (page > totalPages) setPage(1); }, [page, totalPages]);
  useEffect(() => { setPage(1); }, [statusFilter, query]);

  function handleDelete(id) {
    setDeleteId(id);
    setDeleteOpen(true);
  }

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

      {/* Barra superior: search + filter + crear */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <BannerSearch
            query={query}
            setQuery={setQuery}
            resultsCount={filtered.length}
          />
          <BannerStatusFilter value={statusFilter} onChange={setStatusFilter} />
        </div>

        <BannerCreateDialog onRefresh={refetch} disabled={!canCreate} />
      </div>

      {/* Tabla */}
      <BannerTable
        banners={paginated}
        totalItems={filtered.length}
        page={page}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
        onDelete={handleDelete}
        onRefresh={refetch}
      />

      {/* Diálogo eliminar */}
      <BannerDeleteDialog
        open={deleteOpen}
        onClose={() => { setDeleteOpen(false); setDeleteId(null); }}
        bannerId={deleteId}
        onDeleted={refetch}
      />

    </div>
  );
}
