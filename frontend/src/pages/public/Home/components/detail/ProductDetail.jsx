import { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PackageX, ArrowLeft } from "lucide-react";
import HomeHeader from "../header/HomeHeader";
import HomeFooter from "../footer/HomeFooter";
import HomeCart from "../cart/HomeCart";
import HomeWishlist from "../wishlist/HomeWishlist";
import { usePublicCart } from "../../hooks/usePublicCart";
import { usePublicWishlist } from "../../hooks/usePublicWishlist";
import { usePublicProduct } from "../../hooks/usePublicProduct";
import { getAvailableUnits } from "@/lib/stock";
import ProductDetailGallery from "./ProductDetailGallery";
import ProductDetailDescription from "./ProductDetailDescription";
import ProductDetailBrand from "./ProductDetailBrand";
import ProductDetailAttributes from "./ProductDetailAttributes";
import ProductDetailPrice from "./ProductDetailPrice";
import ProductDetailActions from "./ProductDetailActions";
import RelatedProductsSection from "./related/RelatedProductsSection";

// Extrae los atributos de una variante como { "Color": "Negro", "Talla": "38" }
function getVariantAttrs(variant) {
  const attrs = {};
  variant?.attributes?.forEach((a) => {
    const name  = a.attributeValue?.attribute?.name;
    const value = a.attributeValue?.value;
    if (name && value) attrs[name] = value;
  });
  return attrs;
}

// Busca la variante cuya combinación de atributos coincide exactamente
function findVariantByAttrs(variants, selectedAttrs) {
  const entries = Object.entries(selectedAttrs);
  if (!entries.length) return null;
  return variants.find((v) => {
    const vAttrs = getVariantAttrs(v);
    return entries.every(([name, val]) => vAttrs[name] === val);
  }) ?? null;
}

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const { product, loading, notFound } = usePublicProduct(slug);

  // null = el usuario aún no ha interactuado; se usa la variante isDefault directamente
  const [selectedAttrs, setSelectedAttrs] = useState(null);

  // selectedVariant se deriva en el mismo render en que llega product —
  // nunca hay un render intermedio con imágenes vacías
  const selectedVariant = useMemo(() => {
    if (!product?.variants?.length) return null;
    // Preferir la variante marcada como default, pero solo si tiene stock
    // disponible (descontando lo ya reservado por pedidos pendientes) — si
    // esa se agotó, cae a cualquier otra variante disponible del producto
    // antes de mostrarlo como agotado. Solo si NINGUNA tiene stock se usa la
    // default (agotada) o la primera, para que ahí sí se vea "Agotado".
    const def = product.variants.find((v) => v.isDefault && getAvailableUnits(v) > 0)
      ?? product.variants.find((v) => getAvailableUnits(v) > 0)
      ?? product.variants.find((v) => v.isDefault)
      ?? product.variants[0];
    if (!selectedAttrs) return def;
    return findVariantByAttrs(product.variants, selectedAttrs) ?? def;
  }, [product, selectedAttrs]);

  // ID estable para productos relacionados (no cambia al seleccionar atributos)
  const defaultVariantId = useMemo(() => {
    if (!product?.variants?.length) return null;
    return (product.variants.find((v) => v.isDefault) ?? product.variants[0]).id;
  }, [product]);

  // Todas las imágenes de todas las variantes (ya traen productVariantId del backend)
  // La variante por defecto primero porque el backend ordena isDefault desc
  const allImages = useMemo(() => {
    if (!product?.variants) return [];
    return product.variants.flatMap((v) => v.images ?? []);
  }, [product]);

  function handleSelectAttr(attrName, value) {
    // Primera interacción: inicializa desde la variante visible actual
    const base     = selectedAttrs ?? getVariantAttrs(selectedVariant);
    const newAttrs = { ...base, [attrName]: value };
    const match    = findVariantByAttrs(product.variants, newAttrs);
    if (match) setSelectedAttrs(newAttrs);
  }

  const {
    cartItems, cartUuid, cartOpen, setCartOpen,
    addToCart, updateQty, removeFromCart,
  } = usePublicCart();

  const {
    wishlistItems, wishlistOpen, setWishlistOpen,
    toggleFavorite, removeFromWishlist,
  } = usePublicWishlist(cartUuid);

  const cartCount    = cartItems.reduce((sum, i) => sum + i.quantity, 0);
  const cartQtyById  = useMemo(
    () => Object.fromEntries(cartItems.map((i) => [i.variant.id, i.quantity])),
    [cartItems]
  );
  const favoritedIds = useMemo(() => new Set(wishlistItems.map((v) => v.id)), [wishlistItems]);

  // Variante enriquecida con la referencia al producto para el carrito y wishlist
  const enrichedVariant = useMemo(() => {
    if (!selectedVariant || !product) return null;
    return {
      ...selectedVariant,
      product: {
        id:        product.id,
        name:      product.name,
        slug:      product.slug,
        mainImage: product.mainImage,
        brand:     product.brand,
        category:  product.category,
      },
    };
  }, [selectedVariant, product]);

  // ── Estados de carga / error ──────────────────────────────────────────────

  if (loading) return (
    <div className="min-h-screen bg-linear-to-b from-rose-100/40 via-pink-50/20 to-white">
      <HomeHeader cartCount={0} onCartOpen={() => {}} wishlistCount={0} onWishlistOpen={() => {}} onSearch={() => {}} />
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-4 border-rose-200 border-t-rose-500 animate-spin" />
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Cargando producto…</p>
        </div>
      </div>
    </div>
  );

  if (notFound || !product) return (
    <div className="min-h-screen bg-linear-to-b from-rose-100/40 via-pink-50/20 to-white">
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

  // ── Datos de la variante seleccionada ─────────────────────────────────────

  const { price, finalPrice, promotion } = selectedVariant ?? {};
  const discountPercent = promotion && Number(price) > 0
    ? Math.round((1 - Number(finalPrice) / Number(price)) * 100)
    : 0;
  const available  = getAvailableUnits(selectedVariant);
  const outOfStock = available === 0;
  const cartQty    = cartQtyById[selectedVariant?.id] ?? 0;
  const atLimit    = !outOfStock && cartQty >= available;
  const isFav      = favoritedIds.has(selectedVariant?.id);

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
            <ProductDetailGallery images={allImages} selectedVariantId={selectedVariant?.id} outOfStock={outOfStock} discountPercent={discountPercent} />
          </div>

          <div className="flex flex-col gap-7">
            <h1
              className="text-3xl sm:text-4xl font-black leading-tight"
              style={{ color: "#4b5563", WebkitTextStroke: "1.5px #4b5563", letterSpacing: "0.1em" }}
            >
              {product.name}
            </h1>
            <ProductDetailDescription product={product} />
            <ProductDetailBrand brand={product.brand} />

            {/* attributeOptions viene pre-computado del backend */}
            <ProductDetailAttributes
              attributeOptions={product.attributeOptions ?? {}}
              variants={product.variants}
              selectedVariant={selectedVariant}
              selectedAttrs={selectedAttrs}
              onSelectAttr={handleSelectAttr}
            />

            <ProductDetailPrice price={price} finalPrice={finalPrice} promotion={promotion} outOfStock={outOfStock} />
            <ProductDetailActions
              variant={enrichedVariant}
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
          currentVariantId={defaultVariantId}
          brandId={product.brand?.id}
          brandName={product.brand?.name}
          categoryId={product.category?.id}
          categoryName={product.category?.name}
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
