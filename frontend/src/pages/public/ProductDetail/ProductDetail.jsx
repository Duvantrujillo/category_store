import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ShoppingBag, PackageX, Tag, Barcode, ArrowLeft, ChevronDown } from "lucide-react";
import HomeHeader from "../Home/components/header/HomeHeader";
import HomeFooter from "../Home/components/footer/HomeFooter";
import HomeCart from "../Home/components/cart/HomeCart";
import HomeWishlist from "../Home/components/wishlist/HomeWishlist";
import { usePublicCart } from "../Home/hooks/usePublicCart";
import { usePublicWishlist } from "../Home/hooks/usePublicWishlist";
import RelatedProductsSection from "./components/related/RelatedProductsSection";
import noPhotos from "@/assets/icons/no-fotos.png";

const API = import.meta.env.VITE_API_URL;

function url(path) {
  return path ? `${API}${path}` : null;
}

function groupAttributes(attributes = []) {
  const map = {};
  attributes.forEach((a) => {
    const name = a.attributeValue?.attribute?.name ?? "Otro";
    if (!map[name]) map[name] = [];
    map[name].push(a.attributeValue?.value ?? "—");
  });
  return map;
}

/* ── Galería ── */
function Gallery({ images = [] }) {
  const sorted  = [...images].sort((a, b) => Number(a.slot) - Number(b.slot));
  const initial = sorted[0]?.imageUrl ?? null;
  const [active, setActive] = useState(initial);
  const activeSrc = url(active) ?? noPhotos;

  return (
    <div className="flex flex-col sm:flex-row gap-3 h-full">
      {sorted.length > 1 && (
        <div className="order-2 sm:order-1 flex flex-row sm:flex-col gap-2 overflow-x-auto sm:overflow-y-auto sm:overflow-x-hidden sm:w-[80px] pb-1 sm:pb-0 sm:pr-1">
          {sorted.map((img) => {
            const src   = url(img.imageUrl) ?? noPhotos;
            const isAct = active === img.imageUrl;
            return (
              <button
                key={img.slot}
                onClick={() => setActive(img.imageUrl)}
                className={`shrink-0 w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                  isAct
                    ? "border-rose-500 shadow-md scale-105"
                    : "border-gray-200 hover:border-rose-300 opacity-55 hover:opacity-100"
                }`}
              >
                <img src={src} alt="" className="w-full h-full object-cover" />
              </button>
            );
          })}
        </div>
      )}
      <div className="order-1 sm:order-2 flex-1 relative rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm min-h-[300px] sm:min-h-0">
        <img
          key={active}
          src={activeSrc}
          alt="Producto"
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
}

/* ── Página principal ── */
export default function ProductDetail() {
  const { id }   = useParams();
  const navigate = useNavigate();

  const [variant, setVariant]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [notFound, setNotFound] = useState(false);


  const {
    cartItems,
    cartUuid,
    cartOpen,
    setCartOpen,
    addToCart,
    updateQty,
    removeFromCart,
  } = usePublicCart();

  const {
    wishlistItems,
    wishlistOpen,
    setWishlistOpen,
    toggleFavorite,
    removeFromWishlist,
  } = usePublicWishlist(cartUuid);

  const cartCount    = cartItems.reduce((sum, i) => sum + i.quantity, 0);
  const cartQtyById  = Object.fromEntries(cartItems.map((i) => [i.variant.id, i.quantity]));
  const favoritedIds = new Set(wishlistItems.map((v) => v.id));

  useEffect(() => {
    setLoading(true);
    fetch(`${API}/product-variant/public/${id}`)
      .then((r) => {
        if (r.status === 404) { setNotFound(true); return null; }
        return r.json();
      })
      .then((data) => { if (data) setVariant(data); })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);


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

  const { product, price, stock, attributes, images, sku, barcode } = variant;
  const outOfStock  = !stock || Number(stock) === 0;
  const cartQty     = cartQtyById[variant.id] ?? 0;
  const atLimit     = !outOfStock && cartQty >= Number(stock);
  const attrGroups  = groupAttributes(attributes);
  const brandLogoSrc = product?.brand?.logoUrl ? url(product.brand.logoUrl) : null;
  const isFav       = favoritedIds.has(variant.id);

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

        {/* Navegación */}
        <button
          onClick={() => navigate(-1)}
          className="group inline-flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-gray-700 transition-colors mb-8"
        >
          <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform duration-150" />
          Volver
        </button>

        {/* Layout principal */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 xl:gap-16 items-start">

          {/* ── Galería ── */}
          <div className="h-[400px] sm:h-[520px] lg:h-[640px] lg:sticky lg:top-8">
            <Gallery images={images} />
          </div>

          {/* ── Información ── */}
          <div className="flex flex-col gap-7">

            {/* Marca + Categoría */}
            <div className="flex items-center gap-3 flex-wrap">
              {product?.brand && (
                <div className="flex items-center gap-2">
                  {brandLogoSrc && (
                    <img
                      src={brandLogoSrc}
                      alt={product.brand.name}
                      className="w-7 h-7 rounded-md object-contain border border-gray-100"
                      onError={(e) => { e.currentTarget.style.display = "none"; }}
                    />
                  )}
                  <span className="text-[11px] font-black uppercase tracking-[0.22em] text-rose-500">
                    {product.brand.name}
                  </span>
                </div>
              )}
              {product?.category?.name && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-rose-50 text-rose-500 border border-rose-100">
                  <Tag size={9} />
                  {product.category.name}
                </span>
              )}
            </div>

            {/* Nombre del producto */}
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight tracking-tight">
                {product?.name}
              </h1>
              {product?.shortDescription && (
                <p className="mt-3 text-base text-gray-500 leading-relaxed font-normal">
                  {product.shortDescription}
                </p>
              )}
            </div>

            {/* Atributos */}
            {Object.keys(attrGroups).length > 0 && (
              <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5 flex flex-col gap-5">
                {Object.entries(attrGroups).map(([name, values]) => (
                  <div key={name}>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400 mb-2.5">
                      {name}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {values.map((v) => (
                        <span
                          key={v}
                          className="text-sm font-semibold px-4 py-1.5 rounded-full bg-gray-100 text-gray-700 border border-gray-200"
                        >
                          {v}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Precio + stock */}
            <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400 mb-1.5">
                    Precio
                  </p>
                  <p className="text-5xl font-black text-rose-600 leading-none tracking-tight">
                    ${Number(price).toLocaleString("es-CO")}
                  </p>
                  <p className="mt-1.5 text-xs text-gray-400 font-medium">Impuestos incluidos</p>
                </div>

                <div className={`inline-flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-full shrink-0 ${
                  outOfStock
                    ? "bg-red-50 text-red-400 border border-red-100"
                    : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                }`}>
                  {outOfStock ? (
                    <><PackageX size={13} />Sin stock</>
                  ) : (
                    <><span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />{stock} disponibles</>
                  )}
                </div>
              </div>
            </div>

            {/* Acciones */}
            <div className="flex flex-col gap-3">
              <button
                onClick={() => { if (!outOfStock && !atLimit) addToCart(variant); }}
                disabled={outOfStock || atLimit}
                className="w-full h-14 rounded-2xl flex items-center justify-center gap-2.5 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 active:from-rose-700 active:to-pink-800 disabled:opacity-50 disabled:cursor-not-allowed text-white text-base font-bold tracking-wide transition-all shadow-lg shadow-rose-200/60"
              >
                <ShoppingBag size={20} />
                {outOfStock ? "Sin stock" : atLimit ? "Límite de stock" : "Agregar al carrito"}
              </button>

              <button
                onClick={() => toggleFavorite(variant)}
                className={`w-full h-12 rounded-2xl flex items-center justify-center gap-2 text-sm font-semibold border-2 transition-all ${
                  isFav
                    ? "border-rose-300 bg-rose-50 text-rose-600"
                    : "border-gray-200 text-gray-500 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-500"
                }`}
              >
                <span className="text-base leading-none">{isFav ? "♥" : "♡"}</span>
                {isFav ? "Guardado en favoritos" : "Guardar en favoritos"}
              </button>
            </div>

            {/* Descripción completa */}
            {product?.description && (
              <details className="group rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
                <summary className="cursor-pointer list-none flex items-center justify-between gap-2 px-5 py-4 select-none">
                  <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-gray-500">
                    Descripción del producto
                  </span>
                  <ChevronDown
                    size={15}
                    className="text-gray-400 group-open:rotate-180 transition-transform duration-200 shrink-0"
                  />
                </summary>
                <div className="px-5 pb-5">
                  <div className="h-px bg-gray-100 mb-4" />
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {product.description}
                  </p>
                </div>
              </details>
            )}

            {/* SKU / Código */}
            {(sku || barcode) && (
              <div className="flex flex-col gap-1.5 pt-2 border-t border-gray-100">
                {sku && (
                  <p className="inline-flex items-center gap-1.5 text-[11px] text-gray-400 font-medium">
                    <Tag size={11} className="shrink-0" />
                    <span className="uppercase tracking-widest text-[10px] font-bold">SKU</span>
                    <span className="font-mono text-gray-500">{sku}</span>
                  </p>
                )}
                {barcode && (
                  <p className="inline-flex items-center gap-1.5 text-[11px] text-gray-400 font-medium">
                    <Barcode size={11} className="shrink-0" />
                    <span className="uppercase tracking-widest text-[10px] font-bold">Cód.</span>
                    <span className="font-mono text-gray-500">{barcode}</span>
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Productos relacionados */}
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
