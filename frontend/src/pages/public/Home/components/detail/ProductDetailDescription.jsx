import { useState } from "react";

const LIMIT = 160;

export default function ProductDetailDescription({ product }) {
  const [expanded, setExpanded] = useState(false);
  const text = product?.shortDescription || product?.description;
  if (!text) return null;

  const isLong = text.length > LIMIT;

  return (
    <div>
      <p className="text-base text-gray-500 leading-relaxed font-normal">
        {isLong && !expanded ? `${text.slice(0, LIMIT).trimEnd()}…` : text}
      </p>
      {isLong && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="mt-1.5 text-sm font-semibold text-rose-500 hover:text-rose-600 transition-colors"
        >
          {expanded ? "Leer menos" : "Leer más"}
        </button>
      )}
    </div>
  );
}
