import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";

const API = import.meta.env.VITE_API_URL;

function mapWishlist(wishlist) {
  return (wishlist.items ?? []).map((item) => item.productVariant);
}

async function fetchWishlist(cartUuid) {
  const res = await fetch(`${API}/wishlist/public/${cartUuid}`);
  if (!res.ok) return null;
  return res.json();
}

export function usePublicWishlist(cartUuid) {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [wishlistOpen, setWishlistOpen]   = useState(false);

  // Carga inicial cuando el cartUuid esté disponible
  useEffect(() => {
    if (!cartUuid) return;
    fetchWishlist(cartUuid)
      .then((data) => { if (data) setWishlistItems(mapWishlist(data)); })
      .catch(() => {});
  }, [cartUuid]);

  const toggleFavorite = useCallback(async (variant) => {
    const uuid = cartUuid ?? localStorage.getItem("cart_uuid");
    if (!uuid) {
      // Mismo caso que addToCart: visitante nuevo, el carrito (y con él el
      // identificador que usa la wishlist) todavía se está creando.
      toast.info("Danos un segundo, tu carrito se está preparando. Intenta de nuevo.");
      return;
    }

    const isIn = wishlistItems.some((v) => v.id === variant.id);

    // Optimistic update
    setWishlistItems((prev) =>
      isIn ? prev.filter((v) => v.id !== variant.id) : [...prev, variant]
    );

    // Abre el panel al agregar, igual que el carrito
    if (!isIn) setWishlistOpen(true);

    try {
      let res;
      if (isIn) {
        res = await fetch(`${API}/wishlist/public/${uuid}/items/${variant.id}`, {
          method: "DELETE",
        });
      } else {
        res = await fetch(`${API}/wishlist/public/${uuid}/items`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productVariantId: variant.id }),
        });
      }
      if (!res.ok) throw new Error("server error");
      const updated = await res.json();
      setWishlistItems(mapWishlist(updated));
    } catch {
      // Revertir optimistic update si el servidor falló
      setWishlistItems((prev) =>
        isIn ? [...prev, variant] : prev.filter((v) => v.id !== variant.id)
      );
    }
  }, [cartUuid, wishlistItems]);

  const removeFromWishlist = useCallback(async (variantId) => {
    const uuid = cartUuid ?? localStorage.getItem("cart_uuid");
    if (!uuid) return;

    setWishlistItems((prev) => prev.filter((v) => v.id !== variantId));

    try {
      const res = await fetch(`${API}/wishlist/public/${uuid}/items/${variantId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        const updated = await res.json();
        setWishlistItems(mapWishlist(updated));
      }
    } catch {}
  }, [cartUuid]);

  return {
    wishlistItems,
    wishlistOpen,
    setWishlistOpen,
    toggleFavorite,
    removeFromWishlist,
  };
}
