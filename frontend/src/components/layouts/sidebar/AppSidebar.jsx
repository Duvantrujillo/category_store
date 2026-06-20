import { Link, useLocation } from "react-router-dom";
import {
  LayoutGrid,
  Tags,
  List,
  Boxes,
  Truck,
  PackageSearch,
  ClipboardList,
  RotateCcw,
  Layers,
  FileText,
  ShieldCheck,
  ChevronRight,
  House,
  BarChart3,
  Users,
  KeyRound,
} from "lucide-react";

const ALL_SECTIONS = [
  {
    label: "General",
    items: [
      { title: "Inicio", url: "/dashboard/admin", icon: House },
    ],
  },
  {
    label: "Catálogo",
    items: [
      { title: "Categorías",  url: "/dashboard/admin/list/category",       icon: LayoutGrid },
      { title: "Marcas",      url: "/dashboard/admin/list/brand",           icon: Tags },
      { title: "Atributos",   url: "/dashboard/admin/list/attibute",        icon: List },
      { title: "Valores",     url: "/dashboard/admin/list/attibute-value",  icon: Boxes },
    ],
  },
  {
    label: "Inventario",
    items: [
      { title: "Productos",  url: "/dashboard/admin/list/product",         icon: PackageSearch },
      { title: "Variantes",  url: "/dashboard/admin/list/product-variant", icon: Layers },
    ],
  },
  {
    label: "Operaciones",
    items: [
      { title: "Formularios",  url: "/dashboard/admin/list/shipping",   icon: FileText },
      { title: "Órdenes",      url: "/dashboard/admin/list/order",      icon: ClipboardList },
      { title: "Envíos",       url: "/dashboard/admin/list/shipment",   icon: Truck },
      { title: "Devoluciones", url: "/dashboard/admin/list/return",     icon: RotateCcw },
    ],
  },
  {
    label: "Análisis",
    items: [
      { title: "Reportes", url: "/dashboard/admin/reports", icon: BarChart3 },
    ],
  },
  {
    label: "Administración",
    superAdminOnly: true,
    items: [
      { title: "Usuarios",  url: "/dashboard/admin/list/users",       icon: Users },
      { title: "Permisos",  url: "/dashboard/admin/list/permissions", icon: KeyRound },
    ],
  },
];

export default function AppSidebar({ open, setOpen }) {
  const location = useLocation();
  const user     = JSON.parse(localStorage.getItem("user") || "null");
  const isSuperAdmin = user?.role === "super_admin";

  const sections = ALL_SECTIONS.filter((s) => !s.superAdminOnly || isSuperAdmin);

  return (
    <>
      {/* BACKDROP MOBILE */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
        />
      )}

      <aside
        className={`
          fixed md:sticky md:top-0 top-0 left-0 z-50 h-full md:h-screen w-64 flex flex-col
          bg-slate-900 text-slate-100
          transform transition-transform duration-300 ease-in-out
          md:translate-x-0
          ${open ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* HEADER / BRAND */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-700/60">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-indigo-600 shadow-lg shadow-indigo-900/50">
            <ShieldCheck size={18} className="text-white" />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-bold text-white tracking-wide">Category Store</p>
            <p className="text-[10px] font-medium text-indigo-400 uppercase tracking-widest">Admin Panel</p>
          </div>
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-700">
          {sections.map((section) => (
            <div key={section.label}>
              <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                {section.label}
              </p>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const active = location.pathname === item.url;

                  return (
                    <Link
                      key={item.url}
                      to={item.url}
                      onClick={() => setOpen(false)}
                      className={`
                        group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                        transition-all duration-150
                        ${active
                          ? "bg-indigo-600 text-white shadow-md shadow-indigo-900/40"
                          : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"}
                      `}
                    >
                      <Icon
                        size={16}
                        className={`shrink-0 transition-colors ${active ? "text-indigo-200" : "text-slate-500 group-hover:text-slate-300"}`}
                      />
                      <span className="flex-1">{item.title}</span>
                      {active && (
                        <ChevronRight size={14} className="text-indigo-300 opacity-70" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* FOOTER */}
        <div className="px-3 py-3 border-t border-slate-700/60">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-slate-800/60">
            <div className="flex items-center justify-center w-7 h-7 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 text-xs font-bold">
              A
            </div>
            <div className="leading-tight min-w-0">
              <p className="text-xs font-semibold text-slate-200 truncate">Administrador</p>
              <p className="text-[10px] text-slate-500 truncate flex items-center gap-1">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" />
                Sesión activa
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
