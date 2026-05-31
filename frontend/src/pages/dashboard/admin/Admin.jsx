import { Outlet } from "react-router-dom";
import AppSidebar from "@/components/layouts/sidebar/AppSidebar";
import {
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

export default function Admin() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">

        <AppSidebar />

        <main className="flex-1 min-w-0 bg-gray-50 pl-0 md:pl-6">

          <div className="md:hidden p-2">
            <SidebarTrigger />
          </div>

          {/* 🔥 RESPONSIVE REAL */}
          <div className="px-4 py-6 md:p-6 max-w-6xl mx-auto w-full">
            <Outlet />
          </div>

        </main>

      </div>
    </SidebarProvider>
  );
}