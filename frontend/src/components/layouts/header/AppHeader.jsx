import { useState, useRef, useEffect } from "react";
import { Menu, Search, ChevronDown, LogOut } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import NotificationPanel from "./NotificationPanel";

const routeTitles = {
  "/dashboard/admin":                      { label: "Dashboard",     sub: "Panel de administración" },
  "/dashboard/admin/list/category":        { label: "Categorías",    sub: "Gestión de categorías" },
  "/dashboard/admin/list/brand":           { label: "Marcas",        sub: "Gestión de marcas" },
  "/dashboard/admin/list/attibute":        { label: "Atributos",     sub: "Gestión de atributos" },
  "/dashboard/admin/list/attibute-value":  { label: "Valores",       sub: "Gestión de valores" },
  "/dashboard/admin/list/shipping":        { label: "Formularios",   sub: "Formularios de envío" },
  "/dashboard/admin/list/product":         { label: "Productos",     sub: "Gestión de productos" },
  "/dashboard/admin/list/product-variant": { label: "Variantes",     sub: "Variantes de producto" },
  "/dashboard/admin/list/order":           { label: "Órdenes",       sub: "Gestión de pedidos" },
  "/dashboard/admin/list/shipment":        { label: "Envíos",        sub: "Seguimiento de envíos" },
  "/dashboard/admin/list/return":          { label: "Devoluciones",  sub: "Gestión de devoluciones" },
};

export default function AppHeader({ onToggleSidebar }) {
  const location  = useLocation();
  const { logout } = useAuth();
  const page = routeTitles[location.pathname] ?? { label: "Dashboard", sub: "Panel de administración" };

  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  return (
    <header className="h-16 bg-white border-b border-slate-200 shadow-sm px-4 md:px-6">
      <div className="flex items-center h-full gap-4">

        {/* ── IZQUIERDA: toggle mobile + título ── */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onToggleSidebar}
            className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <Menu size={20} />
          </button>

          <div className="leading-tight">
            <h1 className="text-sm font-bold text-slate-800 leading-none">{page.label}</h1>
            <p className="text-[11px] text-slate-400 mt-0.5 hidden sm:block">{page.sub}</p>
          </div>
        </div>

        {/* ── CENTRO: buscador ── */}
        <div className="hidden sm:flex flex-1 justify-center px-2">
          <div className="flex items-center gap-2.5 w-full max-w-md h-9 px-3.5 rounded-xl bg-slate-100 text-slate-400 text-sm cursor-text hover:bg-slate-200/80 transition-colors border border-transparent hover:border-slate-200">
            <Search size={14} className="shrink-0" />
            <span className="text-[13px]">Buscar en el panel…</span>
            <span className="ml-auto hidden sm:flex items-center gap-1 text-[11px] bg-white border border-slate-200 rounded-md px-1.5 py-0.5 text-slate-400 font-mono shadow-sm">
              ⌘K
            </span>
          </div>
        </div>

        {/* ── DERECHA: notificaciones + perfil ── */}
        <div className="flex items-center gap-1.5 shrink-0 ml-auto">

          <NotificationPanel />

          {/* Separador */}
          <div className="h-5 w-px bg-slate-200 mx-1" />

          {/* Perfil con dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen((v) => !v)}
              className="flex items-center gap-2.5 pl-1 pr-2.5 py-1.5 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <div className="flex items-center justify-center w-7 h-7 rounded-full bg-linear-to-br from-indigo-500 to-indigo-700 text-white text-xs font-bold shadow-sm">
                A
              </div>
              <div className="hidden sm:block leading-tight text-left">
                <p className="text-xs font-semibold text-slate-800">Administrador</p>
                <p className="text-[10px] text-slate-400 leading-none mt-0.5">Admin</p>
              </div>
              <ChevronDown
                size={12}
                className={`hidden sm:block text-slate-400 transition-transform duration-200 ${profileOpen ? "rotate-180" : ""}`}
              />
            </button>

            {profileOpen && (
              <div className="absolute right-0 top-11 w-48 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 overflow-hidden py-1">
                <button
                  onClick={() => { setProfileOpen(false); logout(); }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={15} />
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}
