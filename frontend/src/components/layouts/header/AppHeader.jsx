import { Menu, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import profile from "@/assets/icons/profile.png";

export default function AppHeader({ onToggleSidebar }) {
  return (
    <header className="h-16 border-b bg-white px-4 flex items-center justify-between">

      <div className="flex items-center gap-3">

        {/* BOTÓN MOBILE */}
        <Button
          variant="outline"
          size="icon"
          className="md:hidden"
          onClick={onToggleSidebar}
        >
          <Menu className="w-5 h-5" />
        </Button>

        <h1 className="font-semibold">Dashboard</h1>
      </div>

      <div className="flex items-center gap-4">
        <Bell className="w-5 h-5" />

        <img src={profile} className="w-8 h-8 rounded-full" />
      </div>

    </header>
  );
}