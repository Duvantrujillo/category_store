import { Button } from "@/components/ui/button";
import { Eye, Phone, MapPin, FileText, User, Hash, Info } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const Field = ({ icon: Icon, label, value, iconCls, bgCls, colSpan }) => (
  <div className={`rounded-xl border p-4 space-y-2.5 ${bgCls} ${colSpan ?? ""}`}>
    <div className="flex items-center gap-2">
      <div className={`p-1.5 rounded-lg ${iconCls}`}>
        <Icon size={13} />
      </div>
      <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</span>
    </div>
    <p className="text-sm font-medium text-slate-800 leading-snug pl-0.5">{value || <span className="text-slate-400 font-normal italic">Sin información</span>}</p>
  </div>
);

function ShippingDetailsDialog({ item }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          size="icon"
          variant="outline"
          className="h-8 w-8 text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700"
        >
          <Eye className="h-3.5 w-3.5" />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-2xl rounded-2xl p-0 overflow-hidden">

        {/* Header con gradiente */}
        <div className="bg-linear-to-br from-slate-800 to-slate-900 px-6 py-5">
          <DialogHeader>
            <DialogTitle className="text-white text-lg font-bold tracking-tight">
              Información del Cliente
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-sm mt-0.5">
              Datos completos del formulario de envío
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Cuerpo */}
        <div className="px-6 py-5 max-h-[70vh] overflow-y-auto space-y-3">

          <div className="grid grid-cols-2 gap-3">
            <Field
              icon={User}
              label="Nombre completo"
              value={`${item.firstName ?? ""} ${item.lastName ?? ""}`.trim()}
              iconCls="bg-indigo-100 text-indigo-600"
              bgCls="bg-indigo-50 border-indigo-100"
            />
            <Field
              icon={Hash}
              label="Documento"
              value={item.documentNumber}
              iconCls="bg-amber-100 text-amber-600"
              bgCls="bg-amber-50 border-amber-100"
            />
            <Field
              icon={Phone}
              label="Teléfono"
              value={item.phoneNumber}
              iconCls="bg-green-100 text-green-600"
              bgCls="bg-green-50 border-green-100"
            />
            <Field
              icon={MapPin}
              label="Ubicación"
              value={[item.departament, item.municipality].filter(Boolean).join(", ")}
              iconCls="bg-blue-100 text-blue-600"
              bgCls="bg-blue-50 border-blue-100"
            />
          </div>

          <Field
            icon={FileText}
            label="Dirección"
            value={item.address}
            iconCls="bg-slate-100 text-slate-600"
            bgCls="bg-slate-50 border-slate-200"
            colSpan="col-span-2"
          />

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2.5">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-slate-100 text-slate-600">
                <Info size={13} />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Detalles adicionales</span>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap wrap-break-word pl-0.5">
              {item.additionalDetails || <span className="text-slate-400 italic font-normal">Sin detalles adicionales</span>}
            </p>
          </div>

        </div>

      </DialogContent>
    </Dialog>
  );
}

export default ShippingDetailsDialog;
