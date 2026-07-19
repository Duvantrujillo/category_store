import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft, RotateCcw, CalendarClock, ShieldCheck, Ban,
  MessageCircle, Mail, Wallet, Repeat, Gift, Camera, HelpCircle,
} from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import HomeHeader from "../Home/components/header/HomeHeader";
import HomeFooter from "../Home/components/footer/HomeFooter";
import HomeCart from "../Home/components/cart/HomeCart";
import { usePublicCart } from "../Home/hooks/usePublicCart";
import { usePublicWishlist } from "../Home/hooks/usePublicWishlist";
import { usePageTitle } from "@/hooks/usePageTitle";

const RETURN_WINDOW = "15 días hábiles";

const WA_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER ?? "";
const SUPPORT_EMAIL = "hola@bloombeauty.com";

const SUMMARY_CARDS = [
  { icon: CalendarClock, label: "Plazo", value: RETURN_WINDOW },
  { icon: ShieldCheck, label: "Condición", value: "Producto sin uso y con empaque original" },
  { icon: MessageCircle, label: "Canal", value: "WhatsApp o correo" },
];

const PROCESS_STEPS = [
  {
    title: "Envía tu solicitud",
    text: "Comparte tu número de pedido y el motivo de la devolución por WhatsApp o correo.",
  },
  {
    title: "Validamos el caso",
    text: "Nuestro equipo revisa el estado del producto y confirma si aplica devolución, cambio o reembolso.",
  },
  {
    title: "Definimos la solución",
    text: "Si procede, te indicamos el siguiente paso con instrucciones claras y seguimiento del caso.",
  },
];

const FAQ_ITEMS = [
  {
    q: "¿Puedo devolver un producto abierto?",
    a: "Solo si llegó defectuoso, equivocado o con un problema de calidad. Por higiene, los productos abiertos normalmente no aplican para devolución.",
  },
  {
    q: "¿Qué información debo enviar?",
    a: "Tu número de pedido, una breve explicación del caso y, si aplica, fotos del producto o del empaque.",
  },
  {
    q: "¿Cuánto tarda la respuesta?",
    a: "Nuestro equipo revisa cada caso de forma manual y responde lo antes posible dentro del horario de atención.",
  },
];

const ATTACHMENT_TIPS = [
  "Número de pedido visible",
  "Foto del producto completo",
  "Imagen del empaque o etiqueta",
  "Descripción corta del problema",
];

function Section({ icon: Icon, title, children }) {
  return (
    <div className="rounded-3xl border border-rose-100 bg-white/95 p-5 shadow-sm shadow-rose-100/60 backdrop-blur-sm sm:p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-rose-400 to-fuchsia-400 text-white shadow-sm shadow-rose-200">
          <Icon size={16} />
        </div>
        <h2 className="text-sm font-semibold tracking-[0.18em] text-rose-900 uppercase">{title}</h2>
      </div>
      <div className="mt-4 text-[13px] leading-7 text-slate-600">{children}</div>
    </div>
  );
}

export default function Returns() {
  usePageTitle("Devoluciones");
  const navigate = useNavigate();
  const location = useLocation();

  const {
    cartItems, cartBundleItems, cartOpen, setCartOpen,
    updateQty, removeFromCart, cartUuid,
    updateBundleQty, removeBundleFromCart,
    gift, initializing,
  } = usePublicCart();
  const { wishlistItems, setWishlistOpen } = usePublicWishlist(cartUuid);
  const cartCount = cartItems.reduce((s, i) => s + i.quantity, 0)
    + cartBundleItems.reduce((s, i) => s + i.quantity, 0);

  useEffect(() => {
    if (location.hash === "#preguntas-frecuentes") {
      document.getElementById("preguntas-frecuentes")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [location.hash]);

  return (
    <div className="min-h-screen flex flex-col bg-[radial-gradient(circle_at_top,rgba(244,114,182,0.12),transparent_30%),radial-gradient(circle_at_80%_0,rgba(251,191,36,0.08),transparent_24%),linear-gradient(180deg,#fff7fb_0%,#fffdfd_100%)] text-slate-900">
      <HomeHeader
        cartCount={cartCount}
        onCartOpen={() => setCartOpen(true)}
        wishlistCount={wishlistItems.length}
        onWishlistOpen={() => setWishlistOpen(true)}
        onSearch={() => navigate("/")}
      />

      {/* Hero */}
      <div className="relative overflow-hidden border-b border-rose-100 bg-linear-to-br from-rose-50 via-pink-50 to-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(251,113,133,0.12),transparent_30%),radial-gradient(circle_at_left,rgba(244,114,182,0.1),transparent_26%)]" />
        <div className="absolute -right-12 top-4 h-40 w-40 rounded-full bg-rose-200/40 blur-3xl" />
        <div className="absolute -left-16 bottom-0 h-48 w-48 rounded-full bg-fuchsia-200/30 blur-3xl" />
        <div className="relative mx-auto flex max-w-5xl flex-col gap-8 px-4 py-10 sm:px-6 lg:flex-row lg:items-end lg:justify-between lg:py-14">
          <div className="max-w-2xl">
            <button
              onClick={() => navigate(-1)}
              className="mb-5 inline-flex items-center gap-2 rounded-full border border-rose-200 bg-white/80 px-3 py-1.5 text-[11px] font-semibold tracking-[0.22em] text-rose-500 uppercase shadow-sm shadow-rose-100/60 transition-colors hover:border-rose-300 hover:text-rose-700"
            >
              <ArrowLeft size={13} /> Volver
            </button>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-rose-200 bg-white/80 px-3 py-1.5 text-[11px] font-semibold tracking-[0.22em] text-rose-600 uppercase shadow-sm shadow-rose-100/70">
              <RotateCcw size={13} /> Centro de ayuda
            </div>
            <h1 className="max-w-xl text-3xl font-semibold tracking-tight text-rose-950 sm:text-4xl lg:text-5xl">
              Devoluciones
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-7 text-rose-900/70 sm:text-base">
              Te mostramos con claridad cómo iniciar una devolución, qué condiciones aplican y cuál es el canal correcto para resolver tu caso con el menor tiempo posible.
            </p>
          </div>

          <div className="w-full max-w-xl rounded-[2rem] border border-rose-100 bg-white/85 p-4 shadow-lg shadow-rose-100/50 backdrop-blur-sm sm:p-5">
            <div className="grid gap-3 sm:grid-cols-3">
              {SUMMARY_CARDS.map(({ icon: Icon, label, value }) => (
                <div key={label} className="rounded-2xl border border-rose-100 bg-rose-50/70 p-4">
                  <div className="flex items-center gap-2 text-rose-500">
                    <Icon size={15} />
                    <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-rose-500">{label}</span>
                  </div>
                  <p className="mt-3 text-sm font-medium leading-6 text-rose-950">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto flex w-full max-w-6xl flex-1 gap-6 px-4 pb-12 pt-6 sm:px-6 lg:gap-8">
        <div className="flex-1 space-y-5">
          <Section icon={CalendarClock} title="Plazo para devolver">
            <p>
              Tienes <strong className="font-semibold text-slate-900">{RETURN_WINDOW}</strong> desde que recibes tu pedido para solicitar una devolución o cambio. Pasado ese plazo no podemos procesar la solicitud.
            </p>
          </Section>

          <Section icon={ShieldCheck} title="Condiciones para aceptar la devolución">
            <ul className="space-y-2">
              <li className="flex gap-3"><span className="mt-2 h-1.5 w-1.5 rounded-full bg-rose-400 shrink-0" />El producto debe estar sin usar, sin abrir y en su empaque original.</li>
              <li className="flex gap-3"><span className="mt-2 h-1.5 w-1.5 rounded-full bg-rose-400 shrink-0" />Debe conservar todos sus sellos, etiquetas y accesorios.</li>
              <li className="flex gap-3"><span className="mt-2 h-1.5 w-1.5 rounded-full bg-rose-400 shrink-0" />Debes presentar el número de pedido con el que se realizó la compra.</li>
            </ul>
          </Section>

          <Section icon={Ban} title="Qué no aplica para devolución">
            <p>
              Por higiene y seguridad, los productos de maquillaje y cuidado personal que ya hayan sido abiertos o usados no pueden devolverse, salvo que hayan llegado defectuosos o equivocados; en ese caso sí aplica el cambio o reembolso.
            </p>
          </Section>

          <Section icon={Repeat} title="Cómo se resuelve tu devolución">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-rose-100 bg-rose-50/80 p-4 text-center">
                <Wallet size={16} className="mx-auto text-rose-500" />
                <span className="mt-2 block text-xs font-semibold uppercase tracking-[0.18em] text-rose-900">Reembolso</span>
              </div>
              <div className="rounded-2xl border border-rose-100 bg-rose-50/80 p-4 text-center">
                <Repeat size={16} className="mx-auto text-rose-500" />
                <span className="mt-2 block text-xs font-semibold uppercase tracking-[0.18em] text-rose-900">Cambio de producto</span>
              </div>
              <div className="rounded-2xl border border-rose-100 bg-rose-50/80 p-4 text-center">
                <Gift size={16} className="mx-auto text-rose-500" />
                <span className="mt-2 block text-xs font-semibold uppercase tracking-[0.18em] text-rose-900">Crédito en tienda</span>
              </div>
            </div>
          </Section>

          <Section icon={MessageCircle} title="Proceso de solicitud">
            <div className="space-y-4">
              {PROCESS_STEPS.map((step, index) => (
                <div key={step.title} className="flex gap-4 rounded-2xl border border-rose-100 bg-white/90 p-4 shadow-sm shadow-rose-100/40">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-rose-400 to-pink-400 text-xs font-semibold text-white">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-rose-950">{step.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-slate-600">{step.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <div id="preguntas-frecuentes" className="scroll-mt-24 rounded-[2rem] border border-rose-100 bg-white/95 p-5 shadow-sm shadow-rose-100/60 backdrop-blur-sm sm:p-6">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-rose-400 to-fuchsia-400 text-white shadow-sm shadow-rose-200">
                <HelpCircle size={16} />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-rose-500">Soporte rápido</p>
                <h2 className="mt-1 text-base font-semibold text-rose-950 sm:text-lg">Preguntas frecuentes</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                  Reunimos las dudas más comunes para que encuentres una respuesta clara sin tener que escribirnos primero.
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-3">
              {FAQ_ITEMS.map((item, index) => (
                <div
                  key={item.q}
                  className="rounded-2xl border border-rose-100 bg-rose-50/60 p-4 transition-colors hover:bg-rose-50"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-xs font-semibold text-rose-500 shadow-sm shadow-rose-100">
                      {index + 1}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-rose-950">{item.q}</h3>
                      <p className="mt-1 text-sm leading-6 text-slate-600">{item.a}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="hidden w-[20rem] shrink-0 lg:block">
          <div className="sticky top-6 space-y-4 rounded-[2rem] border border-rose-100 bg-white/95 p-5 shadow-lg shadow-rose-100/50 backdrop-blur-sm">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-rose-400">Atención al cliente</p>
              <h2 className="mt-2 text-lg font-semibold text-rose-950">Canales oficiales</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Usa uno de estos medios para abrir tu caso. Te recomendamos incluir el número de pedido y una foto si el producto llegó defectuoso o equivocado.
              </p>
            </div>

            <div className="space-y-3">
              {WA_NUMBER && (
                <a
                  href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent("¡Hola! Quiero solicitar una devolución de mi pedido.")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-12 items-center justify-center gap-2 rounded-full bg-[#25D366] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#1ebe5d]"
                >
                  <SiWhatsapp size={15} />
                  WhatsApp
                </a>
              )}
              <a
                href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent("Solicitud de devolución")}`}
                className="flex h-12 items-center justify-center gap-2 rounded-full border border-rose-200 bg-white px-4 text-sm font-semibold text-rose-900 transition-colors hover:bg-rose-50"
              >
                <Mail size={15} />
                Correo
              </a>
            </div>

            <div className="rounded-2xl border border-rose-100 bg-rose-50/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-400">Importante</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Las solicitudes fuera del plazo o sin la información mínima pueden requerir validación adicional.
              </p>
            </div>

            <div className="rounded-2xl border border-rose-100 bg-white p-4">
              <div className="flex items-center gap-2 text-rose-500">
                <Camera size={14} />
                <p className="text-xs font-semibold uppercase tracking-[0.2em]">Qué adjuntar</p>
              </div>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                {ATTACHMENT_TIPS.map((tip) => (
                  <li key={tip} className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-rose-300 shrink-0" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </aside>

      </main>

      <section className="mx-auto w-full max-w-6xl px-4 pb-12 sm:px-6 lg:hidden">
        <div className="rounded-[2rem] border border-rose-100 bg-white/95 p-5 shadow-lg shadow-rose-100/50 backdrop-blur-sm">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-rose-400">Atención al cliente</p>
            <h2 className="mt-2 text-lg font-semibold text-rose-950">Canales oficiales</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Usa uno de estos medios para abrir tu caso. Te recomendamos incluir el número de pedido y una foto si el producto llegó defectuoso o equivocado.
            </p>
          </div>

          <div className="mt-4 space-y-3 sm:flex sm:gap-3 sm:space-y-0">
            {WA_NUMBER && (
              <a
                href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent("¡Hola! Quiero solicitar una devolución de mi pedido.")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-[#25D366] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#1ebe5d]"
              >
                <SiWhatsapp size={15} />
                WhatsApp
              </a>
            )}
            <a
              href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent("Solicitud de devolución")}`}
              className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full border border-rose-200 bg-white px-4 text-sm font-semibold text-rose-900 transition-colors hover:bg-rose-50"
            >
              <Mail size={15} />
              Correo
            </a>
          </div>

          <div className="mt-4 rounded-2xl border border-rose-100 bg-rose-50/80 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-400">Importante</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Las solicitudes fuera del plazo o sin la información mínima pueden requerir validación adicional.
            </p>
          </div>

          <div className="mt-4 rounded-2xl border border-rose-100 bg-white p-4">
            <div className="flex items-center gap-2 text-rose-500">
              <Camera size={14} />
              <p className="text-xs font-semibold uppercase tracking-[0.2em]">Qué adjuntar</p>
            </div>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              {ATTACHMENT_TIPS.map((tip) => (
                <li key={tip} className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-rose-300 shrink-0" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

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
        gift={gift}
        initializing={initializing}
        cartUuid={cartUuid}
      />
    </div>
  );
}
