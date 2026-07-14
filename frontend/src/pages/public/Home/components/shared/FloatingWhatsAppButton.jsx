import { SiWhatsapp } from "react-icons/si";

const WA_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER ?? "";

// Botón flotante de contacto, visible en todo el sitio público (montado una
// sola vez desde PublicLayout). El leve rebote (keyframe gentleBounce en
// index.css) es intencionalmente sutil — solo un 1% de desplazamiento — para
// llamar la atención sin resultar molesto.
export default function FloatingWhatsAppButton() {
  if (!WA_NUMBER) return null;

  return (
    <a
      href={`https://wa.me/${WA_NUMBER}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escríbenos por WhatsApp"
      className="fixed bottom-5 right-5 z-40 flex items-center justify-center w-16 h-16 sm:w-14 sm:h-14 rounded-full bg-[#25D366] hover:bg-[#1ebe5d] active:bg-[#18a852] text-white shadow-lg shadow-emerald-900/25 transition-colors animate-[gentleBounce_2.4s_ease-in-out_infinite]"
    >
      <SiWhatsapp className="w-7 h-7 sm:w-[26px] sm:h-[26px]" />
    </a>
  );
}
