import { useState, useEffect, useMemo } from "react";
import { ShieldOff } from "lucide-react";
import { useAllUsers } from "../hooks/useUser";
import UserTable from "../components/user-list/UserTable";
import UserCreateDialog from "../components/user-create/UserCreateDialog";
import { useHasPermission } from "@/lib/permissions";

const PAGE_SIZE = 15;

function ListUser() {
  const canView   = useHasPermission("admins.view");
  const canCreate = useHasPermission("admins.create");
  const { users = [], refetch } = useAllUsers({ skip: !canView });
  const [page, setPage]           = useState(1);
  const [activeRole, setActiveRole] = useState("all");

  // 1. Filtrar por rol
  const filtered = useMemo(() => {
    if (activeRole === "all") return users;
    return users.filter((u) => u.role?.name === activeRole);
  }, [users, activeRole]);

  // 2. Paginar sobre el resultado filtrado
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Volver a página 1 si el filtro reduce el total
  useEffect(() => {
    setPage(1);
  }, [activeRole]);

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
      <div className="flex justify-end">
        <UserCreateDialog
          onRefresh={refetch}
          disabled={!canCreate}
        />
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
