import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const SS_PARENT   = "home_sel_parent";
const SS_CATEGORY = "home_sel_category";

function readSession(key) {
  try { const v = sessionStorage.getItem(key); return v ? JSON.parse(v) : null; } catch { return null; }
}
function writeSession(key, value) {
  try {
    if (value !== null && value !== undefined) sessionStorage.setItem(key, JSON.stringify(value));
    else sessionStorage.removeItem(key);
  } catch {}
}
import HomeHeader from "./components/header/HomeHeader";
import HomeCategorySection from "./components/categories/HomeCategorySection";
import HomeProductGrid from "./components/products/HomeProductGrid";
import HomeProductRow from "./components/products/HomeProductRow";
import HomeCart from "./components/cart/HomeCart";
import HomeWishlist from "./components/wishlist/HomeWishlist";
import HomeFooter from "./components/footer/HomeFooter";
import HomeHeroCarousel from "./components/hero/HomeHeroCarousel";
import HomeBrandMarquee from "./components/brands/HomeBrandMarquee";
import { useHomeCategories } from "./hooks/useHomeCategories";
import { useHomeBrands } from "./hooks/useHomeBrands";
import { useHomeProducts } from "./hooks/useHomeProducts";
import { useHomeShowcase } from "./hooks/useHomeShowcase";
import { usePublicCart } from "./hooks/usePublicCart";
import { usePublicWishlist } from "./hooks/usePublicWishlist";
import { useTopSellers } from "./hooks/useTopSellers";

export default function Home() {
  const navigate = useNavigate();
  const [search, setSearch]               = useState("");
  const [selectedParent,   setSelectedParent]   = useState(() => readSession(SS_PARENT));
  const [selectedCategory, setSelectedCategory] = useState(() => readSession(SS_CATEGORY));

  // Persistir en sessionStorage cuando cambian
  useEffect(() => { writeSession(SS_PARENT,   selectedParent);   }, [selectedParent]);
  useEffect(() => { writeSession(SS_CATEGORY, selectedCategory); }, [selectedCategory]);

  const { categories, loading: loadingCats } = useHomeCategories();
  const { brands }                           = useHomeBrands();

  // IDs para filtrar productos
  const filterCategoryIds = selectedParent
    ? selectedCategory
      ? [selectedCategory]
      : [selectedParent.id, ...(selectedParent.children || []).map((c) => c.id)]
    : selectedCategory
      ? [selectedCategory]   // padre sin hijos seleccionado
      : null;                // sin filtro

  const { variants, loading: loadingVariants } = useHomeProducts(search, filterCategoryIds);

  // Las filas curadas por marca/categoría solo tienen sentido en la vista
  // por defecto — si el usuario está buscando o filtrando, no aplican.
  const showShowcase = !search && !selectedParent && !selectedCategory;
  const { groups: showcaseGroups } = useHomeShowcase(showShowcase);

  // Lo que muestra el carrusel: padres o hijos del padre seleccionado
  const displayCategories = selectedParent ? (selectedParent.children || []) : categories;

  function handleCategorySelect(catId) {
    // Botón "Todos"
    if (catId === null) {
      setSelectedCategory(null);
      return;
    }
    if (!selectedParent) {
      const cat = categories.find((c) => c.id === catId);
      if (!cat) return;
      if (cat.children && cat.children.length > 0) {
        // tiene hijos → entrar en vista de hijos
        setSelectedParent(cat);
        setSelectedCategory(null);
      } else {
        // sin hijos → solo filtrar, quedar en vista padres
        setSelectedCategory(catId === selectedCategory ? null : catId);
      }
    } else {
      setSelectedCategory(catId === selectedCategory ? null : catId);
    }
  }

  function handleBack() {
    setSelectedParent(null);
    setSelectedCategory(null);
  }

  function handleReset() {
    setSelectedParent(null);
    setSelectedCategory(null);
    setSearch("");
  }
  const { topSellerIds }                       = useTopSellers();

  const {
    cartItems,
    cartOpen,
    setCartOpen,
    addToCart,
    updateQty,
    removeFromCart,
    cartUuid,
  } = usePublicCart();

  const {
    wishlistItems,
    wishlistOpen,
    setWishlistOpen,
    toggleFavorite,
    removeFromWishlist,
  } = usePublicWishlist(cartUuid);

  const cartCount    = cartItems.reduce((sum, i) => sum + i.quantity, 0);
  const favoritedIds = new Set(wishlistItems.map((v) => v.id));
  const cartQtyById  = Object.fromEntries(cartItems.map((i) => [i.variant.id, i.quantity]));

  return (
    <div className="min-h-screen bg-white">
      <HomeHeader
        cartCount={cartCount}
        onCartOpen={() => setCartOpen(true)}
        wishlistCount={wishlistItems.length}
        onWishlistOpen={() => setWishlistOpen(true)}
        onSearch={setSearch}
        onLogoClick={handleReset}
      />

      {/* Hero sin fondo especial */}
      <HomeHeroCarousel />

      {/* Desde marcas hacia abajo: fondo desvanecido */}
      <div className="bg-linear-to-b from-rose-100/50 via-pink-50/25 to-white">
        <HomeBrandMarquee brands={brands} />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <HomeCategorySection
            categories={displayCategories}
            loading={loadingCats}
            selected={selectedCategory}
            onSelect={handleCategorySelect}
            selectedParent={selectedParent}
            onBack={handleBack}
          />

          {showShowcase && showcaseGroups.map((group) => (
            <HomeProductRow
              key={`${group.type}-${group.id}`}
              title={group.title}
              variants={group.variants}
              onAddToCart={addToCart}
              onToggleFavorite={toggleFavorite}
              favoritedIds={favoritedIds}
              cartQtyById={cartQtyById}
              topSellerIds={topSellerIds}
            />
          ))}

          <HomeProductGrid
            variants={variants}
            loading={loadingVariants}
            search={search}
            selectedCategory={selectedCategory}
            onAddToCart={addToCart}
            onToggleFavorite={toggleFavorite}
            favoritedIds={favoritedIds}
            cartQtyById={cartQtyById}
            topSellerIds={topSellerIds}
          />
        </main>
      </div>

      <HomeFooter />

      <HomeWishlist
        open={wishlistOpen}
        onClose={() => setWishlistOpen(false)}
        items={wishlistItems}
        onRemove={removeFromWishlist}
        onAddToCart={(variant) => { addToCart(variant); setWishlistOpen(false); }}
      />

      <HomeCart
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        items={cartItems}
        onRemove={removeFromCart}
        onUpdateQty={updateQty}
        onCheckout={() => { setCartOpen(false); navigate("/checkout"); }}
      />
    </div>
  );
}
