import { useState, Fragment } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  ArrowLeft, Loader2, AlertCircle, MapPin, Truck,
  CheckCircle2, Clock, XCircle, RotateCcw, Copy, Package, ClipboardList,
  CreditCard, History, ChevronDown, Receipt,
} from "lucide-react";
import HomeHeader from "../Home/components/header/HomeHeader";
import HomeFooter from "../Home/components/footer/HomeFooter";
import HomeCart from "../Home/components/cart/HomeCart";
import { usePublicCart } from "../Home/hooks/usePublicCart";
import { usePublicWishlist } from "../Home/hooks/usePublicWishlist";
import { formatMoneyCOP, formatDateTimeCO } from "@/lib/format";
import { usePageTitle } from "@/hooks/usePageTitle";

const API = import.meta.env.VITE_API_URL;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ORDER_STATUS = {
  PENDING:   { label: "Pendiente de pago", color: "bg-amber-50 text-amber-600 border-amber-100",   icon: Clock },
  PAID:      { label: "Pagado",            color: "bg-emerald-50 text-emerald-600 border-emerald-100", icon: CheckCircle2 },
  CANCELLED: { label: "Cancelado",         color: "bg-red-50 text-red-500 border-red-100",           icon: XCircle },
  REFUNDED:  { label: "Reembolsado",       color: "bg-orange-50 text-orange-600 border-orange-100",  icon: RotateCcw },
};

const ORDER_STATUS_NOTE = {
  PENDING:   "Aún no hemos confirmado tu pago. Si ya pagaste, puede tomar unos minutos en reflejarse.",
  CANCELLED: "Este pedido fue cancelado y no tendrá movimiento de envío.",
  REFUNDED:  "El valor de este pedido fue reembolsado.",
};

const PAYMENT_STATUS = {
  PENDING:  { label: "Pago pendiente",   color: "bg-amber-50 text-amber-600 border-amber-100" },
  APPROVED: { label: "Pago aprobado",    color: "bg-emerald-50 text-emerald-600 border-emerald-100" },
  DECLINED: { label: "Pago rechazado",   color: "bg-rose-50 text-rose-500 border-rose-100" },
  VOIDED:   { label: "Pago anulado",     color: "bg-gray-100 text-gray-500 border-gray-200" },
  ERROR:    { label: "Error en el pago", color: "bg-orange-50 text-orange-600 border-orange-100" },
};

const SHIPMENT_STEPS = [
  { key: "CREATED",   label: "Confirmado",  icon: Package },
  { key: "PREPARING", label: "Preparando",  icon: ClipboardList },
  { key: "SHIPPED",   label: "En camino",   icon: Truck },
  { key: "DELIVERED", label: "Entregado",   icon: CheckCircle2 },
];

const SHIPMENT_STATUS_LABEL = {
  CREATED:   "Envío creado",
  PREPARING: "Preparando pedido",
  SHIPPED:   "En camino",
  DELIVERED: "Entregado",
  RETURNED:  "Devuelto",
};

const CARRIER_LABEL = {
  SERVIENTREGA:    "Servientrega",
  INTERRAPIDISIMO: "Interrapidísimo",
  COORDINADORA:    "Coordinadora",
  ENVIA:           "Envía",
};

function StatusBadge({ map, value, size = "sm" }) {
  const cfg = map[value] ?? { label: value, color: "bg-gray-100 text-gray-500 border-gray-200" };
  const Icon = cfg.icon;
  const pad = size === "lg" ? "px-3.5 py-1.5 text-[12px]" : "px-3 py-1 text-[11px]";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border font-semibold ${pad} ${cfg.color}`}>
      {Icon && <Icon size={size === "lg" ? 13 : 12} />}
      {cfg.label}
    </span>
  );
}

const DATE_OPTS = { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" };
const formatDate  = (d) => formatDateTimeCO(d, DATE_OPTS);
const formatMoney = formatMoneyCOP;

function copyValue(value, label) {
  if (!value) return;
  if (!navigator.clipboard) {
    toast.error("Tu navegador no permite copiar automáticamente");
    return;
  }
  navigator.clipboard.writeText(value)
    .then(() => toast.success(`${label} copiado`))
    .catch(() => toast.error(`No se pudo copiar ${label.toLowerCase()}`));
}

function CopyButton({ value, label }) {
  return (
    <button
      type="button"
      onClick={() => copyValue(value, label)}
      className="flex items-center justify-center w-6 h-6 rounded-lg text-gray-300 hover:text-rose-400 hover:bg-rose-50 transition-colors shrink-0"
      aria-label={`Copiar ${label}`}
    >
      <Copy size={12} />
    </button>
  );
}

function ShipmentProgress({ status }) {
  const isReturned = status === "RETURNED";
  const activeIndex = isReturned
    ? SHIPMENT_STEPS.length - 1
    : SHIPMENT_STEPS.findIndex((s) => s.key === status);

  return (
    <div className="flex items-start">
      {SHIPMENT_STEPS.map((step, idx) => {
        const done = idx <= activeIndex;
        const current = idx === activeIndex && !isReturned;
        const Icon = step.icon;
        return (
          <Fragment key={step.key}>
            <div className="flex flex-col items-center gap-1.5 shrink-0 w-16">
              <div
                className={`flex items-center justify-center w-9 h-9 rounded-full border-2 transition-colors ${
                  done ? "bg-rose-500 border-rose-500 text-white" : "bg-white border-gray-200 text-gray-300"
                } ${current ? "ring-4 ring-rose-100" : ""}`}
              >
                <Icon size={15} />
              </div>
              <span className={`text-[10px] font-semibold text-center leading-tight ${done ? "text-rose-600" : "text-gray-300"}`}>
                {step.label}
              </span>
            </div>
            {idx < SHIPMENT_STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mt-[18px] rounded-full transition-colors ${idx < activeIndex ? "bg-rose-400" : "bg-gray-200"}`} />
            )}
          </Fragment>
        );
      })}
    </div>
  );
}

const SECTION_TONES = {
  rose:   "bg-rose-50 text-rose-400",
  blue:   "bg-blue-50 text-blue-500",
  green:  "bg-emerald-50 text-emerald-500",
  violet: "bg-violet-50 text-violet-500",
};

function Section({ icon: Icon, title, tone = "rose", right, children }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          {Icon && (
            <div className={`flex items-center justify-center w-6 h-6 rounded-lg ${SECTION_TONES[tone]}`}>
              <Icon size={13} />
            </div>
          )}
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{title}</p>
        </div>
        {right}
      </div>
      {children}
    </div>
  );
}

export default function TrackOrder() {
  usePageTitle("Rastrear pedido");
  const navigate = useNavigate();

  const { cartItems, cartOpen, setCartOpen, updateQty, removeFromCart, cartUuid } = usePublicCart();
  const { wishlistItems, setWishlistOpen } = usePublicWishlist(cartUuid);
  const cartCount = cartItems.reduce((s, i) => s + i.quantity, 0);

  const [form, setForm]           = useState({ orderNumber: "", email: "" });
  const [errors, setErrors]       = useState({});
  const [loading, setLoading]     = useState(false);
  const [order, setOrder]         = useState(null);
  const [notFound, setNotFound]   = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  }

  function validate() {
    const errs = {};
    if (!form.orderNumber.trim())               errs.orderNumber = "Ingresa el número de pedido";
    if (!form.email.trim())                     errs.email = "Ingresa el correo electrónico";
    else if (!EMAIL_RE.test(form.email.trim())) errs.email = "Formato de correo inválido";
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    setNotFound(false);
    setOrder(null);
    setShowHistory(false);

    try {
      const params = new URLSearchParams({
        orderNumber: form.orderNumber.trim(),
        email: form.email.trim(),
      });
      const res = await fetch(`${API}/order/track?${params.toString()}`);
      const data = await res.json().catch(() => ({}));

      if (res.status === 404) { setNotFound(true); return; }
      if (res.status === 429) throw new Error(data.message ?? "Demasiados intentos. Espera unos minutos e intenta de nuevo.");
      if (!res.ok) throw new Error(data.message ?? "No fue posible consultar el pedido.");

      setOrder(data.order);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  const statusNote = order ? ORDER_STATUS_NOTE[order.status] : null;
  const history = order?.shipment?.history ?? [];
  const historyDesc = [...history].reverse();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <HomeHeader
        cartCount={cartCount}
        onCartOpen={() => setCartOpen(true)}
        wishlistCount={wishlistItems.length}
        onWishlistOpen={() => setWishlistOpen(true)}
        onSearch={() => navigate("/")}
      />

      {/* Hero */}
      <div className="bg-linear-to-b from-rose-50 via-rose-50/40 to-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-8 pb-16 flex flex-col items-center text-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="self-start flex items-center gap-1.5 text-[12px] font-semibold text-gray-400 hover:text-gray-600 transition-colors mb-2"
          >
            <ArrowLeft size={13} /> Volver
          </button>
          <h1
            className="text-2xl sm:text-3xl lg:text-4xl font-black"
            style={{ color: "#4b5563", WebkitTextStroke: "1.5px #4b5563", letterSpacing: "0.1em" }}
          >
            Consulta tu pedido
          </h1>
          <p className="text-[13px] text-gray-500 max-w-md leading-relaxed">
            Ingresa el número de pedido y el correo electrónico que usaste al comprar para ver el estado en tiempo real.
          </p>
        </div>
      </div>

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 -mt-10 pb-12">

        {/* Formulario de consulta */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-md shadow-gray-200/40 p-5 sm:p-6 flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Número de pedido</label>
              <input
                type="text"
                name="orderNumber"
                value={form.orderNumber}
                onChange={handleChange}
                placeholder="Ej: ORD-1730000000000-AB12CD34"
                className={`w-full h-11 rounded-xl border px-3.5 text-[13px] font-mono text-gray-800 bg-gray-50 outline-none transition-colors focus:bg-white ${
                  errors.orderNumber ? "border-rose-300 focus:border-rose-400 ring-1 ring-rose-200" : "border-gray-200 focus:border-rose-300"
                }`}
              />
              {errors.orderNumber && (
                <p className="text-[11px] text-rose-400 flex items-center gap-1">
                  <AlertCircle size={11} className="shrink-0" />{errors.orderNumber}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Correo electrónico</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="tu@correo.com"
                className={`w-full h-11 rounded-xl border px-3.5 text-[13px] text-gray-800 bg-gray-50 outline-none transition-colors focus:bg-white ${
                  errors.email ? "border-rose-300 focus:border-rose-400 ring-1 ring-rose-200" : "border-gray-200 focus:border-rose-300"
                }`}
              />
              {errors.email && (
                <p className="text-[11px] text-rose-400 flex items-center gap-1">
                  <AlertCircle size={11} className="shrink-0" />{errors.email}
                </p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-xl flex items-center justify-center gap-2 bg-rose-500 hover:bg-rose-600 active:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold tracking-widest uppercase transition-colors shadow-sm shadow-rose-200"
          >
            {loading ? <><Loader2 size={15} className="animate-spin" /> Consultando…</> : "Consultar pedido"}
          </button>
        </form>

        {/* No encontrado */}
        {notFound && (
          <div className="mt-6 rounded-2xl bg-white border border-rose-100 shadow-sm px-5 py-8 flex flex-col items-center text-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-rose-50">
              <AlertCircle size={20} className="text-rose-400" />
            </div>
            <p className="text-sm font-semibold text-gray-700">No encontramos tu pedido</p>
            <p className="text-[12px] text-gray-400 max-w-sm leading-relaxed">
              Verifica que el número de pedido y el correo electrónico sean exactamente los que usaste al momento de la compra.
            </p>
          </div>
        )}

        {/* Resultado */}
        {order && (
          <div className="mt-6 flex flex-col gap-5">

            {/* Encabezado del pedido */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-5 sm:p-6 flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Número de pedido</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <p className="text-base font-mono font-bold text-gray-800">{order.orderNumber}</p>
                    <CopyButton value={order.orderNumber} label="Número de pedido" />
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1.5">Realizado el {formatDate(order.createdAt)}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <StatusBadge map={ORDER_STATUS} value={order.status} size="lg" />
                  <p className="text-lg font-bold text-gray-900">{formatMoney(order.total)} <span className="text-[11px] text-gray-400 font-medium">{order.currency}</span></p>
                </div>
              </div>

              {statusNote && (
                <div className="px-5 sm:px-6 py-3 bg-gray-50/70 border-t border-gray-100 flex items-start gap-2">
                  <AlertCircle size={13} className="text-gray-400 shrink-0 mt-0.5" />
                  <p className="text-[12px] text-gray-500 leading-relaxed">{statusNote}</p>
                </div>
              )}
            </div>

            {/* Progreso de envío */}
            {order.shipment && (
              <Section
                icon={Truck}
                title="Estado del envío"
                right={
                  <span className="text-[11px] font-semibold text-gray-500">
                    {SHIPMENT_STATUS_LABEL[order.shipment.status] ?? order.shipment.status}
                  </span>
                }
              >
                <div className="px-1 sm:px-3 py-2">
                  <ShipmentProgress status={order.shipment.status} />
                </div>

                {order.shipment.status === "RETURNED" && (
                  <div className="rounded-xl bg-orange-50 border border-orange-100 px-4 py-3 flex items-start gap-2.5">
                    <RotateCcw size={14} className="text-orange-400 shrink-0 mt-0.5" />
                    <p className="text-[12px] text-orange-600 leading-relaxed">
                      Este pedido fue devuelto luego de la entrega. Revisa el historial para más detalles.
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 pt-3 border-t border-gray-50 text-[12px]">
                  {order.shipment.carrier && (
                    <div className="flex items-center justify-between sm:justify-start sm:gap-2">
                      <span className="text-gray-400">Transportadora</span>
                      <span className="font-semibold text-gray-700">{CARRIER_LABEL[order.shipment.carrier] ?? order.shipment.carrier}</span>
                    </div>
                  )}
                  {order.shipment.trackingNumber && (
                    <div className="flex items-center justify-between sm:justify-start sm:gap-2">
                      <span className="text-gray-400">Número de guía</span>
                      <span className="flex items-center gap-1 font-mono font-semibold text-gray-700">
                        {order.shipment.trackingNumber}
                        <CopyButton value={order.shipment.trackingNumber} label="Número de guía" />
                      </span>
                    </div>
                  )}
                  {order.shipment.shippedAt && (
                    <div className="flex items-center justify-between sm:justify-start sm:gap-2">
                      <span className="text-gray-400">Enviado</span>
                      <span className="font-semibold text-gray-700">{formatDate(order.shipment.shippedAt)}</span>
                    </div>
                  )}
                  {order.shipment.deliveredAt && (
                    <div className="flex items-center justify-between sm:justify-start sm:gap-2">
                      <span className="text-gray-400">Entregado</span>
                      <span className="font-semibold text-gray-700">{formatDate(order.shipment.deliveredAt)}</span>
                    </div>
                  )}
                </div>

                {historyDesc.length > 0 && (
                  <div className="pt-1 border-t border-gray-50">
                    <button
                      type="button"
                      onClick={() => setShowHistory((v) => !v)}
                      className="w-full flex items-center justify-between py-2 group"
                    >
                      <span className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider group-hover:text-rose-400 transition-colors">
                        <History size={12} /> Historial completo
                      </span>
                      <ChevronDown size={14} className={`text-gray-300 transition-transform ${showHistory ? "rotate-180" : ""}`} />
                    </button>

                    {showHistory && (
                      <div className="flex flex-col gap-4 pt-2 pb-1">
                        {historyDesc.map((h, idx) => (
                          <div key={idx} className="flex gap-3">
                            <div className="flex flex-col items-center pt-0.5">
                              <div className={`w-2 h-2 rounded-full shrink-0 ${idx === 0 ? "bg-rose-500" : "bg-gray-200"}`} />
                              {idx < historyDesc.length - 1 && <div className="w-px flex-1 bg-gray-100 mt-1" />}
                            </div>
                            <div className="pb-1">
                              <p className={`text-[12px] font-semibold ${idx === 0 ? "text-gray-800" : "text-gray-600"}`}>
                                {SHIPMENT_STATUS_LABEL[h.status] ?? h.status}
                              </p>
                              {h.note && <p className="text-[11px] text-gray-400 mt-0.5">{h.note}</p>}
                              <p className="text-[10px] text-gray-300 mt-0.5">{formatDate(h.createdAt)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </Section>
            )}

            {/* Dirección + Pago */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Section icon={MapPin} title="Dirección de entrega" tone="blue">
                <div className="text-[13px] text-gray-600 leading-relaxed">
                  <p className="font-semibold text-gray-800">{order.firstName} {order.lastName}</p>
                  <p>{order.address}</p>
                  <p>{order.municipality}, {order.departament}</p>
                </div>
              </Section>

              {order.payment && (
                <Section icon={CreditCard} title="Pago" tone="green">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[13px] text-gray-500">
                      {order.payment.paymentMethod || "Método no especificado"}
                    </p>
                    <StatusBadge map={PAYMENT_STATUS} value={order.payment.status} />
                  </div>
                </Section>
              )}
            </div>

            {/* Productos */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 sm:px-6 py-4 border-b border-gray-50 flex items-center gap-2">
                <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-violet-50">
                  <Receipt size={13} className="text-violet-500" />
                </div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                  Productos · {order.items.length}
                </p>
              </div>
              <div className="flex flex-col divide-y divide-gray-50">
                {order.items.map((item, idx) => {
                  const imageUrl = item.productVariant?.images?.[0]?.imageUrl;
                  return (
                  <div key={idx} className="flex items-center gap-3 px-5 sm:px-6 py-3.5">
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 shrink-0 text-gray-300 overflow-hidden">
                      {imageUrl ? (
                        <img src={`${API}${imageUrl}`} alt={item.productName} className="w-full h-full object-cover" />
                      ) : (
                        <Package size={16} />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[12px] font-semibold text-gray-800 leading-snug line-clamp-2">{item.productName}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">Cantidad: {item.quantity} · {formatMoney(item.unitPrice)} c/u</p>
                    </div>
                    <span className="text-[13px] font-bold text-gray-800 shrink-0">{formatMoney(item.subtotal)}</span>
                  </div>
                  );
                })}
              </div>
              <div className="px-5 sm:px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>Subtotal</span>
                  <span className="font-medium">{formatMoney(order.subtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>Envío</span>
                  <span className="font-medium">{order.shippingCost === 0 ? "Gratis" : formatMoney(order.shippingCost)}</span>
                </div>
                {Number(order.discountAmount) > 0 && (
                  <div className="flex items-center justify-between text-xs text-rose-500 font-semibold">
                    <span>Descuento ({order.discountCode?.code})</span>
                    <span>-{formatMoney(order.discountAmount)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Total</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xs text-gray-400 font-medium">{order.currency}</span>
                    <span className="text-lg font-bold text-gray-900">{formatMoney(order.total)}</span>
                  </div>
                </div>
              </div>
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
        onCheckout={() => setCartOpen(false)}
      />
    </div>
  );
}
