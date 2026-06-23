import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ShoppingBag, PackageX, Tag, Barcode, ArrowLeft } from "lucide-react";
import HomeHeader from "../Home/components/header/HomeHeader";
import HomeFooter from "../Home/components/footer/HomeFooter";
import HomeCart from "../Home/components/cart/HomeCart";
import HomeWishlist from "../Home/components/wishlist/HomeWishlist";
import { usePublicCart } from "../Home/hooks/usePublicCart";
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
        <div className="order-2 sm:order-1 flex flex-row sm:flex-col gap-2 overflow-x-auto sm:overflow-y-auto sm:overflow-x-hidden sm:w-[76px] pb-1 sm:pb-0 sm:pr-1">
          {sorted.map((img) => {
            const src   = url(img.imageUrl) ?? noPhotos;
            const isAct = active === img.imageUrl;
            return (
              <button
                key={img.slot}
                onClick={() => setActive(img.imageUrl)}
                className={`shrink-0 w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                  isAct
                    ? "border-rose-400 shadow-md shadow-rose-200/60 scale-105"
                    : "border-rose-100 hover:border-rose-300 opacity-70 hover:opacity-100"
                }`}
              >
                <img src={src} alt="" className="w-full h-full object-cover" />
              </button>
            );
          })}
        </div>
      )}
      <div className="order-1 sm:order-2 flex-1 relative rounded-2xl overflow-hidden bg-rose-50/60 border border-rose-100 min-h-[300px] sm:min-h-0">
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

  const [wishlistOpen, setWishlistOpen]   = useState(false);
  const [wishlistItems, setWishlistItems] = useState([]);

  const {
    cartItems,
    cartOpen,
    setCartOpen,
    addToCart,
    updateQty,
    removeFromCart,
  } = usePublicCart();

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

  function handleToggleFavorite(v) {
    setWishlistItems((prev) =>
      prev.some((x) => x.id === v.id) ? prev.filter((x) => x.id !== v.id) : [...prev, v]
    );
  }

  if (loading) return (
    <div className="min-h-screen bg-white">
      <HomeHeader cartCount={0} onCartOpen={() => {}} wishlistCount={0} onWishlistOpen={() => {}} onSearch={() => {}} />
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-rose-200 border-t-rose-400 animate-spin" />
          <p className="text-sm text-rose-300 font-medium">Cargando producto…</p>
        </div>
      </div>
    </div>
  );

  if (notFound || !variant) return (
    <div className="min-h-screen bg-white">
      <HomeHeader cartCount={0} onCartOpen={() => {}} wishlistCount={0} onWishlistOpen={() => {}} onSearch={() => {}} />
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <PackageX size={48} className="text-rose-200" />
        <p className="text-rose-400 font-semibold">Producto no encontrado</p>
        <button onClick={() => navigate("/")} className="text-sm text-rose-400 underline">Volver a la tienda</button>
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
    <div className="min-h-screen bg-white">
      <HomeHeader
        cartCount={cartCount}
        onCartOpen={() => setCartOpen(true)}
        wishlistCount={wishlistItems.length}
        onWishlistOpen={() => setWishlistOpen(true)}
        onSearch={(q) => navigate(`/?q=${encodeURIComponent(q)}`)}
      />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">

        {/* Breadcrumb */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-rose-400 hover:text-rose-600 transition-colors mb-6"
        >
          <ArrowLeft size={16} />
          Volver
        </button>

        {/* Layout principal */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">

          {/* ── Galería ── */}
          <div className="h-[400px] sm:h-[520px] md:h-[600px]">
            <Gallery images={images} />
          </div>

          {/* ── Información ── */}
          <div className="flex flex-col gap-5">

            {/* Marca */}
            {product?.brand && (
              <div className="flex items-center gap-2">
                {brandLogoSrc && (
                  <img
                    src={brandLogoSrc}
                    alt={product.brand.name}
                    className="w-8 h-8 rounded-lg object-contain border border-rose-100"
                    onError={(e) => { e.currentTarget.style.display = "none"; }}
                  />
                )}
                <span className="text-xs font-bold uppercase tracking-widest text-pink-400">
                  {product.brand.name}
                </span>
              </div>
            )}

            {/* Categoría */}
            {product?.category?.name && (
              <span className="self-start flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1 rounded-full bg-rose-50 text-rose-500 border border-rose-100">
                <Tag size={11} />
                {product.category.name}
              </span>
            )}

            {/* Nombre */}
            <h1 className="text-3xl sm:text-4xl font-bold text-rose-900 leading-snug">
              {product?.name}
            </h1>

            {/* Descripción corta */}
            {product?.shortDescription && (
              <p className="text-base text-rose-700/65 leading-relaxed">
                {product.shortDescription}
              </p>
            )}

            {/* Atributos */}
            {Object.keys(attrGroups).length > 0 && (
              <div className="flex flex-col gap-4">
                {Object.entries(attrGroups).map(([name, values]) => (
                  <div key={name}>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-rose-400 mb-2">
                      {name}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {values.map((v) => (
                        <span key={v} className="text-sm font-semibold px-4 py-1.5 rounded-full bg-rose-50 text-rose-700 border border-rose-100">
                          {v}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="h-px bg-rose-100 my-1" />

            {/* Precio + stock */}
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-[11px] text-rose-400 font-semibold uppercase tracking-widest mb-1">Precio</p>
                <p className="text-5xl font-bold text-rose-700 leading-none tracking-tight">
                  ${Number(price).toLocaleString("es-CO")}
                </p>
              </div>
              <div className={`flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-full shrink-0 ${
                outOfStock
                  ? "bg-rose-50 text-rose-400 border border-rose-100"
                  : "bg-green-50 text-green-600 border border-green-100"
              }`}>
                {outOfStock
                  ? <><PackageX size={15} />Sin stock</>
                  : <><span className="w-2 h-2 rounded-full bg-green-400 inline-block" />{stock} disponibles</>
                }
              </div>
            </div>

            {/* Acciones */}
            <div className="flex flex-col gap-3 pt-1">
              <button
                onClick={() => { if (!outOfStock && !atLimit) addToCart(variant); }}
                disabled={outOfStock || atLimit}
                className="w-full h-14 rounded-full flex items-center justify-center gap-2.5 bg-rose-400 hover:bg-rose-500 active:bg-rose-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-base font-semibold tracking-wide transition-colors shadow-lg shadow-rose-200/50"
              >
                <ShoppingBag size={20} />
                {outOfStock ? "Sin stock" : atLimit ? "Límite de stock" : "Agregar al carrito"}
              </button>

              <button
                onClick={() => handleToggleFavorite(variant)}
                className={`w-full h-12 rounded-full flex items-center justify-center gap-2 text-sm font-semibold border-2 transition-colors ${
                  isFav
                    ? "border-rose-300 bg-rose-50 text-rose-500"
                    : "border-rose-200 text-rose-400 hover:border-rose-300 hover:bg-rose-50"
                }`}
              >
                <span className="text-lg leading-none">{isFav ? "♥" : "♡"}</span>
                {isFav ? "Guardado en favoritos" : "Guardar en favoritos"}
              </button>
            </div>

            {/* Descripción completa */}
            {product?.description && (
              <details className="group mt-2">
                <summary className="cursor-pointer list-none flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-rose-400 select-none">
                  <span className="group-open:rotate-90 transition-transform inline-block">▶</span>
                  Descripción completa
                </summary>
                <p className="mt-3 text-sm text-rose-700/60 leading-relaxed border-l-2 border-rose-100 pl-4">
                  {product.description}
                </p>
              </details>
            )}

            {/* SKU / Código */}
            {(sku || barcode) && (
              <div className="flex flex-col gap-1 pt-3 mt-auto border-t border-rose-50">
                {sku && (
                  <p className="flex items-center gap-1.5 text-[11px] text-rose-300">
                    <Tag size={11} />SKU: <span className="font-mono">{sku}</span>
                  </p>
                )}
                {barcode && (
                  <p className="flex items-center gap-1.5 text-[11px] text-rose-300">
                    <Barcode size={11} />Cód: <span className="font-mono">{barcode}</span>
                  </p>
                )}
              </div>
            )}
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
      />

      <HomeWishlist
        open={wishlistOpen}
        onClose={() => setWishlistOpen(false)}
        items={wishlistItems}
        onRemove={(vid) => setWishlistItems((p) => p.filter((v) => v.id !== vid))}
        onAddToCart={(v) => { addToCart(v); setWishlistOpen(false); }}
      />
    </div>
  );
}
