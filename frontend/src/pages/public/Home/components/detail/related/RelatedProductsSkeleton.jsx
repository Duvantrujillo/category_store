export default function RelatedProductsSkeleton({ cols = 4, rows = 3, gap = 12 }) {
  return (
    <div className="flex flex-col" style={{ gap: `${gap}px` }}>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex" style={{ gap: `${gap}px` }}>
          {Array.from({ length: cols }).map((_, c) => (
            <div
              key={c}
              className="flex flex-col bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse"
              style={{ width: `calc(${100 / cols}% - ${(gap * (cols - 1)) / cols}px)`, flexShrink: 0 }}
            >
              <div className="bg-gray-100" style={{ aspectRatio: "4/5" }} />
              <div className="px-2.5 pt-2 pb-2.5 flex flex-col gap-2">
                <div className="h-2 w-3/4 bg-rose-100 rounded-full" />
                <div className="h-3 w-1/2 bg-gray-100 rounded-full" />
                <div className="mt-1 h-8 bg-rose-100 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
