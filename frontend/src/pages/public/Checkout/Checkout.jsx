import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  ArrowLeft, ShoppingBag, Loader2,
  AlertCircle, CheckCircle2, Plus, Minus, Trash2, Truck, ChevronDown,
  User, MapPin,
} from "lucide-react";
import HomeHeader from "../Home/components/header/HomeHeader";
import HomeFooter from "../Home/components/footer/HomeFooter";
import HomeCart from "../Home/components/cart/HomeCart";
import { usePublicCart, getBundleAvailableStock, selectionsToPayload } from "../Home/hooks/usePublicCart";
import { getAvailableUnits } from "@/lib/stock";
import { usePublicWishlist } from "../Home/hooks/usePublicWishlist";
import { usePageTitle } from "@/hooks/usePageTitle";
import useCreateShippingLocations from "../../dashboard/admin/form_response/hooks/useCreateShippingLocations";

const API          = import.meta.env.VITE_API_URL;
const API_URL      = import.meta.env.VITE_API_URL;
const EPAYCO_KEY   = import.meta.env.VITE_EPAYCO_PUBLIC_KEY;
const SHIPPING_COST = 11000;
// URL pública (ngrok en dev, URL real en producción) para que ePayco llame al webhook
const WEBHOOK_URL = import.meta.env.VITE_EPAYCO_WEBHOOK_URL || `${API}/webhook/create`;

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}-${Math.random().toString(36).slice(2, 9)}`;
}

const EMPTY = {
  firstName: "", lastName: "", documentNumber: "", phoneNumber: "",
  email: "", departament: "", municipality: "", address: "", additionalDetails: "",
};

const REQUIRED = ["firstName", "lastName", "documentNumber", "phoneNumber", "departament", "municipality", "address"];

const LABELS = {
  firstName: "Nombre", lastName: "Apellido", documentNumber: "Número de documento",
  phoneNumber: "Teléfono", email: "Correo electrónico", departament: "Departamento",
  municipality: "Ciudad / Municipio", address: "Dirección completa",
  additionalDetails: "Referencias / indicaciones",
};

const PLACEHOLDERS = {
  firstName: "Tu nombre", lastName: "Tu apellido",
  documentNumber: "Ej: 1023456789", phoneNumber: "Ej: 3001234567",
  email: "tu@correo.com (opcional)",
  address: "Calle 10 # 43-25, Barrio El Poblado",
  additionalDetails: "Apto, piso, torre, color de la casa… (opcional)",
};

// ── Validaciones ──────────────────────────────────────────────────────────────

const ONLY_LETTERS = /^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]+$/;
const EMAIL_RE     = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_CO     = /^3\d{9}$/;

function validateForm(form) {
  const errs = {};
  const v = (k) => form[k].trim();

  if (!v("firstName"))                           errs.firstName = "Ingresa tu nombre";
  else if (v("firstName").length < 2)            errs.firstName = "Mínimo 2 caracteres";
  else if (!ONLY_LETTERS.test(v("firstName")))   errs.firstName = "Solo letras y espacios";

  if (!v("lastName"))                            errs.lastName = "Ingresa tu apellido";
  else if (v("lastName").length < 2)             errs.lastName = "Mínimo 2 caracteres";
  else if (!ONLY_LETTERS.test(v("lastName")))    errs.lastName = "Solo letras y espacios";

  if (!v("documentNumber"))                      errs.documentNumber = "Ingresa tu número de documento";
  else if (!/^\d{5,11}$/.test(v("documentNumber")))
                                                 errs.documentNumber = "Entre 5 y 11 dígitos numéricos";

  const tel = v("phoneNumber").replace(/\s|-/g, "");
  if (!tel)                                      errs.phoneNumber = "Ingresa tu número de teléfono";
  else if (!PHONE_CO.test(tel))                  errs.phoneNumber = "Número colombiano de 10 dígitos (ej: 3001234567)";

  if (v("email") && !EMAIL_RE.test(v("email"))) errs.email = "Formato de correo inválido";
  if (!v("departament"))                         errs.departament = "Selecciona un departamento";
  if (!v("municipality"))                        errs.municipality = "Selecciona un municipio";

  if (!v("address"))                             errs.address = "Ingresa tu dirección";
  else if (v("address").length < 5)              errs.address = "Ingresa una dirección más completa";

  return errs;
}

// ── ePayco: modo programático ──────────────────────────────────────────────────
// En vez del "botón automático" (que ePayco dibuja con su propio estilo y que
// queda pegado en la página, feo, si el cliente cierra el modal sin pagar),
// cargamos el script una sola vez y abrimos el checkout mediante su API JS
// desde nuestro propio botón — así siempre controlamos la UI.

let epaycoScriptPromise = null;

function loadEpaycoScript() {
  if (window.ePayco) return Promise.resolve();
  if (epaycoScriptPromise) return epaycoScriptPromise;

  epaycoScriptPromise = new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://checkout.epayco.co/checkout.js";
    s.onload  = () => resolve();
    s.onerror = () => { epaycoScriptPromise = null; reject(new Error("No se pudo cargar la pasarela de pago")); };
    document.body.appendChild(s);
  });
  return epaycoScriptPromise;
}

async function openEpaycoCheckout({ reference, total, form }) {
  await loadEpaycoScript();
  const tel = form.phoneNumber.replace(/\s|-/g, "");

  const handler = window.ePayco.checkout.configure({
    key:  EPAYCO_KEY,
    test: (import.meta.env.VITE_EPAYCO_TEST ?? "true") !== "false",
  });

  handler.open({
    name:        "WowBeauty",
    description: `Pedido ${reference}`,
    invoice:     reference,
    currency:    "cop",
    amount:      String(Math.round(total)),
    tax_base:    "0",
    tax:         "0",
    country:     "co",
    lang:        "es",
    external:    "false",
    response:     `${window.location.origin}/checkout/respuesta`,
    confirmation: WEBHOOK_URL,

    name_billing:        form.firstName,
    last_name_billing:   form.lastName,
    email_billing:       form.email || "",
    type_doc_billing:    "cc",
    number_doc_billing:  form.documentNumber,
    mobilephone_billing: tel,
    address_billing:     form.address,
    city_billing:        form.municipality,
    dept_billing:        form.departament,
    country_billing:     "CO",
  });
}

// ── Select ────────────────────────────────────────────────────────────────────

const selectCls = (err) =>
  `w-full h-10 rounded-xl border px-3.5 text-[13px] text-gray-800 bg-gray-50 appearance-none cursor-pointer outline-none transition-colors focus:bg-white ${
    err ? "border-rose-300 focus:border-rose-400 ring-1 ring-rose-200" : "border-gray-200 focus:border-rose-300"
  } disabled:opacity-40 disabled:cursor-not-allowed`;

function SelectArrow() {
  return (
    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
      <svg className="h-4 w-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  );
}

function FieldLabel({ name }) {
  const optional = !REQUIRED.includes(name);
  return (
    <label htmlFor={name} className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
      {LABELS[name]}
      {optional && <span className="ml-1 font-normal normal-case text-gray-300">· opcional</span>}
    </label>
  );
}

function TextField({ name, value, onChange, error, multiline, inputMode, disabled }) {
  const inputCls = `w-full text-[13px] text-gray-800 placeholder:text-gray-300 bg-gray-50 border rounded-xl px-3.5 py-2.5 outline-none transition-colors focus:bg-white disabled:opacity-50 disabled:cursor-not-allowed ${
    error ? "border-rose-300 focus:border-rose-400 ring-1 ring-rose-200" : "border-gray-200 focus:border-rose-300"
  }`;
  return (
    <div className="flex flex-col gap-1" data-field={name}>
      <FieldLabel name={name} />
      {multiline ? (
        <textarea id={name} name={name} value={value} onChange={onChange} disabled={disabled}
          placeholder={PLACEHOLDERS[name]} rows={2}
          className={`${inputCls} resize-none`} />
      ) : (
        <input
          id={name}
          type={name === "email" ? "email" : "text"}
          inputMode={inputMode}
          name={name} value={value}
          onChange={onChange} disabled={disabled}
          placeholder={PLACEHOLDERS[name]}
          className={`${inputCls} h-10`} />
      )}
      {error && (
        <p className="text-[11px] text-rose-400 flex items-center gap-1" data-field-error>
          <AlertCircle size={11} className="shrink-0" />{error}
        </p>
      )}
    </div>
  );
}

// ── Sección colapsable ────────────────────────────────────────────────────────

function CollapsibleSection({ title, icon: Icon, open, onToggle, disabled, hasError, children }) {
  return (
    <div className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-colors ${hasError ? "border-rose-200" : "border-gray-100"}`}>
      <button
        type="button"
        onClick={onToggle}
        disabled={disabled}
        className="w-full flex items-center justify-between px-5 sm:px-6 py-4 hover:bg-gray-50/60 transition-colors disabled:cursor-default"
      >
        <div className="flex items-center gap-2.5">
          {Icon && (
            <div className={`flex items-center justify-center w-6 h-6 rounded-lg ${hasError ? "bg-rose-50" : "bg-rose-50"}`}>
              <Icon size={13} className={hasError ? "text-rose-400" : "text-rose-400"} />
            </div>
          )}
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">{title}</span>
          {hasError && <span className="text-[10px] text-rose-400 font-semibold">· Completa los campos requeridos</span>}
        </div>
        <ChevronDown
          size={15}
          className={`text-gray-300 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        />
      </button>
      <div className={`grid transition-all duration-300 ease-in-out ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
        <div className="overflow-hidden">
          <div className="px-5 sm:px-6 pb-5 sm:pb-6 flex flex-col gap-4 border-t border-gray-50">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Resumen del pedido ────────────────────────────────────────────────────────

function OrderSummary({
  items, bundleItems, pendingPayment, onPay, onRetryPayment, retrying, loading, onUpdateQty, onRemove,
  onUpdateBundleQty, onRemoveBundle, orderError,
  couponInput, setCouponInput, coupon, couponLoading, couponError, onApplyCoupon, onRemoveCoupon,
}) {
  const itemsSubtotal   = items.reduce((s, i) => s + Number(i.variant.finalPrice ?? i.variant.price) * i.quantity, 0);
  const bundlesSubtotal = bundleItems.reduce((s, i) => s + Number(i.bundle.price) * i.quantity, 0);
  const subtotal        = itemsSubtotal + bundlesSubtotal;
  const shippingCost     = coupon?.freeShipping ? 0 : SHIPPING_COST;
  const discountAmount  = coupon?.discountAmount ?? 0;
  const totalLines      = items.length + bundleItems.length;
  const total           = totalLines > 0 ? Math.max(0, subtotal + shippingCost - discountAmount) : 0;
  const hasStockIssue = items.some(({ variant, quantity }) => quantity > getAvailableUnits(variant))
    || bundleItems.some(({ bundle, quantity, selections }) => quantity > getBundleAvailableStock(bundle, selections));

  return (
    <div className="flex flex-col gap-4">

      {/* Items */}
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
            Resumen · {totalLines} {totalLines === 1 ? "línea" : "líneas"}
          </p>
        </div>

        <div className="flex flex-col divide-y divide-gray-50">
          {bundleItems.map(({ bundle, quantity, selections }) => {
            const available = getBundleAvailableStock(bundle, selections);
            const atMax     = quantity >= available;
            const overStock = quantity > available;
            const lineTotal = Number(bundle.price) * quantity;
            const chosenLabels = (bundle.items ?? [])
              .map((recipeItem) => {
                const variant = recipeItem.productVariantId
                  ? recipeItem.productVariant
                  : recipeItem.product?.variants?.find((v) => v.id === selections?.[recipeItem.id]);
                if (!variant) return "";
                const attrs = (variant.attributes ?? []).map((a) => a.attributeValue?.value).filter(Boolean).join(" · ");
                return attrs || variant.sku || "";
              })
              .filter(Boolean);

            return (
              <div key={`bundle-${bundle.id}`} className="flex gap-3 px-5 py-4">
                {/* Imagen */}
                <div className="w-14 h-14 rounded-xl bg-gray-50 border border-gray-100 shrink-0 overflow-hidden">
                  {bundle.mainImage ? (
                    <img src={`${API_URL}${bundle.mainImage}`} alt={bundle.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-200">
                      <ShoppingBag size={16} />
                    </div>
                  )}
                </div>

                {/* Info + controles */}
                <div className="flex-1 min-w-0 flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-rose-400 truncate">Combo</p>
                      <p className="text-[12px] font-semibold text-gray-800 leading-snug line-clamp-2">{bundle.name}</p>
                      {chosenLabels.length > 0 && (
                        <p className="text-[10px] text-gray-400 truncate">{chosenLabels.join(" · ")}</p>
                      )}
                    </div>
                    {!pendingPayment && (
                      <button
                        onClick={() => onRemoveBundle(bundle.id)}
                        className="shrink-0 flex items-center justify-center w-6 h-6 rounded-lg text-gray-300 hover:text-rose-400 hover:bg-rose-50 transition-colors"
                        aria-label="Eliminar"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>

                  {overStock && (
                    <p className="text-[11px] text-rose-500 font-medium flex items-center gap-1">
                      <AlertCircle size={11} className="shrink-0" />
                      {available === 0 ? "Combo agotado" : `Solo quedan ${available} disponibles`}
                    </p>
                  )}
                  {orderError?.bundleId === bundle.id && (
                    <p className="text-[11px] text-rose-500 font-medium flex items-center gap-1">
                      <AlertCircle size={11} className="shrink-0" />
                      {orderError.message}
                    </p>
                  )}

                  <div className="flex items-center justify-between">
                    {pendingPayment ? (
                      <span className="text-[11px] text-gray-400">× {quantity}</span>
                    ) : (
                      <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                        <button
                          onClick={() => quantity === 1 ? onRemoveBundle(bundle.id) : onUpdateBundleQty(bundle.id, quantity - 1)}
                          className="flex items-center justify-center w-7 h-7 text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <Minus size={10} />
                        </button>
                        <span className="text-[12px] font-semibold text-gray-700 w-7 text-center border-x border-gray-200">
                          {quantity}
                        </span>
                        <button
                          onClick={() => onUpdateBundleQty(bundle.id, quantity + 1)}
                          disabled={atMax}
                          className="flex items-center justify-center w-7 h-7 text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <Plus size={10} />
                        </button>
                      </div>
                    )}
                    <span className={`text-[13px] font-bold shrink-0 ${overStock ? "text-rose-400" : "text-gray-800"}`}>
                      ${lineTotal.toLocaleString("es-CO")}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
          {items.map(({ variant, quantity }) => {
            const name     = variant.product?.name ?? "Producto";
            const brand    = variant.product?.brand?.name ?? "";
            const attrs    = (variant.attributes ?? [])
              .map((a) => a.attributeValue?.value).filter(Boolean).join(", ");
            const rawImg   = variant.images?.find((i) => Number(i.slot) === 1)?.imageUrl
                          ?? variant.images?.[0]?.imageUrl ?? null;
            const maxStock = getAvailableUnits(variant);
            const atMax    = quantity >= maxStock;
            const overStock = quantity > maxStock;
            const lineTotal = Number(variant.price) * quantity;
            const sub      = lineTotal.toLocaleString("es-CO");
            // Precio final por producto ya calculado y validado por el backend
            // (no se calcula acá cuánto "le toca" a cada línea).
            const lineDiscount = coupon?.lineDiscounts?.find((d) => d.variantId === variant.id);
            const hasLineDiscount = lineDiscount && lineDiscount.lineAmount < lineTotal;
            // Promoción de producto (automática, sin cupón) — el cupón, si aplica
            // a esta línea, ya incorpora este descuento (ver hasLineDiscount arriba).
            const hasPromotionOnly = !hasLineDiscount && !!variant.promotion;
            const promoLineAmount = Number(variant.finalPrice ?? variant.price) * quantity;
            const discountPercent = hasPromotionOnly && Number(variant.price) > 0
              ? Math.round((1 - Number(variant.finalPrice) / Number(variant.price)) * 100)
              : 0;

            return (
              <div key={variant.id} className="flex gap-3 px-5 py-4">
                {/* Imagen */}
                <div className="relative w-14 h-14 rounded-xl bg-gray-50 border border-gray-100 shrink-0 overflow-hidden">
                  {rawImg ? (
                    <img src={`${API_URL}${rawImg}`} alt={name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-200">
                      <ShoppingBag size={16} />
                    </div>
                  )}
                  {discountPercent > 0 && (
                    <span className="absolute top-0.5 right-0.5 text-[8px] font-black px-1 py-0.5 rounded bg-rose-500 text-white shadow-sm leading-none">
                      -{discountPercent}%
                    </span>
                  )}
                </div>

                {/* Info + controles */}
                <div className="flex-1 min-w-0 flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      {brand && <p className="text-[10px] font-bold uppercase tracking-wider text-rose-400 truncate">{brand}</p>}
                      <p className="text-[12px] font-semibold text-gray-800 leading-snug line-clamp-2">{name}</p>
                      {attrs && <p className="text-[10px] text-gray-400 mt-0.5">{attrs}</p>}
                    </div>
                    {/* Eliminar */}
                    {!pendingPayment && (
                      <button
                        onClick={() => onRemove(variant.id)}
                        className="shrink-0 flex items-center justify-center w-6 h-6 rounded-lg text-gray-300 hover:text-rose-400 hover:bg-rose-50 transition-colors"
                        aria-label="Eliminar"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>

                  {/* Error de stock inline */}
                  {overStock && (
                    <p className="text-[11px] text-rose-500 font-medium flex items-center gap-1">
                      <AlertCircle size={11} className="shrink-0" />
                      {maxStock === 0 ? "Producto agotado" : `Solo quedan ${maxStock} disponibles`}
                    </p>
                  )}
                  {orderError?.productVariantId === variant.id && (
                    <p className="text-[11px] text-rose-500 font-medium flex items-center gap-1">
                      <AlertCircle size={11} className="shrink-0" />
                      {orderError.message}
                    </p>
                  )}

                  {/* Cantidad + precio */}
                  <div className="flex items-center justify-between">
                    {pendingPayment ? (
                      <span className="text-[11px] text-gray-400">× {quantity}</span>
                    ) : (
                      <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                        <button
                          onClick={() => quantity === 1 ? onRemove(variant.id) : onUpdateQty(variant.id, quantity - 1)}
                          className="flex items-center justify-center w-7 h-7 text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <Minus size={10} />
                        </button>
                        <span className="text-[12px] font-semibold text-gray-700 w-7 text-center border-x border-gray-200">
                          {quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQty(variant.id, quantity + 1)}
                          disabled={atMax}
                          className="flex items-center justify-center w-7 h-7 text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <Plus size={10} />
                        </button>
                      </div>
                    )}
                    {hasLineDiscount ? (
                      <span className="flex flex-col items-end shrink-0 leading-none">
                        <span className="text-xs font-medium text-rose-300 line-through decoration-2">${sub}</span>
                        <span className="text-[13px] font-bold text-gray-800 mt-0.5">
                          ${lineDiscount.lineAmount.toLocaleString("es-CO")}
                        </span>
                      </span>
                    ) : hasPromotionOnly ? (
                      <span className="flex flex-col items-end shrink-0 leading-none">
                        <span className="text-xs font-medium text-gray-400 line-through decoration-2 opacity-70">${sub}</span>
                        <span className="text-[13px] font-bold text-rose-600 mt-0.5">
                          ${promoLineAmount.toLocaleString("es-CO")}
                        </span>
                      </span>
                    ) : (
                      <span className={`text-[13px] font-bold shrink-0 ${overStock ? "text-rose-400" : "text-gray-800"}`}>
                        ${sub}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Cupón de descuento */}
        {items.length > 0 && !pendingPayment && (
          <div className="px-5 py-4 border-t border-gray-50">
            {coupon ? (
              <div className="flex items-center justify-between gap-2 rounded-xl bg-emerald-50 border border-emerald-100 px-3 py-2">
                <span className="flex items-center gap-1.5 text-[12px] font-semibold text-emerald-700">
                  <CheckCircle2 size={13} className="shrink-0" />
                  Cupón <span className="font-mono">{coupon.code}</span> aplicado
                </span>
                <button
                  type="button"
                  onClick={onRemoveCoupon}
                  className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-800 transition-colors shrink-0"
                >
                  Quitar
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <input
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); onApplyCoupon(); } }}
                    placeholder="¿Tienes un cupón?"
                    className="flex-1 h-9 rounded-lg border border-gray-200 px-3 text-[12px] font-mono outline-none focus:border-rose-300 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={onApplyCoupon}
                    disabled={couponLoading || !couponInput.trim()}
                    className="h-9 px-3.5 rounded-lg bg-gray-800 hover:bg-gray-900 disabled:opacity-40 disabled:cursor-not-allowed text-white text-[11px] font-bold uppercase tracking-wider transition-colors shrink-0"
                  >
                    {couponLoading ? "..." : "Aplicar"}
                  </button>
                </div>
                {couponError && (
                  <p className="text-[11px] text-rose-500 font-medium flex items-center gap-1">
                    <AlertCircle size={11} className="shrink-0" />{couponError}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        <div className="px-5 py-4 bg-gray-50/50 border-t border-gray-100 flex flex-col gap-2">
          {totalLines > 0 && (
            <>
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>Subtotal</span>
                <span className="font-medium">${subtotal.toLocaleString("es-CO")}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-emerald-500 font-semibold">
                <span className="flex items-center gap-1.5"><Truck size={11} />Envío</span>
                <span>{shippingCost === 0 ? "Gratis" : `$${shippingCost.toLocaleString("es-CO")}`}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex items-center justify-between text-xs text-rose-500 font-semibold">
                  <span>Descuento ({coupon.code})</span>
                  <span>-${discountAmount.toLocaleString("es-CO")}</span>
                </div>
              )}
            </>
          )}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Total a pagar</span>
            <div className="flex items-baseline gap-1">
              <span className="text-xs text-gray-400 font-medium">COP</span>
              <span className="text-xl font-bold text-gray-900">${total.toLocaleString("es-CO")}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Pedido creado — checkout ePayco se abre automáticamente */}
      {pendingPayment ? (
        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={onRetryPayment}
            disabled={retrying}
            className="w-full h-12 rounded-xl flex items-center justify-center gap-2.5 bg-rose-500 hover:bg-rose-600 active:bg-rose-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-xs font-bold tracking-widest uppercase transition-colors shadow-sm shadow-rose-200"
          >
            {retrying
              ? <><Loader2 size={15} className="animate-spin" /> Verificando…</>
              : <><ShoppingBag size={15} /> Pagar ahora</>
            }
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={onPay}
          disabled={loading || totalLines === 0 || hasStockIssue}
          className="w-full h-12 rounded-xl flex items-center justify-center gap-2.5 bg-rose-500 hover:bg-rose-600 active:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold tracking-widest uppercase transition-colors shadow-sm shadow-rose-200"
        >
          {loading
            ? <><Loader2 size={15} className="animate-spin" /> Procesando…</>
            : <><ShoppingBag size={15} /> Proceder al pago</>
          }
        </button>
      )}

      <p className="text-center text-[10px] text-gray-300 leading-relaxed">
        Pagos procesados de forma segura por ePayco
      </p>
    </div>
  );
}

// ── Página principal ──────────────────────────────────────────────────────────

export default function Checkout() {
  usePageTitle("Finalizar compra");
  const navigate = useNavigate();

  const {
    cartItems, cartBundleItems, cartOpen, setCartOpen,
    updateQty, removeFromCart, cartUuid,
    updateBundleQty, removeBundleFromCart,
  } = usePublicCart();

  const { wishlistItems, setWishlistOpen } = usePublicWishlist(cartUuid);

  const {
    departments, municipalities,
    selectedDepartment, setSelectedDepartment,
    loading: loadingLocs,
  } = useCreateShippingLocations();

  const [form, setForm] = useState(() => {
    try {
      const saved = localStorage.getItem("checkout_form");
      return saved ? { ...EMPTY, ...JSON.parse(saved) } : EMPTY;
    } catch { return EMPTY; }
  });
  const [errors, setErrors]           = useState({});
  const [submitting, setSubmitting]   = useState(false);
  const [openPersonal, setOpenPersonal] = useState(true);
  const [openAddress,  setOpenAddress]  = useState(true);
  // pendingPayment se setea luego de crear la orden exitosamente
  const [pendingPayment, setPendingPayment] = useState(null);
  const [retrying, setRetrying] = useState(false);
  // Error de creación de orden atado a un producto/combo puntual (p.ej. se
  // agotó, cambió de precio o ya no existe) — se muestra junto a esa línea
  // del resumen en vez de un toast genérico, { productVariantId|bundleId, message }
  const [orderError, setOrderError] = useState(null);

  // ── Cupón de descuento ──
  const [couponInput, setCouponInput]   = useState("");
  const [coupon, setCoupon]             = useState(null); // { code, type, discountAmount, freeShipping }
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError]     = useState("");

  const keyRef = useRef(uid());

  // Persistir el formulario en localStorage mientras el usuario escribe
  useEffect(() => {
    if (pendingPayment) return; // no sobreescribir si ya se creó la orden
    try { localStorage.setItem("checkout_form", JSON.stringify(form)); } catch { /* noop */ }
  }, [form, pendingPayment]);

  const cartCount   = cartItems.reduce((s, i) => s + i.quantity, 0)
    + cartBundleItems.reduce((s, i) => s + i.quantity, 0);

  // Si ya hay un pago en curso, la orden ya se creó con lo que había en el
  // carrito — no hay que mostrar el estado vacío aunque el carrito local
  // ahora esté en 0 (el resumen de esa orden sigue siendo válido).
  const cartIsEmpty = cartItems.length === 0 && cartBundleItems.length === 0 && !pendingPayment;

  // Restaurar el departamento seleccionado cuando los datos de localidad cargan
  useEffect(() => {
    if (!departments.length || !form.departament) return;
    const dep = departments.find((d) => d.name === form.departament);
    if (dep) setSelectedDepartment(String(dep.id));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [departments]);

  // Se llama cada vez que el cliente reabre la pasarela (incluido después de
  // cancelar ePayco sin pagar) — nunca reabre a ciegas con datos guardados en
  // el navegador. Primero le pregunta al backend si el pedido sigue vigente:
  // si pasaron más de 30 min sin pagar, releaseExpiredReservations ya canceló
  // la orden y liberó el stock reservado, así que reabrir la pasarela con esa
  // referencia sería cobrar por algo que ya no está garantizado. En ese caso
  // se limpia todo para que el cliente arme el pedido de nuevo desde cero
  // (eso sí vuelve a pasar por createOrder, que revalida precio y stock).
  async function retryPayment() {
    if (!pendingPayment) return;
    setRetrying(true);
    try {
      const res = await fetch(
        `${API}/payment/verify?reference=${encodeURIComponent(pendingPayment.reference)}&cartUuid=${encodeURIComponent(cartUuid)}`
      );
      if (!res.ok) throw new Error("No se pudo verificar tu pedido. Intenta de nuevo.");
      const data = await res.json();

      if (data.orderStatus && data.orderStatus !== "PENDING") {
        toast.error("Tu pedido anterior ya no está disponible (expiró o cambió de estado). Arma el pedido de nuevo para validar el stock actual.");
        setPendingPayment(null);
        keyRef.current = uid();
        return;
      }

      // Aunque la orden siga vigente, el backend revisa en vivo si algún
      // producto/variante de la orden se desactivó o se quedó sin stock
      // mientras el cliente tenía la pasarela abierta (p.ej. un admin lo
      // desactivó o corrigió el inventario) — si pasó, no se puede pagar.
      if (data.unavailableProduct) {
        toast.error(`"${data.unavailableProduct}" ya no está disponible. Arma el pedido de nuevo para validar el stock actual.`);
        setPendingPayment(null);
        keyRef.current = uid();
        return;
      }

      await openEpaycoCheckout({
        reference: pendingPayment.reference,
        total: pendingPayment.total,
        form: pendingPayment.form,
      });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setRetrying(false);
    }
  }

  async function applyCoupon() {
    const code = couponInput.trim();
    if (!code) return;

    setCouponLoading(true);
    setCouponError("");

    try {
      const res = await fetch(`${API}/discount-code/validate`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          items: cartItems.map(({ variant, quantity }) => ({
            productVariantId: variant.id,
            quantity,
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setCoupon(null);
        setCouponError(data.message ?? "Cupón no válido");
        return;
      }

      setCoupon(data.data);
      setCouponError("");
    } catch {
      setCoupon(null);
      setCouponError("Error de conexión al validar el cupón");
    } finally {
      setCouponLoading(false);
    }
  }

  function removeCoupon() {
    setCoupon(null);
    setCouponInput("");
    setCouponError("");
  }


  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  }

  function handleDepartmentChange(e) {
    const depId = e.target.value;
    const dep   = departments.find((d) => d.id === Number(depId));
    setSelectedDepartment(depId);
    setForm((prev) => ({ ...prev, departament: dep?.name ?? "", municipality: "" }));
    setErrors((prev) => ({ ...prev, departament: "", municipality: "" }));
  }

  function handleMunicipalityChange(e) {
    setForm((prev) => ({ ...prev, municipality: e.target.value }));
    if (errors.municipality) setErrors((prev) => ({ ...prev, municipality: "" }));
  }

  function scrollToFirstError() {
    requestAnimationFrame(() => {
      document.querySelector("[data-field-error]")
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }

  // Decide a qué línea del resumen pertenece un error de /order/create: si
  // trae bundleId, directo a ese combo; si trae productVariantId, puede ser
  // un ítem suelto o el componente de un combo (fijo o elegido en selections)
  // — en ese caso el error se muestra en el combo, no en una línea que no
  // existe en el resumen.
  function resolveOrderErrorTarget({ productVariantId, bundleId }) {
    if (bundleId) return { bundleId };
    if (!productVariantId) return null;

    const isPlainItem = cartItems.some((i) => i.variant.id === productVariantId);
    if (isPlainItem) return { productVariantId };

    const owningBundle = cartBundleItems.find((bi) =>
      bi.bundle.items?.some((recipeItem) => {
        const resolvedId = recipeItem.productVariantId ?? bi.selections?.[recipeItem.id];
        return resolvedId === productVariantId;
      })
    );
    if (owningBundle) return { bundleId: owningBundle.bundle.id };

    return { productVariantId };
  }

  async function handlePay() {
    if (cartItems.length === 0 && cartBundleItems.length === 0) {
      toast.error("Tu carrito está vacío. Agrega productos antes de continuar.");
      return;
    }

    const errs = validateForm(form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      scrollToFirstError();
      return;
    }

    setOrderError(null);
    setSubmitting(true);

    try {
      const tel = form.phoneNumber.replace(/\s|-/g, "");

      // ── 1. Crear la orden ──────────────────────────────────────────────────
      const orderRes = await fetch(`${API}/order/create`, {
        method:  "POST",
        headers: {
          "Content-Type":      "application/json",
          "X-Idempotency-Key": keyRef.current,
        },
        body: JSON.stringify({
          ...form,
          phoneNumber: tel,
          items: cartItems.map(({ variant, quantity }) => ({
            productVariantId: variant.id,
            quantity,
            unitPrice: Number(variant.finalPrice ?? variant.price),
          })),
          bundleItems: cartBundleItems.map(({ bundle, quantity, selections }) => ({
            bundleId: bundle.id,
            quantity,
            selections: selectionsToPayload(selections),
          })),
          currency: "COP",
          discountCode: coupon?.code ?? null,
          cartUuid,
        }),
      });

      const orderData = await orderRes.json();

      if (orderRes.status === 429) throw new Error("Demasiados intentos. Espera unos minutos e intenta de nuevo.");

      if (!orderRes.ok) {
        // Errores atados a un producto o combo puntual (agotado, precio
        // cambiado, ya no existe) — se muestran junto a esa línea del
        // resumen en vez de un toast genérico, y no se sigue con el pago.
        if (orderData.productVariantId || orderData.bundleId) {
          setOrderError({ ...resolveOrderErrorTarget(orderData), message: orderData.message });
          return;
        }
        if (orderRes.status === 400 && orderData.message) {
          // Cupón inválido/expirado detectado en el servidor al crear la orden
          setCoupon(null);
        }
        throw new Error(orderData.message ?? "Error al crear la orden.");
      }

      const order = orderData.order;
      // Monto autoritativo: el total ya recalculado por el servidor (incluye
      // el descuento del cupón validado ahí), nunca el estimado del cliente.
      const orderTotal = Number(order.total);

      // ── 2. Crear registro de pago (PENDING) ────────────────────────────────
      const payRes = await fetch(`${API}/payment/create`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId:   order.id,
          provider:  "epayco",
          reference: order.orderNumber,
          amount:    orderTotal,
          currency:  "COP",
          cartUuid,
        }),
      });

      if (!payRes.ok) {
        const pd = await payRes.json().catch(() => ({}));
        throw new Error(pd.message ?? "Error al inicializar el pago.");
      }

      keyRef.current = uid();

      try { localStorage.removeItem("checkout_form"); } catch { /* noop */ }
      const paymentInfo = {
        orderNumber: order.orderNumber,
        reference:   order.orderNumber,
        total:       orderTotal,
        form: { ...form, phoneNumber: tel },
      };
      setPendingPayment(paymentInfo);

      // ── 3. Abrir la pasarela de ePayco (modo programático, botón propio) ──
      await openEpaycoCheckout({ reference: paymentInfo.reference, total: orderTotal, form: paymentInfo.form });

    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <HomeHeader
        cartCount={cartCount}
        onCartOpen={() => setCartOpen(true)}
        wishlistCount={wishlistItems.length}
        onWishlistOpen={() => setWishlistOpen(true)}
        onSearch={() => navigate("/")}
      />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 pt-4 sm:pt-5 pb-8">

        {/* Encabezado */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            disabled={!!pendingPayment}
            className="flex items-center justify-center w-8 h-8 rounded-xl bg-white border border-gray-200 text-gray-400 hover:text-gray-700 hover:border-gray-300 transition-colors shadow-sm disabled:opacity-30 disabled:cursor-not-allowed mb-3"
            aria-label="Volver"
          >
            <ArrowLeft size={15} />
          </button>
          <h1
            className="text-2xl sm:text-3xl font-black text-center"
            style={{ color: "#4b5563", WebkitTextStroke: "1.5px #4b5563", letterSpacing: "0.1em" }}
          >
            Detalle de la compra
          </h1>
        </div>

        {cartIsEmpty ? (
          <div className="flex flex-col items-center justify-center text-center py-20 gap-4">
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-rose-50 border border-rose-100 text-rose-300">
              <ShoppingBag size={28} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Tu carrito está vacío</h2>
            <p className="text-sm text-gray-400 max-w-xs">
              Para seguir comprando, navega por las categorías en el sitio o busca tu producto.
            </p>
            <button
              onClick={() => navigate("/")}
              className="mt-2 px-6 py-2.5 rounded-full bg-rose-500 hover:bg-rose-600 active:bg-rose-700 text-white text-sm font-semibold tracking-wide transition-colors shadow-sm shadow-rose-200"
            >
              Elegir productos
            </button>
          </div>
        ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 items-start">

          {/* ── Formulario ── */}
          <div className="flex flex-col gap-6">

            {/* Información personal */}
            <CollapsibleSection
              title="Información personal"
              icon={User}
              open={openPersonal}
              onToggle={() => !pendingPayment && setOpenPersonal((v) => !v)}
              disabled={!!pendingPayment}
              hasError={!!(errors.firstName || errors.lastName || errors.documentNumber || errors.phoneNumber || errors.email)}
            >
              <div className="grid grid-cols-2 gap-3">
                <TextField name="firstName"  value={form.firstName}  onChange={handleChange} error={errors.firstName}  disabled={!!pendingPayment} />
                <TextField name="lastName"   value={form.lastName}   onChange={handleChange} error={errors.lastName}   disabled={!!pendingPayment} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <TextField name="documentNumber" value={form.documentNumber} onChange={handleChange}
                  error={errors.documentNumber} inputMode="numeric" disabled={!!pendingPayment} />
                <TextField name="phoneNumber"    value={form.phoneNumber}    onChange={handleChange}
                  error={errors.phoneNumber} inputMode="tel" disabled={!!pendingPayment} />
              </div>
              <TextField name="email" value={form.email} onChange={handleChange}
                error={errors.email} inputMode="email" disabled={!!pendingPayment} />
            </CollapsibleSection>

            {/* Dirección de entrega */}
            <CollapsibleSection
              title="Dirección de entrega"
              icon={MapPin}
              open={openAddress}
              onToggle={() => !pendingPayment && setOpenAddress((v) => !v)}
              disabled={!!pendingPayment}
              hasError={!!(errors.departament || errors.municipality || errors.address)}
            >
              {/* Departamento */}
              <div className="flex flex-col gap-1" data-field="departament">
                <FieldLabel name="departament" />
                <div className="relative">
                  <select
                    id="departament"
                    value={selectedDepartment || ""}
                    onChange={handleDepartmentChange}
                    disabled={(loadingLocs && departments.length === 0) || !!pendingPayment}
                    className={selectCls(errors.departament)}
                  >
                    <option value="" disabled>
                      {loadingLocs && departments.length === 0 ? "Cargando departamentos…" : "Selecciona un departamento"}
                    </option>
                    {departments.map((dep) => (
                      <option key={dep.id} value={dep.id}>{dep.name}</option>
                    ))}
                  </select>
                  <SelectArrow />
                </div>
                {errors.departament && (
                  <p className="text-[11px] text-rose-400 flex items-center gap-1" data-field-error>
                    <AlertCircle size={11} className="shrink-0" />{errors.departament}
                  </p>
                )}
              </div>

              {/* Municipio */}
              <div className="flex flex-col gap-1" data-field="municipality">
                <FieldLabel name="municipality" />
                <div className="relative">
                  <select
                    id="municipality"
                    value={form.municipality || ""}
                    onChange={handleMunicipalityChange}
                    disabled={!selectedDepartment || loadingLocs || !!pendingPayment}
                    className={selectCls(errors.municipality)}
                  >
                    <option value="" disabled>
                      {!selectedDepartment
                        ? "Primero elige un departamento"
                        : loadingLocs
                        ? "Cargando municipios…"
                        : "Selecciona un municipio"}
                    </option>
                    {municipalities.map((mun) => (
                      <option key={mun.id} value={mun.name}>{mun.name}</option>
                    ))}
                  </select>
                  <SelectArrow />
                </div>
                {errors.municipality && (
                  <p className="text-[11px] text-rose-400 flex items-center gap-1" data-field-error>
                    <AlertCircle size={11} className="shrink-0" />{errors.municipality}
                  </p>
                )}
              </div>

              <TextField name="address"           value={form.address}           onChange={handleChange} error={errors.address}           disabled={!!pendingPayment} />
              <TextField name="additionalDetails" value={form.additionalDetails} onChange={handleChange} error={errors.additionalDetails} disabled={!!pendingPayment} multiline />
            </CollapsibleSection>
          </div>

          {/* ── Resumen sticky ── */}
          <div className="lg:sticky lg:top-24">
            <OrderSummary
              items={cartItems}
              bundleItems={cartBundleItems}
              pendingPayment={pendingPayment}
              onRetryPayment={retryPayment}
              retrying={retrying}
              onPay={handlePay}
              loading={submitting}
              onUpdateQty={updateQty}
              onRemove={removeFromCart}
              onUpdateBundleQty={updateBundleQty}
              onRemoveBundle={removeBundleFromCart}
              orderError={orderError}
              couponInput={couponInput}
              setCouponInput={setCouponInput}
              coupon={coupon}
              couponLoading={couponLoading}
              couponError={couponError}
              onApplyCoupon={applyCoupon}
              onRemoveCoupon={removeCoupon}
            />
          </div>
        </div>
        )}
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
        onCheckout={() => setCartOpen(false)}
      />
    </div>
  );
}
