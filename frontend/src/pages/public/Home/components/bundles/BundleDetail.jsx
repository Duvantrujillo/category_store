import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PackageX, ArrowLeft, ShoppingBag, ChevronDown, ChevronUp } from "lucide-react";
import HomeHeader from "../header/HomeHeader";
import HomeFooter from "../footer/HomeFooter";
import HomeCart from "../cart/HomeCart";
import HomeWishlist from "../wishlist/HomeWishlist";
import { usePublicCart, getBundleAvailableStock } from "../../hooks/usePublicCart";
import { usePublicWishlist } from "../../hooks/usePublicWishlist";
import { usePublicBundle } from "../../hooks/usePublicBundle";
import BundleDetailGallery from "./BundleDetailGallery";
import BundleDetailItem from "./BundleDetailItem";
import BundleVariantSelectorModal from "./BundleVariantSelectorModal";

const VISIBLE_ITEMS = 3;

export default function BundleDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const { bundle, loading, notFound } = usePublicBundle(slug);
  const [showSelector, setShowSelector] = useState(false);
  const [showAllItems, setShowAllItems] = useState(false);

  const {
    cartItems, cartBundleItems, cartUuid, cartOpen, setCartOpen,
    addToCart, updateQty, removeFromCart,
    addBundleToCart, updateBundleQty, removeBundleFromCart,
  } = usePublicCart();

  const {
    wishlistItems, wishlistOpen, setWishlistOpen,
    removeFromWishlist,
  } = usePublicWishlist(cartUuid);

  const cartCount = cartItems.reduce((s, i) => s + i.quantity, 0)
    + cartBundleItems.reduce((s, i) => s + i.quantity, 0);

  // ── Estados de carga / error ──────────────────────────────────────────────

  if (loading) return (
    <div className="min-h-screen bg-linear-to-b from-rose-100/40 via-pink-50/20 to-white">
      <HomeHeader cartCount={0} onCartOpen={() => {}} wishlistCount={0} onWishlistOpen={() => {}} onSearch={() => {}} />
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-4 border-rose-200 border-t-rose-500 animate-spin" />
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Cargando combo…</p>
        </div>
      </div>
    </div>
  );

  if (notFound || !bundle) return (
    <div className="min-h-screen bg-linear-to-b from-rose-100/40 via-pink-50/20 to-white">
      <HomeHeader cartCount={0} onCartOpen={() => {}} wishlistCount={0} onWishlistOpen={() => {}} onSearch={() => {}} />
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-5">
        <PackageX size={52} className="text-gray-300" />
        <div className="text-center">
          <p className="text-lg font-bold text-gray-700 mb-1">Combo no encontrado</p>
          <p className="text-sm text-gray-400">El combo que buscas no está disponible.</p>
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

  const hasFreeSlots = bundle.items?.some((item) => !item.productVariantId) ?? false;
  const cartQty = cartBundleItems.find((i) => i.bundle.id === bundle.id)?.quantity ?? 0;
  const available = getBundleAvailableStock(bundle);
  const outOfStock = available <= 0;
  const atLimit = !outOfStock && cartQty >= available;

  // Imagen del combo + principal/secundaria de cada producto que incluye
  const galleryImages = [
    ...(bundle.mainImage ? [{ imageUrl: bundle.mainImage }] : []),
    ...(bundle.items ?? []).flatMap((item) => {
      const variant = item.productVariantId
        ? item.productVariant
        : (item.product.variants.find((v) => Number(v.stock) >= item.quantity) ?? item.product.variants[0]);
      return (variant?.images ?? []).slice(0, 2);
    }),
  ];

  const visibleItems = showAllItems ? bundle.items : bundle.items?.slice(0, VISIBLE_ITEMS);
  const hiddenCount = Math.max(0, (bundle.items?.length ?? 0) - VISIBLE_ITEMS);

  function handleAddToCart() {
    if (outOfStock || atLimit) return;
    if (hasFreeSlots) {
      setShowSelector(true);
    } else {
      addBundleToCart(bundle, {});
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-rose-100/40 via-pink-50/20 to-white">
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 xl:gap-16 items-start">

          <div className="h-[380px] sm:h-[460px] md:h-[520px] lg:h-[620px] md:sticky md:top-8">
            <BundleDetailGallery images={galleryImages} />
          </div>

          <div className="flex flex-col gap-7">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-rose-400">Combo</span>
              <h1
                className="text-3xl sm:text-4xl font-black leading-tight mt-1"
                style={{ color: "#4b5563", WebkitTextStroke: "1.5px #4b5563", letterSpacing: "0.1em" }}
              >
                {bundle.name}
              </h1>
            </div>

            {bundle.description && (
              <p className="text-sm text-gray-500 leading-relaxed">{bundle.description}</p>
            )}

            <p className="text-2xl sm:text-3xl font-bold text-gray-800">
              ${Number(bundle.price).toLocaleString("es-CO")}{" "}
              <span className="text-xs font-normal text-gray-400">COP</span>
            </p>

            <div className="flex flex-col gap-3">
              <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">
                Incluye {bundle.items?.length ?? 0} producto{(bundle.items?.length ?? 0) === 1 ? "" : "s"}
              </p>
              <div className="flex flex-col gap-2">
                {visibleItems?.map((item) => (
                  <BundleDetailItem key={item.id} item={item} />
                ))}
              </div>
              {hiddenCount > 0 && (
                <button
                  type="button"
                  onClick={() => setShowAllItems((v) => !v)}
                  className="flex items-center justify-center gap-1.5 text-xs font-semibold text-rose-500 hover:text-rose-600 transition-colors py-1"
                >
                  {showAllItems ? (
                    <>Ver menos <ChevronUp size={14} /></>
                  ) : (
                    <>Ver {hiddenCount} más <ChevronDown size={14} /></>
                  )}
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={handleAddToCart}
              disabled={outOfStock || atLimit}
              className={`w-full h-12 rounded-xl flex items-center justify-center gap-2.5 text-white text-xs font-bold tracking-widest uppercase transition-colors disabled:cursor-not-allowed ${
                outOfStock
                  ? "bg-gray-400/90 disabled:opacity-100"
                  : "bg-rose-500 hover:bg-rose-600 active:bg-rose-700 disabled:opacity-50"
              }`}
            >
              <ShoppingBag size={15} />
              {outOfStock ? "Agotado" : atLimit ? "Límite de stock" : "Agregar al carrito"}
            </button>
          </div>

        </div>
      </main>

      <HomeFooter />

      <HomeCart
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        items={cartItems}
        onRemove={removeFromCart}
        onUpdateQty={updateQty}
        bundleItems={cartBundleItems}
        onRemoveBundle={removeBundleFromCart}
        onUpdateBundleQty={updateBundleQty}
        onCheckout={() => { setCartOpen(false); navigate("/checkout"); }}
      />

      <HomeWishlist
        open={wishlistOpen}
        onClose={() => setWishlistOpen(false)}
        items={wishlistItems}
        onRemove={removeFromWishlist}
        onAddToCart={(v) => { addToCart(v); setWishlistOpen(false); }}
      />

      {showSelector && (
        <BundleVariantSelectorModal
          bundle={bundle}
          onClose={() => setShowSelector(false)}
          onConfirm={(selections) => addBundleToCart(bundle, selections)}
        />
      )}
    </div>
  );
}
