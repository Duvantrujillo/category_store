import { useState } from "react";
import HomeHeader from "./components/header/HomeHeader";
import HomeCategorySection from "./components/categories/HomeCategorySection";
import HomeProductGrid from "./components/products/HomeProductGrid";
import HomeCart from "./components/cart/HomeCart";
import HomeWishlist from "./components/wishlist/HomeWishlist";
import HomeFooter from "./components/footer/HomeFooter";
import HomeHeroCarousel from "./components/hero/HomeHeroCarousel";
import HomeBrandMarquee from "./components/brands/HomeBrandMarquee";
import { useHomeCategories } from "./hooks/useHomeCategories";
import { useHomeBrands } from "./hooks/useHomeBrands";
import { useHomeProducts } from "./hooks/useHomeProducts";
import { usePublicCart } from "./hooks/usePublicCart";

export default function Home() {
  const [wishlistOpen, setWishlistOpen]   = useState(false);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [search, setSearch]               = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);

  const { categories, loading: loadingCats }     = useHomeCategories();
  const { brands }                               = useHomeBrands();
  const { variants, loading: loadingVariants }   = useHomeProducts(search, selectedCategory);

  const {
    cartItems,
    cartOpen,
    setCartOpen,
    addToCart,
    updateQty,
    removeFromCart,
  } = usePublicCart();

  const cartCount    = cartItems.reduce((sum, i) => sum + i.quantity, 0);
  const favoritedIds = new Set(wishlistItems.map((v) => v.id));
  const cartQtyById  = Object.fromEntries(cartItems.map((i) => [i.variant.id, i.quantity]));

  function handleToggleFavorite(variant) {
    setWishlistItems((prev) =>
      prev.some((v) => v.id === variant.id)
        ? prev.filter((v) => v.id !== variant.id)
        : [...prev, variant]
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <HomeHeader
        cartCount={cartCount}
        onCartOpen={() => setCartOpen(true)}
        wishlistCount={wishlistItems.length}
        onWishlistOpen={() => setWishlistOpen(true)}
        onSearch={setSearch}
      />

      {/* Secciones full-width: sin contenedor lateral */}
      <HomeHeroCarousel />
      <HomeBrandMarquee brands={brands} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <HomeCategorySection
          categories={categories}
          loading={loadingCats}
          selected={selectedCategory}
          onSelect={setSelectedCategory}
        />
        <HomeProductGrid
          variants={variants}
          loading={loadingVariants}
          search={search}
          onAddToCart={addToCart}
          onToggleFavorite={handleToggleFavorite}
          favoritedIds={favoritedIds}
          cartQtyById={cartQtyById}
        />
      </main>

      <HomeFooter />

      <HomeWishlist
        open={wishlistOpen}
        onClose={() => setWishlistOpen(false)}
        items={wishlistItems}
        onRemove={(id) => setWishlistItems((p) => p.filter((v) => v.id !== id))}
        onAddToCart={(variant) => { addToCart(variant); setWishlistOpen(false); }}
      />

      <HomeCart
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        items={cartItems}
        onRemove={removeFromCart}
        onUpdateQty={updateQty}
      />
    </div>
  );
}
