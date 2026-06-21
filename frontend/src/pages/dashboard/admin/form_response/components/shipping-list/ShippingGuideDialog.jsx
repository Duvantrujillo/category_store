import { useRef, useState } from "react";
import { ShieldCheck, Printer, MapPin, User, Info, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const BAR_HEIGHTS = [28,18,35,22,40,15,30,25,38,20,32,28,16,36,24,40,18,30,22,35,26,38,20,28,32,16,36,24,40,18];

function ShippingGuideDialog({ open, item, onClose }) {
  const printRef = useRef(null);

  if (!item) return null;

  const fullName   = `${item.firstName ?? ""} ${item.lastName ?? ""}`.trim();
  const locationParts = [item.municipality, item.departament].filter(Boolean);
  const location   = locationParts.join(", ");
  const badgeCode  = item.documentNumber || String(item.id ?? "").slice(-8).toUpperCase();
  const generatedAt = new Date().toLocaleString("es-CO");

  const handlePrint = () => {
    const content = printRef.current.innerHTML;
    const win = window.open("", "_blank", "width=700,height=900");
    win.document.write(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8" />
        <title>Guía de Envío – ${fullName}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Arial, sans-serif; background: #fff; color: #1e293b; }
          .label { width: 680px; margin: 20px auto; border: 2px solid #1e293b; border-radius: 8px; overflow: hidden; }
          .label-header { display: flex; align-items: center; gap: 12px; background: #1e293b; color: #fff; padding: 16px 20px; }
          .logo-icon { display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; background: #4f46e5; border-radius: 8px; }
          .logo-icon svg { width: 22px; height: 22px; color: #fff; }
          .brand-name { font-size: 18px; font-weight: 800; letter-spacing: 0.5px; }
          .brand-sub { font-size: 10px; color: #a5b4fc; text-transform: uppercase; letter-spacing: 2px; }
          .badge { margin-left: auto; background: #4f46e5; border-radius: 6px; padding: 6px 14px; text-align: center; }
          .badge-label { font-size: 9px; text-transform: uppercase; letter-spacing: 1px; color: #c7d2fe; }
          .badge-num { font-size: 15px; font-weight: 900; color: #fff; font-family: 'Courier New', monospace; }
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
          .address-value { font-size: 16px; font-weight: 700; color: #1e1b4b; line-height: 1.4; margin-bottom: 8px; }
          .details-section { grid-column: 1 / -1; padding: 14px 20px; border-top: 1px solid #e2e8f0; background: #f8fafc; }
          .details-text { font-size: 13px; color: #475569; line-height: 1.5; }
          .footer { background: #f1f5f9; padding: 10px 20px; display: flex; justify-content: space-between; align-items: center; }
          .footer-date { font-size: 10px; color: #64748b; }
          .footer-brand { font-size: 10px; color: #4f46e5; font-weight: 700; }
        </style>
      </head>
      <body>${content}</body>
      </html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 400);
  };

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
        <div className="badge">
          <div className="badge-label">Documento</div>
          <div className="badge-num">{badgeCode}</div>
        </div>
      </div>

      {/* BARCODE */}
      <div className="barcode-section">
        <div className="barcode-bars">
          {BAR_HEIGHTS.map((h, i) => (
            <span key={i} style={{ height: h }} />
          ))}
        </div>
        <div className="barcode-text">
          <span>Identificación del destinatario</span>
          <strong>{badgeCode}</strong>
          <span>{generatedAt}</span>
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
            <span>{fullName || "N/A"}</span>
          </div>
          <div className="field">
            <label>Documento</label>
            <span>{item.documentNumber || "N/A"}</span>
          </div>
          <div className="field">
            <label>Teléfono</label>
            <span>{item.phoneNumber || "N/A"}</span>
          </div>
        </div>

        {/* UBICACIÓN */}
        <div className="section">
          <div className="section-title">
            <MapPin style={{ width: 12, height: 12 }} />
            Ubicación
          </div>
          <div className="field">
            <label>Municipio</label>
            <span>{item.municipality || "N/A"}</span>
          </div>
          <div className="field">
            <label>Departamento</label>
            <span>{item.departament || "N/A"}</span>
          </div>
        </div>

        {/* DIRECCIÓN DESTACADA */}
        <div className="address-highlight">
          <div className="section-title">
            <FileText style={{ width: 12, height: 12 }} />
            Dirección de entrega
          </div>
          <div className="address-value">
            {item.address || "Sin dirección registrada"}
          </div>
          <div style={{ display: "flex", gap: 24 }}>
            <div className="field" style={{ marginBottom: 0 }}>
              <label>Municipio</label>
              <span>{item.municipality || "N/A"}</span>
            </div>
            <div className="field" style={{ marginBottom: 0 }}>
              <label>Departamento</label>
              <span>{item.departament || "N/A"}</span>
            </div>
          </div>
        </div>

        {/* DETALLES ADICIONALES */}
        {item.additionalDetails && (
          <div className="details-section">
            <div className="section-title">
              <Info style={{ width: 12, height: 12 }} />
              Detalles adicionales
            </div>
            <div className="details-text">{item.additionalDetails}</div>
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div className="footer">
        <div className="footer-date">Generada el {generatedAt}</div>
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
            Guía de Envío — {fullName}
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
              .badge { margin-left: auto; background: #4f46e5; border-radius: 6px; padding: 5px 12px; text-align: center; }
              .badge-label { font-size: 9px; text-transform: uppercase; letter-spacing: 1px; color: #c7d2fe; }
              .badge-num { font-size: 14px; font-weight: 900; color: #fff; font-family: 'Courier New', monospace; }
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
              .details-section { grid-column: 1 / -1; padding: 12px 18px; border-top: 1px solid #e2e8f0; background: #f8fafc; }
              .details-text { font-size: 12px; color: #475569; line-height: 1.5; }
              .footer { background: #f1f5f9; padding: 8px 18px; display: flex; justify-content: space-between; align-items: center; }
              .footer-date { font-size: 10px; color: #64748b; }
              .footer-brand { font-size: 10px; color: #4f46e5; font-weight: 700; }
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

export default ShippingGuideDialog;
