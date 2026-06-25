import { useState } from "react";
import { Search } from "lucide-react";
import HomeNavLogo from "./HomeNavLogo";
import HomeNavSearch from "./HomeNavSearch";
import HomeCartButton from "./HomeCartButton";
import HomeWishlistButton from "./HomeWishlistButton";

export default function HomeHeader({ cartCount = 0, onCartOpen, wishlistCount = 0, onWishlistOpen, onSearch }) {
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 h-16 bg-rose-300/75 backdrop-blur-sm border-b border-rose-400/20 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center h-full gap-4">

        <HomeNavLogo />

        <HomeNavSearch
          onSearch={onSearch}
          mobileOpen={mobileSearchOpen}
          onMobileClose={() => setMobileSearchOpen(false)}
        />

        <div className="flex items-center gap-1 ml-auto shrink-0">
          {/* Icono de búsqueda — solo en móvil */}
          <button
            onClick={() => setMobileSearchOpen(true)}
            className="sm:hidden flex items-center justify-center w-10 h-10 rounded-xl text-white hover:bg-white/20 transition-colors"
            aria-label="Buscar"
          >
            <Search size={20} strokeWidth={2.5} />
          </button>

          <HomeWishlistButton count={wishlistCount} onClick={onWishlistOpen} />
          <HomeCartButton count={cartCount} onClick={onCartOpen} />
        </div>

      </div>
    </header>
  );
}
