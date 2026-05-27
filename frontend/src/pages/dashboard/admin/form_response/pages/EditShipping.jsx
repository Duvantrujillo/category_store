
import { useShipping } from "@/hooks/useShipping";

function ShippingList() {
  const { shipping, error, loading } = useShipping();

  if (loading) return <p>Cargando envíos...</p>;
  if (error) return <p>Error al cargar: {error}</p>;

  return (
    <div className="space-y-4">
      {shipping.map((item) => (
        <div
          key={item.id}
          className="p-4 border rounded-lg flex justify-between items-center"
        >
          <div>
            <p>
              <strong>{item.firstName} {item.lastName}</strong>
            </p>
            <p>{item.address}</p>
          </div>

          {/* Botón de editar para este item */}
          
        </div>
      ))}
    </div>
  );
}

export default ShippingList;