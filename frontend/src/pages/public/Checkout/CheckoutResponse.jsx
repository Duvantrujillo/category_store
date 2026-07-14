import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle2, XCircle, Clock, Home, ShoppingBag, Loader2 } from "lucide-react";
import { usePageTitle } from "@/hooks/usePageTitle";

const API = import.meta.env.VITE_API_URL;

const DB_STATES = {
  APPROVED: {
    icon:    <CheckCircle2 size={44} className="text-emerald-400" />,
    bg:      "bg-emerald-50",
    title:   "¡Pago exitoso!",
    message: "Tu pago fue aprobado. Te enviaremos el detalle por correo y nos comunicaremos para coordinar el envío.",
    color:   "text-emerald-700",
    border:  "border-emerald-100",
  },
  DECLINED: {
    icon:    <XCircle size={44} className="text-rose-400" />,
    bg:      "bg-rose-50",
    title:   "Pago rechazado",
    message: "Tu pago fue rechazado. Puedes intentarlo de nuevo con otro método de pago.",
    color:   "text-rose-700",
    border:  "border-rose-100",
    retryable: true,
  },
  ERROR: {
    icon:    <XCircle size={44} className="text-orange-400" />,
    bg:      "bg-orange-50",
    title:   "Error en el pago",
    message: "Ocurrió un error al procesar tu pago. Tu pedido sigue creado — intenta pagar de nuevo o contáctanos.",
    color:   "text-orange-700",
    border:  "border-orange-100",
    retryable: true,
  },
  VOIDED: {
    icon:    <XCircle size={44} className="text-gray-400" />,
    bg:      "bg-gray-50",
    title:   "Pago anulado",
    message: "La transacción fue anulada.",
    color:   "text-gray-700",
    border:  "border-gray-100",
  },
  PENDING: {
    icon:    <Clock size={44} className="text-amber-400" />,
    bg:      "bg-amber-50",
    title:   "Pago en proceso",
    message: "Tu pago está siendo procesado. Te notificaremos cuando se confirme. Si pagaste en efectivo, puede tomar hasta 24 horas.",
    color:   "text-amber-700",
    border:  "border-amber-100",
  },
  // DB sigue PENDING después de reintentos cuando ePayco dijo Aceptada → webhook no llegó
  UNCONFIRMED: {
    icon:    <XCircle size={44} className="text-orange-400" />,
    bg:      "bg-orange-50",
    title:   "Error interno de pago",
    message: "No pudimos confirmar tu pago con la pasarela. Si realizaste el cobro, contáctanos con tu número de pedido para verificarlo manualmente.",
    color:   "text-orange-700",
    border:  "border-orange-100",
    retryable: true,
  },
};

const VERIFYING = {
  icon:   <Loader2 size={44} className="text-gray-300 animate-spin" />,
  bg:     "bg-gray-50",
  title:  "Verificando pago…",
  message: "Estamos confirmando el estado de tu transacción con la pasarela.",
  color:  "text-gray-600",
  border: "border-gray-100",
};

const UNKNOWN = {
  icon:    <Clock size={44} className="text-gray-400" />,
  bg:      "bg-gray-50",
  title:   "Estado desconocido",
  message: "No pudimos determinar el estado de tu pago. Revisa tu correo o contáctanos.",
  color:   "text-gray-700",
  border:  "border-gray-100",
};

// Máximo de reintentos cuando ePayco dice "Aceptada" pero la BD sigue PENDING.
// Cada reintento espera 2s → máximo ~10s de espera total para que llegue el webhook.
const MAX_RETRIES = 5;
const RETRY_MS    = 2000;

export default function CheckoutResponse() {
  usePageTitle("Resultado del pago");
  const [params]  = useSearchParams();
  const navigate  = useNavigate();

  const epaycoState  = params.get("x_transaction_state") ?? params.get("estado") ?? "";
  const invoice      = params.get("x_id_factura") ?? params.get("ref_payco") ?? "";
  const amount       = params.get("x_amount") ?? "";
  const franchise    = params.get("x_franchise") ?? "";
  const approvalCode = params.get("x_approval_code") ?? "";

  const [info, setInfo] = useState(invoice ? VERIFYING : UNKNOWN);

  useEffect(() => {
    if (!invoice) return;

    let cancelled = false;
    let retries   = 0;

    async function verify() {
      if (cancelled) return;
      try {
        // Mismo navegador que creó el pedido (ePayco redirige de vuelta aquí),
        // así que el cart_uuid guardado localmente sigue siendo válido — el
        // backend lo exige para confirmar que este pago es de quien pregunta.
        const cartUuid = localStorage.getItem("cart_uuid") ?? "";
        const res  = await fetch(`${API}/payment/verify?reference=${encodeURIComponent(invoice)}&cartUuid=${encodeURIComponent(cartUuid)}`);

        if (!res.ok) {
          // Pago aún no registrado o error de red — reintentar si ePayco dijo Aceptada
          if (epaycoState === "Aceptada" && retries < MAX_RETRIES && !cancelled) {
            retries++;
            setTimeout(verify, RETRY_MS);
          } else if (!cancelled) {
            setInfo(epaycoState === "Aceptada" ? DB_STATES.UNCONFIRMED : (DB_STATES[mapState(epaycoState)] ?? UNKNOWN));
          }
          return;
        }

        const { status } = await res.json();
        if (cancelled) return;

        if (status !== "PENDING") {
          // Webhook confirmó → mostrar estado real de la BD
          setInfo(DB_STATES[status] ?? UNKNOWN);
          return;
        }

        // BD sigue PENDING:
        // · ePayco "Aceptada" → webhook tardando → reintentar
        // · ePayco "Pendiente" → pago en efectivo/PSE, PENDING es correcto
        if (epaycoState === "Aceptada" && retries < MAX_RETRIES) {
          retries++;
          setTimeout(verify, RETRY_MS);
          return;
        }

        setInfo(epaycoState === "Aceptada" ? DB_STATES.UNCONFIRMED : DB_STATES.PENDING);
      } catch {
        if (!cancelled) {
          setInfo(epaycoState === "Aceptada" ? DB_STATES.UNCONFIRMED : (DB_STATES[mapState(epaycoState)] ?? UNKNOWN));
        }
      }
    }

    verify();
    return () => { cancelled = true; };
  }, [invoice, epaycoState]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

        {/* Header */}
        <div className={`${info.bg} border-b ${info.border} px-6 py-8 flex flex-col items-center gap-3 text-center`}>
          <div className={`w-20 h-20 rounded-full ${info.bg} border ${info.border} flex items-center justify-center`}>
            {info.icon}
          </div>
          <h1 className={`text-xl font-bold ${info.color}`}>{info.title}</h1>
          <p className="text-[13px] text-gray-500 leading-relaxed max-w-xs">{info.message}</p>
        </div>

        {/* Detalles de la transacción */}
        {(invoice || amount || franchise) && (
          <div className="px-6 py-4 flex flex-col gap-2.5 border-b border-gray-50">
            {invoice && (
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Pedido</span>
                <span className="text-[12px] font-mono font-semibold text-gray-700">{invoice}</span>
              </div>
            )}
            {amount && (
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Monto</span>
                <span className="text-[13px] font-bold text-gray-900">
                  ${Number(amount).toLocaleString("es-CO")} COP
                </span>
              </div>
            )}
            {franchise && (
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Método</span>
                <span className="text-[12px] text-gray-600">{franchise}</span>
              </div>
            )}
            {approvalCode && (
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Aprobación</span>
                <span className="text-[12px] font-mono text-gray-600">{approvalCode}</span>
              </div>
            )}
          </div>
        )}

        {/* Acciones */}
        <div className="px-6 py-5 flex flex-col gap-3">
          <button
            onClick={() => navigate("/")}
            className="w-full h-11 rounded-xl flex items-center justify-center gap-2 bg-rose-500 hover:bg-rose-600 active:bg-rose-700 text-white text-xs font-bold tracking-widest uppercase transition-colors shadow-sm shadow-rose-200"
          >
            <Home size={14} />
            Ir al inicio
          </button>
          {info.retryable && (
            <button
              onClick={() => navigate("/checkout")}
              className="w-full h-10 rounded-xl flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold tracking-wide uppercase transition-colors"
            >
              <ShoppingBag size={13} />
              Intentar de nuevo
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function mapState(epaycoState) {
  if (epaycoState === "Aceptada")  return "APPROVED";
  if (epaycoState === "Rechazada") return "DECLINED";
  if (epaycoState === "Fallida")   return "ERROR";
  if (epaycoState === "Anulada")   return "VOIDED";
  if (epaycoState === "Pendiente") return "PENDING";
  return null;
}
