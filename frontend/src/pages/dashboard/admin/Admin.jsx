import { Outlet } from "react-router-dom";
import { useState } from "react";

import AppHeader from "@/components/layouts/header/AppHeader";
import AppSidebar from "@/components/layouts/sidebar/AppSidebar";

export default function Admin() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen w-full">

      {/* SIDEBAR */}
      <AppSidebar open={open} setOpen={setOpen} />

      {/* CONTENIDO */}
      <div className="flex flex-1 flex-col min-w-0 bg-gray-50">

        <div className="sticky top-0 z-40">
          <AppHeader onToggleSidebar={() => setOpen(!open)} />
        </div>

        <main className="flex-1 px-4 pt-0 pb-6 md:px-6 md:pb-6">
          <Outlet />
        </main>

      </div>
    </div>
  );
}