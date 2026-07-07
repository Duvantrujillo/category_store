import { useState, useEffect, useCallback, useRef } from "react";

const API = import.meta.env.VITE_API_URL;

function mapCart(cart) {
  return (cart.items ?? []).map((item) => ({
    variant: item.productVariant,
    quantity: item.quantity,
  }));
}

function mapBundleCart(cart) {
  return (cart.bundleItems ?? []).map((item) => ({
    bundle: item.bundle,
    quantity: item.quantity,
    // { [productBundleItemId]: productVariantId } — solo trae fila para los
    // componentes "libres" (los fijos ya están resueltos en la receta misma).
    selections: Object.fromEntries(
      (item.selections ?? []).map((s) => [s.productBundleItemId, s.productVariantId])
    ),
  }));
}

export function selectionsToPayload(selections) {
  return Object.entries(selections ?? {}).map(([productBundleItemId, productVariantId]) => ({
    productBundleItemId: Number(productBundleItemId),
    productVariantId: Number(productVariantId),
  }));
}

// Stock disponible de un combo = el mínimo de (stock del componente / cantidad
// que ese componente requiere por combo) entre todos sus componentes.
// Para un componente "libre" (sin variante fija) usa la variante elegida en
// `selections` si hay una; si no (todavía no se configuró el combo), asume la
// MEJOR variante posible — cualquiera con stock suficiente — en vez de
// simplemente la primera de la lista. Así, si una opción está agotada pero
// otra no, el combo no se marca como agotado antes de que el cliente
// siquiera abra el selector.
export function getBundleAvailableStock(bundle, selections = {}) {
  if (!bundle.items?.length) return 0;
  return Math.min(
    ...bundle.items.map((item) => {
      let variant = item.productVariantId ? item.productVariant : null;
      if (!variant) {
        const chosenId = selections?.[item.id];
        variant = item.product?.variants?.find((v) => v.id === chosenId)
          ?? item.product?.variants?.find((v) => Number(v.stock) >= item.quantity)
          ?? item.product?.variants?.[0];
      }
      if (!variant) return 0;
      return Math.floor(Number(variant.stock) / item.quantity);
    })
  );
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
  const [cartItems, setCartItems]             = useState([]);
  const [cartBundleItems, setCartBundleItems] = useState([]);
  const [cartUuid, setCartUuid]               = useState(() => localStorage.getItem("cart_uuid") ?? null);
  const [cartOpen, setCartOpen]               = useState(false);
  const initRef                               = useRef(false);

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
            setCartBundleItems(mapBundleCart(cart));
            return;
          }
          localStorage.removeItem("cart_uuid");
        }

        const newCart = await createCart();
        localStorage.setItem("cart_uuid", newCart.uuid);
        setCartUuid(newCart.uuid);
        setCartItems([]);
        setCartBundleItems([]);
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

  // `selections`: { [productBundleItemId]: productVariantId } — solo hace
  // falta para los componentes "libres" del combo (los fijos no se envían).
  // Sin optimistic update acá: al depender de la configuración elegida, es
  // más simple y seguro esperar la respuesta real del servidor.
  const addBundleToCart = useCallback(async (bundle, selections = {}) => {
    const uuid = getUuid();
    if (!uuid) return;

    setCartOpen(true);

    try {
      const res = await fetch(`${API}/cart/public/${uuid}/bundles`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bundleId: bundle.id,
          quantity: 1,
          selections: selectionsToPayload(selections),
        }),
      });
      if (res.ok) {
        const cart = await res.json();
        setCartBundleItems(mapBundleCart(cart));
        return { ok: true };
      }
      const data = await res.json().catch(() => ({}));
      return { ok: false, message: data.message ?? "No se pudo agregar el combo" };
    } catch {
      return { ok: false, message: "Error de conexión" };
    }
  }, [cartUuid]);

  const updateBundleQty = useCallback(async (bundleId, quantity) => {
    const uuid = getUuid();
    if (!uuid || quantity < 1) return;

    const item = cartBundleItems.find((i) => i.bundle.id === bundleId);
    if (!item || quantity > getBundleAvailableStock(item.bundle, item.selections)) return;

    setCartBundleItems((prev) =>
      prev.map((i) => (i.bundle.id === bundleId ? { ...i, quantity } : i))
    );

    try {
      const res = await fetch(`${API}/cart/public/${uuid}/bundles/${bundleId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quantity,
          selections: selectionsToPayload(item.selections),
        }),
      });
      if (res.ok) {
        const cart = await res.json();
        setCartBundleItems(mapBundleCart(cart));
      }
    } catch {
      // silencio
    }
  }, [cartUuid, cartBundleItems]);

  const removeBundleFromCart = useCallback(async (bundleId) => {
    const uuid = getUuid();
    if (!uuid) return;

    setCartBundleItems((prev) => prev.filter((i) => i.bundle.id !== bundleId));

    try {
      const res = await fetch(`${API}/cart/public/${uuid}/bundles/${bundleId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        const cart = await res.json();
        setCartBundleItems(mapBundleCart(cart));
      }
    } catch {
      // silencio
    }
  }, [cartUuid]);

  return {
    cartItems,
    cartBundleItems,
    cartUuid,
    cartOpen,
    setCartOpen,
    addToCart,
    updateQty,
    removeFromCart,
    addBundleToCart,
    updateBundleQty,
    removeBundleFromCart,
  };
}
