import { useParams, useNavigate } from "react-router-dom";
import { PackageX, ArrowLeft } from "lucide-react";
import HomeHeader from "../header/HomeHeader";
import HomeFooter from "../footer/HomeFooter";
import HomeCart from "../cart/HomeCart";
import HomeWishlist from "../wishlist/HomeWishlist";
import { usePublicCart } from "../../hooks/usePublicCart";
import { usePublicWishlist } from "../../hooks/usePublicWishlist";
import { useProductVariant } from "../../hooks/useProductVariant";
import ProductDetailGallery from "./ProductDetailGallery";
import ProductDetailDescription from "./ProductDetailDescription";
import ProductDetailBrand from "./ProductDetailBrand";
import ProductDetailAttributes from "./ProductDetailAttributes";
import ProductDetailPrice from "./ProductDetailPrice";
import ProductDetailActions from "./ProductDetailActions";
import RelatedProductsSection from "./related/RelatedProductsSection";

export default function ProductDetail() {
  const { id }   = useParams();
  const navigate = useNavigate();

  const { variant, loading, notFound } = useProductVariant(id);

  const {
    cartItems, cartUuid, cartOpen, setCartOpen,
    addToCart, updateQty, removeFromCart,
  } = usePublicCart();

  const {
    wishlistItems, wishlistOpen, setWishlistOpen,
    toggleFavorite, removeFromWishlist,
  } = usePublicWishlist(cartUuid);

  const cartCount    = cartItems.reduce((sum, i) => sum + i.quantity, 0);
  const cartQtyById  = Object.fromEntries(cartItems.map((i) => [i.variant.id, i.quantity]));
  const favoritedIds = new Set(wishlistItems.map((v) => v.id));

  if (loading) return (
    <div className="min-h-screen bg-neutral-50">
      <HomeHeader cartCount={0} onCartOpen={() => {}} wishlistCount={0} onWishlistOpen={() => {}} onSearch={() => {}} />
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-4 border-rose-200 border-t-rose-500 animate-spin" />
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Cargando producto…</p>
        </div>
      </div>
    </div>
  );

  if (notFound || !variant) return (
    <div className="min-h-screen bg-neutral-50">
      <HomeHeader cartCount={0} onCartOpen={() => {}} wishlistCount={0} onWishlistOpen={() => {}} onSearch={() => {}} />
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-5">
        <PackageX size={52} className="text-gray-300" />
        <div className="text-center">
          <p className="text-lg font-bold text-gray-700 mb-1">Producto no encontrado</p>
          <p className="text-sm text-gray-400">El artículo que buscas no está disponible.</p>
        </div>
        <button
          onClick={() => navigate("/")}
          className="mt-2 px-6 py-2.5 rounded-full bg-rose-500 text-white text-sm font-semibold hover:bg-rose-600 transition-colors"
        >
          Volver a la tienda
        </button>
      </div>
    </div>
  );

  const { product, price, stock, attributes, images } = variant;
  const outOfStock = !stock || Number(stock) === 0;
  const cartQty    = cartQtyById[variant.id] ?? 0;
  const atLimit    = !outOfStock && cartQty >= Number(stock);
  const isFav      = favoritedIds.has(variant.id);

  return (
    <div className="min-h-screen bg-neutral-50">
      <HomeHeader
        cartCount={cartCount}
        onCartOpen={() => setCartOpen(true)}
        wishlistCount={wishlistItems.length}
        onWishlistOpen={() => setWishlistOpen(true)}
        onSearch={(q) => navigate(`/?q=${encodeURIComponent(q)}`)}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">

        <button
          onClick={() => navigate(-1)}
          className="group inline-flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-gray-700 transition-colors mb-8"
        >
          <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform duration-150" />
          Volver
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 xl:gap-16 items-start">

          <div className="h-[400px] sm:h-[520px] lg:h-[640px] lg:sticky lg:top-8">
            <ProductDetailGallery images={images} />
          </div>

          <div className="flex flex-col gap-7">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight tracking-tight">
              {product?.name}
            </h1>
            <ProductDetailDescription product={product} />
            <ProductDetailBrand brand={product?.brand} />
            <ProductDetailAttributes attributes={attributes} />
            <ProductDetailPrice price={price} stock={stock} outOfStock={outOfStock} />
            <ProductDetailActions
              variant={variant}
              outOfStock={outOfStock}
              atLimit={atLimit}
              isFav={isFav}
              onAddToCart={addToCart}
              onToggleFavorite={toggleFavorite}
            />
          </div>

        </div>
      </main>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="h-px bg-gray-100 mb-12" />
        <RelatedProductsSection
          currentVariantId={variant.id}
          brandId={product?.brand?.id}
          brandName={product?.brand?.name}
          categoryId={product?.category?.id}
          categoryName={product?.category?.name}
          onAddToCart={addToCart}
          onToggleFavorite={toggleFavorite}
          favoritedIds={favoritedIds}
          cartQtyById={cartQtyById}
        />
      </div>

      <HomeFooter />

      <HomeCart
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        items={cartItems}
        onRemove={removeFromCart}
        onUpdateQty={updateQty}
        onCheckout={() => { setCartOpen(false); navigate("/checkout"); }}
      />

      <HomeWishlist
        open={wishlistOpen}
        onClose={() => setWishlistOpen(false)}
        items={wishlistItems}
        onRemove={removeFromWishlist}
        onAddToCart={(v) => { addToCart(v); setWishlistOpen(false); }}
      />
    </div>
  );
}
