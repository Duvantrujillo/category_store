function ShippingLoading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="space-y-3 text-center">

        <div className="h-10 w-10 animate-spin rounded-full border-4 border-muted border-t-black mx-auto" />

        <p className="text-sm text-muted-foreground">
          Cargando registros...
        </p>

      </div>
    </div>
  );
}

export default ShippingLoading;