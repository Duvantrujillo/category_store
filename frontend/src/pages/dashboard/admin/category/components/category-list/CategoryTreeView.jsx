import { useState } from "react";
import { ChevronDown, ChevronRight, Trash } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import CategoryDetailDialog from "../category-detail/CategoryDetailDialog";
import CategoryEditDialog from "../category-update/CategoryEditDialog";
import { useHasPermission } from "@/lib/permissions";
import noPhotos from "@/assets/icons/no-fotos.png";

function buildTree(categories) {
  const map = {};
  const roots = [];
  categories.forEach((cat) => { map[cat.id] = { ...cat, children: [] }; });
  categories.forEach((cat) => {
    if (cat.parent?.id && map[cat.parent.id]) {
      map[cat.parent.id].children.push(map[cat.id]);
    } else {
      roots.push(map[cat.id]);
    }
  });
  return roots;
}

function TreeNode({ node, allCategories, onDelete, onRefresh, canUpdate, canDelete, depth }) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = node.children.length > 0;

  return (
    <div>
      <div
        className={`flex items-center gap-3 px-5 py-2.5 hover:bg-slate-50/80 transition-colors group border-b border-slate-100 last:border-0 ${
          depth > 0 ? "bg-slate-50/30" : ""
        }`}
      >
        {/* Expand / collapse */}
        <button
          onClick={hasChildren ? () => setExpanded((v) => !v) : undefined}
          className={`shrink-0 w-6 h-6 flex items-center justify-center rounded-md transition-colors ${
            hasChildren
              ? "hover:bg-slate-200 text-slate-500 cursor-pointer"
              : "text-transparent cursor-default"
          }`}
        >
          {hasChildren && (expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />)}
        </button>

        {/* Depth indicator dot */}
        {depth > 0 && (
          <span
            className="shrink-0 w-1.5 h-1.5 rounded-full bg-slate-300"
            style={{ marginLeft: (depth - 1) * 12 }}
          />
        )}

        {/* Image */}
        <div className="w-9 h-9 shrink-0 rounded-xl border border-slate-100 bg-white flex items-center justify-center overflow-hidden shadow-sm">
          <img
            src={node.imageUrl ? `${import.meta.env.VITE_API_URL}${node.imageUrl}` : noPhotos}
            alt={node.name}
            className="max-w-[80%] max-h-[80%] object-contain"
          />
        </div>

        {/* Name / slug */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-800 text-sm truncate">{node.name}</p>
          <p className="text-[11px] text-slate-400 font-mono">/{node.slug}</p>
        </div>

        {/* Children count */}
        {hasChildren && (
          <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-medium bg-indigo-50 text-indigo-500 border border-indigo-100 px-2 py-0.5 rounded-full whitespace-nowrap">
            {node.children.length} {node.children.length === 1 ? "subcategoría" : "subcategorías"}
          </span>
        )}

        {/* Parent badge */}
        {depth === 0 && !hasChildren && node.parent == null && (
          <span className="hidden sm:inline-flex text-[10px] font-medium bg-amber-50 text-amber-500 border border-amber-100 px-2 py-0.5 rounded-full whitespace-nowrap">
            Raíz
          </span>
        )}

        {/* Status */}
        <Badge
          variant="outline"
          className={`shrink-0 text-[10px] px-2 py-0.5 rounded-full font-medium border ${
            node.isActive
              ? "bg-green-50 text-green-700 border-green-200"
              : "bg-red-50 text-red-600 border-red-200"
          }`}
        >
          {node.isActive ? "Activo" : "Inactivo"}
        </Badge>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <CategoryDetailDialog item={node} />
          <CategoryEditDialog
            item={node}
            categories={allCategories.filter((c) => c.id !== node.id)}
            onRefresh={onRefresh}
            disabled={!canUpdate}
          />
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 text-rose-500 border-rose-200 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-40 disabled:pointer-events-none"
            onClick={() => onDelete(node.id)}
            disabled={!canDelete}
          >
            <Trash className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Children */}
      {hasChildren && expanded && (
        <div className="border-l-2 border-slate-100 ml-12">
          {node.children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              allCategories={allCategories}
              onDelete={onDelete}
              onRefresh={onRefresh}
              canUpdate={canUpdate}
              canDelete={canDelete}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function CategoryTreeView({ categories, onDelete, onRefresh }) {
  const canUpdate = useHasPermission("categories.update");
  const canDelete = useHasPermission("categories.delete");
  const tree = buildTree(categories);

  return (
    <div>
      {tree.map((node) => (
        <TreeNode
          key={node.id}
          node={node}
          allCategories={categories}
          onDelete={onDelete}
          onRefresh={onRefresh}
          canUpdate={canUpdate}
          canDelete={canDelete}
          depth={0}
        />
      ))}
    </div>
  );
}
