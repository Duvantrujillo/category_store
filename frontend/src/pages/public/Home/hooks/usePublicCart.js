import { useState, useEffect, useCallback, useRef } from "react";

const API = import.meta.env.VITE_API_URL;

function mapCart(cart) {
  return (cart.items ?? []).map((item) => ({
    variant: item.productVariant,
    quantity: item.quantity,
  }));
}

async function fetchCart(uuid) {
  const res = await fetch(`${API}/cart/public/${uuid}`);
  if (!res.ok) return null;
  return res.json();
}

async function createCart() {
  const res = await fetch(`${API}/cart/public`, { method: "POST" });
  if (!res.ok) throw new Error("No se pudo crear el carrito");
  return res.json();
}

export function usePublicCart() {
  const [cartItems, setCartItems]   = useState([]);
  const [cartUuid, setCartUuid]     = useState(() => localStorage.getItem("cart_uuid") ?? null);
  const [cartOpen, setCartOpen]     = useState(false);
  const initRef                     = useRef(false);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    async function init() {
      try {
        let uuid = localStorage.getItem("cart_uuid");

        if (uuid) {
          const cart = await fetchCart(uuid);
          if (cart) {
            setCartItems(mapCart(cart));
            return;
          }
          localStorage.removeItem("cart_uuid");
        }

        const newCart = await createCart();
        localStorage.setItem("cart_uuid", newCart.uuid);
        setCartUuid(newCart.uuid);
        setCartItems([]);
      } catch (err) {
        console.error("Error iniciando carrito:", err);
      }
    }
    init();
  }, []);

  const getUuid = () => cartUuid ?? localStorage.getItem("cart_uuid");

  const addToCart = useCallback(async (variant) => {
    const uuid = getUuid();
    if (!uuid) return;

    // Actualización optimista
    setCartItems((prev) => {
      const existing = prev.find((i) => i.variant.id === variant.id);
      if (existing) {
        if (existing.quantity >= variant.stock) return prev; // ya al límite
        return prev.map((i) =>
          i.variant.id === variant.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { variant, quantity: 1 }];
    });

    setCartOpen(true);

    try {
      const res = await fetch(`${API}/cart/public/${uuid}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productVariantId: variant.id, quantity: 1 }),
      });
      if (res.ok) {
        const cart = await res.json();
        setCartItems(mapCart(cart));
      } else {
        // Revertir si el servidor rechazó (p.ej. stock insuficiente)
        setCartItems((prev) => {
          const existing = prev.find((i) => i.variant.id === variant.id);
          if (!existing || existing.quantity <= 1) {
            return prev.filter((i) => i.variant.id !== variant.id);
          }
          return prev.map((i) =>
            i.variant.id === variant.id ? { ...i, quantity: i.quantity - 1 } : i
          );
        });
      }
    } catch {
      // silencio — la UI ya hizo optimistic update
    }
  }, [cartUuid]);

  const updateQty = useCallback(async (variantId, quantity) => {
    const uuid = getUuid();
    if (!uuid || quantity < 1) return;

    const item = cartItems.find((i) => i.variant.id === variantId);
    if (!item || quantity > item.variant.stock) return;

    setCartItems((prev) =>
      prev.map((i) => (i.variant.id === variantId ? { ...i, quantity } : i))
    );

    try {
      const res = await fetch(`${API}/cart/public/${uuid}/items/${variantId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity }),
      });
      if (res.ok) {
        const cart = await res.json();
        setCartItems(mapCart(cart));
      }
    } catch {
      // silencio
    }
  }, [cartUuid, cartItems]);

  const removeFromCart = useCallback(async (variantId) => {
    const uuid = getUuid();
    if (!uuid) return;

    setCartItems((prev) => prev.filter((i) => i.variant.id !== variantId));

    try {
      const res = await fetch(`${API}/cart/public/${uuid}/items/${variantId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        const cart = await res.json();
        setCartItems(mapCart(cart));
      }
    } catch {
      // silencio
    }
  }, [cartUuid]);

  return {
    cartItems,
    cartUuid,
    cartOpen,
    setCartOpen,
    addToCart,
    updateQty,
    removeFromCart,
  };
}
