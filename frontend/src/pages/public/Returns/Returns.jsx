import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, RotateCcw, CalendarClock, ShieldCheck, Ban,
  MessageCircle, Mail, Wallet, Repeat, Gift,
} from "lucide-react";
import HomeHeader from "../Home/components/header/HomeHeader";
import HomeFooter from "../Home/components/footer/HomeFooter";
import HomeCart from "../Home/components/cart/HomeCart";
import { usePublicCart } from "../Home/hooks/usePublicCart";
import { usePublicWishlist } from "../Home/hooks/usePublicWishlist";
import { usePageTitle } from "@/hooks/usePageTitle";

const RETURN_WINDOW = "15 días hábiles";

const WA_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER ?? "";
const SUPPORT_EMAIL = "hola@bloombeauty.com";

function Section({ icon: Icon, title, children }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6 flex flex-col gap-3">
      <div className="flex items-center gap-2.5">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-rose-50 shrink-0">
          <Icon size={15} className="text-rose-400" />
        </div>
        <h2 className="text-sm font-bold text-gray-800">{title}</h2>
      </div>
      <div className="text-[13px] text-gray-500 leading-relaxed">{children}</div>
    </div>
  );
}

export default function Returns() {
  usePageTitle("Devoluciones");
  const navigate = useNavigate();

  const {
    cartItems, cartBundleItems, cartOpen, setCartOpen,
    updateQty, removeFromCart, cartUuid,
    updateBundleQty, removeBundleFromCart,
    gift, initializing,
  } = usePublicCart();
  const { wishlistItems, setWishlistOpen } = usePublicWishlist(cartUuid);
  const cartCount = cartItems.reduce((s, i) => s + i.quantity, 0)
    + cartBundleItems.reduce((s, i) => s + i.quantity, 0);

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
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-rose-100">
            <RotateCcw size={24} className="text-rose-500" />
          </div>
          <h1
            className="text-2xl sm:text-3xl lg:text-4xl font-black"
            style={{ color: "#4b5563", WebkitTextStroke: "1.5px #4b5563", letterSpacing: "0.1em" }}
          >
            Devoluciones
          </h1>
          <p className="text-[13px] text-gray-500 max-w-md leading-relaxed">
            Queremos que ames tu compra. Aquí te contamos cómo funciona nuestra
            política de devoluciones y cómo iniciar el proceso.
          </p>
        </div>
      </div>

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 -mt-10 pb-12 flex flex-col gap-5">

        <Section icon={CalendarClock} title="Plazo para devolver">
          <p>
            Tienes <strong className="text-gray-700">{RETURN_WINDOW}</strong> desde
            que recibes tu pedido para solicitar una devolución o cambio.
            Pasado ese plazo no podemos procesar la solicitud.
          </p>
        </Section>

        <Section icon={ShieldCheck} title="Condiciones para aceptar la devolución">
          <ul className="list-disc list-inside flex flex-col gap-1.5">
            <li>El producto debe estar sin usar, sin abrir y en su empaque original.</li>
            <li>Debe conservar todos sus sellos, etiquetas y accesorios.</li>
            <li>Debes presentar el número de pedido con el que se realizó la compra.</li>
          </ul>
        </Section>

        <Section icon={Ban} title="Qué no aplica para devolución">
          <p>
            Por higiene y seguridad, los productos de maquillaje y cuidado
            personal que ya hayan sido abiertos o usados no pueden devolverse,
            salvo que hayan llegado defectuosos o equivocados — en ese caso
            sí aplica el cambio o reembolso.
          </p>
        </Section>

        <Section icon={Repeat} title="Cómo se resuelve tu devolución">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-1">
            <div className="flex flex-col items-center text-center gap-1.5 rounded-xl border border-gray-100 p-3">
              <Wallet size={16} className="text-rose-400" />
              <span className="text-xs font-semibold text-gray-700">Reembolso</span>
            </div>
            <div className="flex flex-col items-center text-center gap-1.5 rounded-xl border border-gray-100 p-3">
              <Repeat size={16} className="text-rose-400" />
              <span className="text-xs font-semibold text-gray-700">Cambio de producto</span>
            </div>
            <div className="flex flex-col items-center text-center gap-1.5 rounded-xl border border-gray-100 p-3">
              <Gift size={16} className="text-rose-400" />
              <span className="text-xs font-semibold text-gray-700">Crédito en tienda</span>
            </div>
          </div>
        </Section>

        <Section icon={MessageCircle} title="¿Cómo inicio mi devolución?">
          <p className="mb-3">
            Escríbenos con tu número de pedido y el motivo de la devolución —
            nuestro equipo te confirma si aplica y te guía con los siguientes
            pasos.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            {WA_NUMBER && (
              <a
                href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent("¡Hola! Quiero solicitar una devolución de mi pedido.")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 h-11 rounded-xl flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1ebe5d] text-white text-xs font-bold tracking-widest uppercase transition-colors"
              >
                <MessageCircle size={14} />
                Escribir por WhatsApp
              </a>
            )}
            <a
              href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent("Solicitud de devolución")}`}
              className="flex-1 h-11 rounded-xl flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold tracking-widest uppercase transition-colors"
            >
              <Mail size={14} />
              Escribir por correo
            </a>
          </div>
        </Section>

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
        gift={gift}
        initializing={initializing}
      />
    </div>
  );
}
