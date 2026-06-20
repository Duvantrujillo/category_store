import { Trash, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import AttributeValueEditDialog from "../attribute-value-update/AttributeValueEditDialog";
import { useHasPermission } from "@/lib/permissions";

function AttributeValueCard({ attributeName, values, attributes, onDelete, onRefresh }) {
  const canUpdate = useHasPermission("attribute-values.update");
  const canDelete = useHasPermission("attribute-values.delete");
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/50 overflow-hidden">

      {/* Card header */}
      <div className="flex items-center justify-between px-5 py-3.5 bg-slate-50 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-100 text-indigo-500">
            <Tag className="w-3.5 h-3.5" />
          </div>
          <span className="font-semibold text-sm text-slate-800">{attributeName}</span>
        </div>
        <span className="text-[11px] font-medium bg-indigo-50 text-indigo-500 border border-indigo-100 px-2 py-0.5 rounded-full">
          {values.length} {values.length === 1 ? "valor" : "valores"}
        </span>
      </div>

      {/* Values list */}
      <ul className="divide-y divide-slate-100">
        {values.map((item) => (
          <li
            key={item.id}
            className="flex items-center justify-between px-5 py-3 hover:bg-slate-50/70 transition-colors"
          >
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-medium text-slate-800 truncate">{item.value}</span>
              {item.slug && (
                <span className="text-[11px] text-slate-400 truncate">{item.slug}</span>
              )}
            </div>

            <div className="flex items-center gap-1 flex-shrink-0 ml-3">
              <AttributeValueEditDialog
                item={item}
                attributes={attributes}
                onRefresh={onRefresh}
                disabled={!canUpdate}
              />
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-rose-500 hover:text-rose-600 hover:bg-rose-50 disabled:opacity-40 disabled:pointer-events-none"
                onClick={() => onDelete(item.id)}
                disabled={!canDelete}
                title={!canDelete ? "Sin permiso para eliminar" : undefined}
              >
                <Trash className="h-3.5 w-3.5" />
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default AttributeValueCard;
