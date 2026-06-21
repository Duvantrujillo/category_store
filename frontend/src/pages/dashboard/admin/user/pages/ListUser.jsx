import { useState, useEffect, useMemo } from "react";
import { ShieldOff } from "lucide-react";
import { useAllUsers } from "../hooks/useUser";
import UserTable from "../components/user-list/UserTable";
import UserCreateDialog from "../components/user-create/UserCreateDialog";
import UserSearch from "../components/user-search/UserSearch";
import UserStatusFilter from "../components/user-filter/UserStatusFilter";
import { useHasPermission } from "@/lib/permissions";

const PAGE_SIZE = 15;

function ListUser() {
  const canView   = useHasPermission("admins.view");
  const canCreate = useHasPermission("admins.create");
  const { users = [], refetch } = useAllUsers({ skip: !canView });

  const [page, setPage]               = useState(1);
  const [activeRole, setActiveRole]   = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [query, setQuery]             = useState("");

  const filtered = useMemo(() => {
    let list = users;
    if (activeRole !== "all")   list = list.filter((u) => u.role?.name === activeRole);
    if (statusFilter !== "all") list = list.filter((u) => (u.status ?? "active") === statusFilter);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (u) => u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [users, activeRole, statusFilter, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => { setPage(1); }, [activeRole, statusFilter, query]);
  useEffect(() => { if (page > totalPages) setPage(totalPages); }, [page, totalPages]);

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
          <UserSearch query={query} setQuery={setQuery} resultsCount={filtered.length} />
          <UserStatusFilter value={statusFilter} onChange={setStatusFilter} />
        </div>
        <UserCreateDialog onRefresh={refetch} disabled={!canCreate} />
      </div>

      <UserTable
        users={paginated}
        allUsers={users}
        totalItems={filtered.length}
        page={page}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
        onRefresh={refetch}
        activeRole={activeRole}
        onRoleChange={(role) => setActiveRole(role)}
      />
    </div>
  );
}

export default ListUser;
