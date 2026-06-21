import { useState, useRef, useEffect } from "react";
import {
  Menu, Search, ChevronDown, LogOut,
  LayoutDashboard, Tag, Bookmark, SlidersHorizontal, Hash,
  ClipboardList, Package, Boxes, ShoppingCart, Truck, RotateCcw, Users,
} from "lucide-react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import NotificationPanel from "./NotificationPanel";
import SearchModal from "./SearchModal";

const routeTitles = {
  "/dashboard/admin":                      { label: "Dashboard",     sub: "Panel de administración", Icon: LayoutDashboard },
  "/dashboard/admin/list/category":        { label: "Categorías",    sub: "Gestión de categorías",   Icon: Tag },
  "/dashboard/admin/list/brand":           { label: "Marcas",        sub: "Gestión de marcas",        Icon: Bookmark },
  "/dashboard/admin/list/attibute":        { label: "Atributos",     sub: "Gestión de atributos",     Icon: SlidersHorizontal },
  "/dashboard/admin/list/attibute-value":  { label: "Valores",       sub: "Gestión de valores",       Icon: Hash },
  "/dashboard/admin/list/shipping":        { label: "Formularios",   sub: "Formularios de envío",     Icon: ClipboardList },
  "/dashboard/admin/list/product":         { label: "Productos",     sub: "Gestión de productos",     Icon: Package },
  "/dashboard/admin/list/product-variant": { label: "Variantes",     sub: "Variantes de producto",    Icon: Boxes },
  "/dashboard/admin/list/order":           { label: "Órdenes",       sub: "Gestión de pedidos",       Icon: ShoppingCart },
  "/dashboard/admin/list/shipment":        { label: "Envíos",        sub: "Seguimiento de envíos",    Icon: Truck },
  "/dashboard/admin/list/return":          { label: "Devoluciones",  sub: "Gestión de devoluciones",  Icon: RotateCcw },
  "/dashboard/admin/list/users":           { label: "Usuarios",      sub: "Gestión de usuarios",      Icon: Users },
};

function getInitials(name = "") {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

export default function AppHeader({ onToggleSidebar }) {
  const location  = useLocation();
  const { logout } = useAuth();
  const page = routeTitles[location.pathname] ?? { label: "Dashboard", sub: "Panel de administración", Icon: LayoutDashboard };

  const [profileOpen, setProfileOpen] = useState(false);
  const [searchOpen, setSearchOpen]   = useState(false);
  const profileRef = useRef(null);

  const user = (() => {
    try { return JSON.parse(localStorage.getItem("user") || "{}"); }
    catch { return {}; }
  })();

  const displayName = user.name || "Administrador";
  const displayRole = user.role === "admin" ? "Administrador" : (user.role || "Admin");
  const initials    = getInitials(displayName);

  // Cierra dropdown al hacer clic fuera
  useEffect(() => {
    const handle = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  // Atajo de teclado ⌘K / Ctrl+K
  useEffect(() => {
    const handle = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
    };
    document.addEventListener("keydown", handle);
    return () => document.removeEventListener("keydown", handle);
  }, []);

  return (
    <>
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />

      <header className="h-16 bg-white border-b border-slate-200 shadow-sm px-4 md:px-6">
        <div className="flex items-center h-full gap-4">

          {/* IZQUIERDA: toggle mobile + título de página */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onToggleSidebar}
              className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
            >
              <Menu size={20} />
            </button>

            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 shrink-0">
              <page.Icon size={16} />
            </div>
          </div>

          {/* CENTRO: buscador — abre modal al hacer clic */}
          <div className="hidden sm:flex flex-1 justify-center px-2">
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2.5 w-full max-w-md h-9 px-3.5 rounded-xl bg-slate-100 text-slate-400 text-sm cursor-pointer hover:bg-slate-200/80 hover:text-slate-500 transition-colors border border-transparent hover:border-slate-200 group"
            >
              <Search size={14} className="shrink-0" />
              <span className="text-[13px] flex-1 text-left">Buscar en el panel…</span>
              <span className="flex items-center gap-0.5 text-[11px] bg-white border border-slate-200 rounded-md px-1.5 py-0.5 text-slate-400 font-mono shadow-sm group-hover:border-slate-300 transition-colors">
                ⌘K
              </span>
            </button>
          </div>

          {/* DERECHA: notificaciones + perfil */}
          <div className="flex items-center gap-1.5 shrink-0 ml-auto">

            <NotificationPanel />

            <div className="h-5 w-px bg-slate-200 mx-1" />

            {/* Perfil con dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen((v) => !v)}
                className={`flex items-center gap-2.5 pl-1.5 pr-2.5 py-1.5 rounded-xl transition-colors ${
                  profileOpen ? "bg-slate-100" : "hover:bg-slate-100"
                }`}
              >
                {/* Avatar */}
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-linear-to-br from-indigo-500 to-indigo-700 text-white text-xs font-bold shadow-sm shrink-0 select-none">
                  {initials || "A"}
                </div>

                {/* Nombre + rol */}
                <div className="hidden sm:block leading-tight text-left">
                  <p className="text-[13px] font-semibold text-slate-800 leading-none">{displayName}</p>
                  <span className="inline-flex items-center mt-1 px-1.5 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-wide bg-indigo-50 text-indigo-600 leading-none">
                    {displayRole}
                  </span>
                </div>

                <ChevronDown
                  size={13}
                  className={`hidden sm:block text-slate-400 transition-transform duration-200 ml-0.5 ${
                    profileOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Dropdown */}
              {profileOpen && (
                <div className="absolute right-0 top-12 w-56 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden">
                  {/* Cabecera del dropdown */}
                  <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/60">
                    <div className="flex items-center gap-2.5">
                      <div className="flex items-center justify-center w-9 h-9 rounded-full bg-linear-to-br from-indigo-500 to-indigo-700 text-white text-sm font-bold shrink-0 select-none">
                        {initials || "A"}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate">{displayName}</p>
                        {user.email && (
                          <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="py-1">
                    <div className="px-4 py-2 flex items-center gap-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide bg-indigo-50 text-indigo-600">
                        {displayRole}
                      </span>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        · <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" /> Sesión activa
                      </span>
                    </div>

                    <div className="h-px bg-slate-100 mx-2 my-1" />

                    <button
                      onClick={() => { setProfileOpen(false); logout(); }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut size={15} />
                      Cerrar sesión
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </header>
    </>
  );
}
