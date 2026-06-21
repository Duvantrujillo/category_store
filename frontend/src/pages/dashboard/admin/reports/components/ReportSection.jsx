import { Download } from "lucide-react";

function ReportSection({ icon: Icon, title, onExport, children, className = "", noPad = false }) {
  return (
    <div className={`rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden ${className}`}>
      {(title || onExport) && (
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            {Icon && <Icon size={14} className="text-indigo-500" />}
            {title && <h3 className="text-sm font-semibold text-slate-700">{title}</h3>}
          </div>
          {onExport && (
            <button
              onClick={onExport}
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-indigo-600 transition-colors px-2.5 py-1.5 rounded-lg hover:bg-indigo-50 border border-transparent hover:border-indigo-100"
            >
              <Download size={12} />
              Exportar CSV
            </button>
          )}
        </div>
      )}
      <div className={noPad ? "" : "p-5"}>{children}</div>
    </div>
  );
}

export default ReportSection;
