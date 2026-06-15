import { Link, useLocation } from "react-router-dom";
import adminIcon from "@/assets/icons/admin.png";

import {
  LayoutGrid,
  Tags,
  List,
  Package,
  Truck,
  PackageSearch,
  ClipboardList,
} from "lucide-react";

export default function AppSidebar({ open, setOpen }) {
  const location = useLocation();

  const items = [
    { title: "Categorías", url: "/dashboard/admin/list/category", icon: LayoutGrid },
    { title: "Marcas", url: "/dashboard/admin/list/brand", icon: Tags },
    { title: "Atributos", url: "/dashboard/admin/list/attibute", icon: List },
    { title: "Valores", url: "/dashboard/admin/list/attibute-value", icon: Package },
    { title: "Envíos", url: "/dashboard/admin/list/shipping", icon: Truck },
    { title: "Productos", url: "/dashboard/admin/list/product", icon: PackageSearch },
    { title: "Variantes", url: "/dashboard/admin/list/product-variant", icon: PackageSearch },
    { title: "Órdenes", url: "/dashboard/admin/list/order", icon: ClipboardList },
  ];

  return (
    <>
      {/* BACKDROP MOBILE */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
        />
      )}

      <aside
        className={`
          fixed md:static top-0 left-0 z-50 h-full w-64 bg-white border-r
          transform transition-transform duration-300
          md:translate-x-0
          ${open ? "translate-x-0" : "-translate-x-full"}
        `}
      >

        {/* HEADER */}
        <div className="flex items-center gap-2 px-4 py-4 border-b">
          <img src={adminIcon} className="h-5 w-5" />
          <span className="text-xs font-semibold text-gray-500">
            ADMIN PANEL
          </span>
        </div>

        {/* MENU */}
        <nav className="p-2 space-y-1">

          {items.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.url;

            return (
              <Link
                key={item.url}
                to={item.url}
                onClick={() => setOpen(false)} // cerrar en móvil
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-lg text-sm
                  ${active
                    ? "bg-blue-500 text-white"
                    : "text-gray-600 hover:bg-blue-50 hover:text-blue-600"}
                `}
              >
                <Icon size={18} />
                {item.title}
              </Link>
            );
          })}

        </nav>

      </aside>
    </>
  );
}