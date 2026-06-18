import { useRef, useEffect, useState } from "react";
import { Bell, CheckCheck, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../../../hooks/useNotifications";

const TYPE_LABELS = {
  ORDER_CREATED:    "Orden",
  ORDER_PAID:       "Pago",
  ORDER_CANCELLED:  "Orden",
  PAYMENT_DECLINED: "Pago",
  SHIPMENT_CREATED: "Envío",
  RETURN_CREATED:   "Devolución",
  RETURN_APPROVED:  "Devolución",
  RETURN_REJECTED:  "Devolución",
  RETURN_COMPLETED: "Devolución",
  REFUND_PROCESSED: "Reembolso",
  LOW_STOCK:        "Inventario",
  OUT_OF_STOCK:     "Inventario",
};

const TYPE_COLORS = {
  ORDER_CREATED:    "text-indigo-600 bg-indigo-50",
  ORDER_PAID:       "text-emerald-600 bg-emerald-50",
  ORDER_CANCELLED:  "text-red-600 bg-red-50",
  PAYMENT_DECLINED: "text-red-600 bg-red-50",
  SHIPMENT_CREATED: "text-blue-600 bg-blue-50",
  RETURN_CREATED:   "text-orange-600 bg-orange-50",
  RETURN_APPROVED:  "text-emerald-600 bg-emerald-50",
  RETURN_REJECTED:  "text-red-600 bg-red-50",
  RETURN_COMPLETED: "text-teal-600 bg-teal-50",
  REFUND_PROCESSED: "text-purple-600 bg-purple-50",
  LOW_STOCK:        "text-amber-600 bg-amber-50",
  OUT_OF_STOCK:     "text-red-600 bg-red-50",
};

const UNREAD_BORDER = {
  ORDER_CREATED:    "border-indigo-400",
  ORDER_PAID:       "border-emerald-400",
  ORDER_CANCELLED:  "border-red-400",
  PAYMENT_DECLINED: "border-red-400",
  SHIPMENT_CREATED: "border-blue-400",
  RETURN_CREATED:   "border-orange-400",
  RETURN_APPROVED:  "border-emerald-400",
  RETURN_REJECTED:  "border-red-400",
  RETURN_COMPLETED: "border-teal-400",
  REFUND_PROCESSED: "border-purple-400",
  LOW_STOCK:        "border-amber-400",
  OUT_OF_STOCK:     "border-red-400",
};

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60)    return "hace un momento";
  if (diff < 3600)  return `hace ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `hace ${Math.floor(diff / 3600)} h`;
  return `hace ${Math.floor(diff / 86400)} d`;
}

export default function NotificationPanel() {
  const navigate  = useNavigate();
  const panelRef  = useRef(null);
  const [open, setOpen] = useState(false);
  const { notifications, unreadCount, loading, markRead, markAllRead } = useNotifications();

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleNotificationClick = (n) => {
    if (!n.isRead) markRead(n.id);
    if (n.actionUrl) {
      navigate(n.actionUrl);
      setOpen(false);
    }
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative flex items-center justify-center w-9 h-9 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
      >
        <Bell size={17} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 min-w-4 h-4 flex items-center justify-center rounded-full bg-indigo-500 text-white text-[10px] font-bold px-1 leading-none">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 w-96 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 overflow-hidden">

          <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50/60">
            <div>
              <p className="text-sm font-semibold text-slate-800">Notificaciones</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {unreadCount > 0 ? `${unreadCount} sin leer` : "Todo al día"}
              </p>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                disabled={loading}
                className="flex items-center gap-1.5 text-[11px] font-medium text-indigo-600 hover:text-indigo-800 transition-colors disabled:opacity-40 px-2.5 py-1.5 rounded-lg hover:bg-indigo-50"
              >
                <CheckCheck size={13} />
                Marcar todas como leídas
              </button>
            )}
          </div>

          <ul className="max-h-104 overflow-y-auto divide-y divide-slate-100">
            {notifications.length === 0 ? (
              <li className="px-5 py-10 text-center">
                <p className="text-sm font-medium text-slate-500">No hay notificaciones</p>
                <p className="text-[11px] text-slate-400 mt-1">Las alertas del sistema aparecerán aquí.</p>
              </li>
            ) : (
              notifications.map((n) => (
                <li
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={`flex items-start gap-3 px-5 py-4 cursor-pointer transition-all border-l-2 group ${
                    n.isRead
                      ? "bg-white hover:bg-slate-50 border-transparent"
                      : `bg-slate-50/80 hover:bg-white ${UNREAD_BORDER[n.type] ?? "border-slate-400"}`
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded mb-1.5 ${
                      TYPE_COLORS[n.type] ?? "text-slate-500 bg-slate-100"
                    }`}>
                      {TYPE_LABELS[n.type] ?? n.type}
                    </span>

                    <p className="text-[13px] font-semibold text-slate-800 leading-snug">
                      {n.title}
                    </p>

                    <p className="text-[12px] text-slate-500 mt-1 leading-relaxed line-clamp-2">
                      {n.message}
                    </p>

                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[11px] text-slate-400">{timeAgo(n.createdAt)}</span>
                      {n.actionUrl && (
                        <span className="text-[11px] text-indigo-500 group-hover:text-indigo-700 flex items-center gap-1 transition-colors">
                          Ver sección
                          <ExternalLink size={10} />
                        </span>
                      )}
                    </div>
                  </div>

                  {!n.isRead && (
                    <span className="mt-1.5 shrink-0 w-2 h-2 rounded-full bg-indigo-500 ring-2 ring-indigo-100" />
                  )}
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
