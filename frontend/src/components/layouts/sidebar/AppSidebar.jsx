import { Link, useLocation } from "react-router-dom";
import adminIcon from "@/assets/icons/admin.png";
import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarSeparator,
} from "@/components/ui/sidebar";

import {
  LayoutGrid,
  Tags,
  List,
  Package,
  Truck,
  PackageSearch 
} from "lucide-react";

export default function AppSidebar() {
  const location = useLocation();

  const items = [
    { title: "Categorías", url: "/dashboard/admin/list/category", icon: LayoutGrid },
    { title: "Marcas", url: "/dashboard/admin/list/brand", icon: Tags },
    { title: "Atributos", url: "/dashboard/admin/list/attibute", icon: List },
    { title: "Valores de Atributo", url: "/dashboard/admin/list/attibute-value", icon: Package },
    { title: "Envíos", url: "/dashboard/admin/list/shipping", icon: Truck },
    { title: "Productos", url: "/dashboard/admin/list/product", icon: PackageSearch  },
    { title: "Productos Variantes", url: "/dashboard/admin/list/product-variant", icon: PackageSearch  },
  ];

  return (
    <Sidebar>
      <SidebarContent className="p-2">

        {/* Header */}
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            <img src={adminIcon} alt="Admin" className="h-4 w-4 object-contain" />
            <span>ADMIN PANEL</span>
          </SidebarGroupLabel>
        </SidebarGroup>

        <SidebarSeparator />

        {/* Menu */}
        <SidebarMenu>
          {items.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.url;

            return (
              <SidebarMenuItem key={item.url}>
                <Link
                  to={item.url}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-lg transition-colors
                    ${active
                      ? "bg-blue-500 text-white font-medium"      // Seleccionado
                      : "text-muted-foreground hover:bg-blue-50 hover:text-blue-600" // Hover sutil
                    }
                  `}
                >
                  <Icon size={18} className={active ? "text-white" : "text-blue-600"} />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>

      </SidebarContent>
    </Sidebar>
  );
}