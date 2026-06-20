import { useRef } from "react";
import { ShieldCheck, Printer, MapPin, User, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

function ShippingGuideModal({ open, order, onClose }) {
  const printRef = useRef(null);

  if (!order) return null;

  const handlePrint = () => {
    const content = printRef.current.innerHTML;
    const win = window.open("", "_blank", "width=700,height=900");
    win.document.write(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8" />
        <title>Guía de Envío – ${order.orderNumber}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Arial, sans-serif; background: #fff; color: #1e293b; }
          .label { width: 680px; margin: 20px auto; border: 2px solid #1e293b; border-radius: 8px; overflow: hidden; }
          .label-header { display: flex; align-items: center; gap: 12px; background: #1e293b; color: #fff; padding: 16px 20px; }
          .logo-icon { display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; background: #4f46e5; border-radius: 8px; }
          .logo-icon svg { width: 22px; height: 22px; color: #fff; }
          .brand-name { font-size: 18px; font-weight: 800; letter-spacing: 0.5px; }
          .brand-sub { font-size: 10px; color: #a5b4fc; text-transform: uppercase; letter-spacing: 2px; }
          .order-badge { margin-left: auto; background: #4f46e5; border-radius: 6px; padding: 6px 14px; text-align: center; }
          .order-badge-label { font-size: 9px; text-transform: uppercase; letter-spacing: 1px; color: #c7d2fe; }
          .order-badge-num { font-size: 16px; font-weight: 900; color: #fff; }
          .barcode-section { background: #f8fafc; border-bottom: 2px dashed #cbd5e1; padding: 14px 20px; display: flex; align-items: center; justify-content: space-between; }
          .barcode-bars { display: flex; gap: 2px; align-items: flex-end; height: 40px; }
          .barcode-bars span { display: inline-block; background: #1e293b; width: 3px; }
          .barcode-text { font-size: 11px; color: #64748b; text-align: right; }
          .barcode-text strong { display: block; font-size: 14px; color: #1e293b; font-family: 'Courier New', monospace; }
          .body-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0; }
          .section { padding: 16px 20px; border-bottom: 1px solid #e2e8f0; }
          .section:nth-child(odd) { border-right: 1px solid #e2e8f0; }
          .section-title { display: flex; align-items: center; gap: 6px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #4f46e5; margin-bottom: 10px; }
          .section-title svg { width: 12px; height: 12px; }
          .field { margin-bottom: 6px; }
          .field label { font-size: 10px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; display: block; }
          .field span { font-size: 13px; font-weight: 600; color: #1e293b; }
          .address-highlight { grid-column: 1 / -1; background: #eff6ff; border-top: 2px solid #4f46e5; padding: 16px 20px; }
          .address-highlight .section-title { color: #4f46e5; }
          .address-value { font-size: 16px; font-weight: 700; color: #1e1b4b; line-height: 1.4; }
          .footer { background: #f1f5f9; padding: 10px 20px; display: flex; justify-content: space-between; align-items: center; }
          .footer-date { font-size: 10px; color: #64748b; }
          .footer-brand { font-size: 10px; color: #4f46e5; font-weight: 700; }
          .paid-stamp { background: #dcfce7; color: #166534; border: 2px solid #86efac; border-radius: 6px; padding: 4px 12px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; }
        </style>
      </head>
      <body>${content}</body>
      </html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 400);
  };

  const barHeights = [28,18,35,22,40,15,30,25,38,20,32,28,16,36,24,40,18,30,22,35,26,38,20,28,32,16,36,24,40,18];

  const labelContent = (
    <div className="label">
      {/* HEADER */}
      <div className="label-header">
        <div className="logo-icon">
          <ShieldCheck style={{ width: 22, height: 22, color: "#fff" }} />
        </div>
        <div>
          <div className="brand-name">Category Store</div>
          <div className="brand-sub">Guía de Envío</div>
        </div>
        <div className="order-badge">
          <div className="order-badge-label">N° Pedido</div>
          <div className="order-badge-num">{order.orderNumber}</div>
        </div>
      </div>

      {/* BARCODE */}
      <div className="barcode-section">
        <div className="barcode-bars">
          {barHeights.map((h, i) => (
            <span key={i} style={{ height: h }} />
          ))}
        </div>
        <div className="barcode-text">
          <span>Código de seguimiento</span>
          <strong>{order.orderNumber}</strong>
          <span>{new Date(order.createdAt).toLocaleDateString("es-CO")}</span>
        </div>
      </div>

      {/* BODY */}
      <div className="body-grid">
        {/* DESTINATARIO */}
        <div className="section">
          <div className="section-title">
            <User style={{ width: 12, height: 12 }} />
            Destinatario
          </div>
          <div className="field">
            <label>Nombre completo</label>
            <span>{order.firstName} {order.lastName}</span>
          </div>
          <div className="field">
            <label>Documento</label>
            <span>{order.documentNumber || "N/A"}</span>
          </div>
          <div className="field">
            <label>Teléfono</label>
            <span>{order.phoneNumber || "N/A"}</span>
          </div>
          <div className="field">
            <label>Correo</label>
            <span>{order.email || "N/A"}</span>
          </div>
        </div>

        {/* PEDIDO */}
        <div className="section">
          <div className="section-title">
            <Package style={{ width: 12, height: 12 }} />
            Detalles del pedido
          </div>
          <div className="field">
            <label>Número de orden</label>
            <span>{order.orderNumber}</span>
          </div>
          <div className="field">
            <label>Fecha</label>
            <span>{new Date(order.createdAt).toLocaleDateString("es-CO")}</span>
          </div>
          <div className="field">
            <label>Total</label>
            <span>${Number(order.total).toLocaleString("es-CO")} {order.currency}</span>
          </div>
          <div className="field">
            <label>Estado</label>
            <span className="paid-stamp">Pagada</span>
          </div>
        </div>

        {/* DIRECCIÓN DESTACADA */}
        <div className="address-highlight">
          <div className="section-title">
            <MapPin style={{ width: 12, height: 12 }} />
            Dirección de entrega
          </div>
          <div className="address-value">
            {order.address}
            {order.additionalDetails ? `, ${order.additionalDetails}` : ""}
          </div>
          <div style={{ marginTop: 8, display: "flex", gap: 24 }}>
            <div className="field" style={{ marginBottom: 0 }}>
              <label>Municipio</label>
              <span>{order.municipality}</span>
            </div>
            <div className="field" style={{ marginBottom: 0 }}>
              <label>Departamento</label>
              <span>{order.departament}</span>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="footer">
        <div className="footer-date">
          Generada el {new Date().toLocaleString("es-CO")}
        </div>
        <div className="footer-brand">Category Store · Admin Panel</div>
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-indigo-600" />
            Guía de Envío — {order.orderNumber}
          </DialogTitle>
          <DialogDescription>
            Vista previa de la etiqueta de envío. Usa el botón para imprimir.
          </DialogDescription>
        </DialogHeader>

        {/* PREVIEW */}
        <div className="overflow-auto max-h-[60vh] rounded-lg border border-slate-200 bg-white p-4">
          <div ref={printRef}>
            <style>{`
              .label { width: 100%; border: 2px solid #1e293b; border-radius: 8px; overflow: hidden; font-family: Arial, sans-serif; }
              .label-header { display: flex; align-items: center; gap: 12px; background: #1e293b; color: #fff; padding: 14px 18px; }
              .logo-icon { display: flex; align-items: center; justify-content: center; width: 38px; height: 38px; background: #4f46e5; border-radius: 8px; flex-shrink: 0; }
              .brand-name { font-size: 16px; font-weight: 800; }
              .brand-sub { font-size: 9px; color: #a5b4fc; text-transform: uppercase; letter-spacing: 2px; }
              .order-badge { margin-left: auto; background: #4f46e5; border-radius: 6px; padding: 5px 12px; text-align: center; }
              .order-badge-label { font-size: 9px; text-transform: uppercase; letter-spacing: 1px; color: #c7d2fe; }
              .order-badge-num { font-size: 15px; font-weight: 900; color: #fff; }
              .barcode-section { background: #f8fafc; border-bottom: 2px dashed #cbd5e1; padding: 12px 18px; display: flex; align-items: center; justify-content: space-between; }
              .barcode-bars { display: flex; gap: 2px; align-items: flex-end; height: 36px; }
              .barcode-bars span { display: inline-block; background: #1e293b; width: 3px; }
              .barcode-text { font-size: 11px; color: #64748b; text-align: right; }
              .barcode-text strong { display: block; font-size: 13px; color: #1e293b; font-family: 'Courier New', monospace; }
              .body-grid { display: grid; grid-template-columns: 1fr 1fr; }
              .section { padding: 14px 18px; border-bottom: 1px solid #e2e8f0; }
              .section:nth-child(odd) { border-right: 1px solid #e2e8f0; }
              .section-title { display: flex; align-items: center; gap: 5px; font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #4f46e5; margin-bottom: 8px; }
              .field { margin-bottom: 5px; }
              .field label { font-size: 9px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; display: block; }
              .field span { font-size: 13px; font-weight: 600; color: #1e293b; }
              .address-highlight { grid-column: 1 / -1; background: #eff6ff; border-top: 2px solid #4f46e5; padding: 14px 18px; }
              .address-value { font-size: 15px; font-weight: 700; color: #1e1b4b; line-height: 1.4; margin-bottom: 8px; }
              .footer { background: #f1f5f9; padding: 8px 18px; display: flex; justify-content: space-between; align-items: center; }
              .footer-date { font-size: 10px; color: #64748b; }
              .footer-brand { font-size: 10px; color: #4f46e5; font-weight: 700; }
              .paid-stamp { background: #dcfce7; color: #166534; border: 1.5px solid #86efac; border-radius: 4px; padding: 2px 8px; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; display: inline-block; }
            `}</style>
            {labelContent}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
          <Button
            onClick={handlePrint}
            className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
          >
            <Printer size={15} />
            Imprimir guía
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ShippingGuideModal;
