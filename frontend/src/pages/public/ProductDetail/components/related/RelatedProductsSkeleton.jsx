const ITEMS = Array.from({ length: 5 });

export default function RelatedProductsSkeleton() {
  return (
    <div className="mb-10">
      {/* Title skeleton */}
      <div className="flex items-center gap-3 mb-4 px-4 sm:px-0">
        <div className="h-3 w-32 bg-gray-100 rounded-full animate-pulse" />
        <div className="flex-1 h-px bg-gray-100" />
        <div className="h-2.5 w-4 bg-gray-100 rounded-full animate-pulse" />
      </div>

      {/* Cards skeleton row */}
      <div className="flex flex-nowrap gap-3 overflow-hidden px-4 sm:px-0">
        {ITEMS.map((_, i) => (
          <div
            key={i}
            className="w-44 sm:w-52 md:w-56 lg:w-60 shrink-0 flex flex-col bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse"
          >
            <div className="bg-gray-100" style={{ aspectRatio: "4/5" }} />
            <div className="px-3 pt-2.5 pb-3 flex flex-col gap-2">
              <div className="h-2 w-20 bg-gray-100 rounded-full" />
              <div className="h-3.5 w-4/5 bg-rose-100 rounded-full" />
              <div className="h-3 w-2/5 bg-gray-100 rounded-full" />
              <div className="mt-1 h-9 bg-rose-100 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
