export default function HomeProductSkeleton() {
  return (
    <div className="flex flex-col bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
      <div className="bg-gray-100" style={{ aspectRatio: "4/5" }} />
      <div className="px-3 pt-2.5 pb-3 flex flex-col gap-2">
        <div className="h-2 w-20 bg-gray-100 rounded-full" />
        <div className="h-3.5 w-4/5 bg-rose-100 rounded-full" />
        <div className="h-3 w-2/5 bg-gray-100 rounded-full" />
        <div className="mt-1 h-9 bg-rose-100 rounded-lg" />
      </div>
    </div>
  );
}
