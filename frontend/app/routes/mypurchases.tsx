import { useState, useEffect } from "react";
import { fetchMyPurchases } from "~/api/pucharse";
import { useTheme } from "~/context/themeContext";
import { Footer } from "~/components/home/footer";

type PurchaseProduct = {
  product_id: string;
  name: string;
  quantity: number;
  unit_price: number;
};

type Purchase = {
  id: string;
  user_name: string;
  user_email: string;
  total: number;
  status: string;
  phone: string;
  direction: string;
  created_at: string;
  products: PurchaseProduct[];
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente",
  confirmed: "Confirmado",
  shipped: "Enviado",
  delivered: "Entregado",
  cancelled: "Cancelado",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function MyPurchases() {
  const { theme } = useTheme();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    loadPurchases();
  }, []);

  const loadPurchases = async () => {
    try {
      const data = await fetchMyPurchases();
      setPurchases(data || []);
    } catch (err) {
      console.error("Error cargando compras:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className={`flex flex-col min-h-screen pt-24 lg:pt-20 px-4 ${
        theme === "dark"
          ? "bg-bgSecondary text-white"
          : "bg-bgPrimary text-black"
      }`}
    >
      <div className="flex-1 flex flex-col items-center w-full mb-10">
        {loading ? (
          <div className="flex items-center justify-center mt-20">
            <p className="text-gray-400">Cargando compras...</p>
          </div>
        ) : purchases.length === 0 ? (
          <div className="flex flex-col items-center justify-center mt-40 gap-4">
            <p className="text-2xl">🛍️</p>
            <p className="text-gray-400">No tienes compras registradas.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 w-full items-start">
            {purchases.map((purchase) => (
              <div
                key={purchase.id}
                className={`rounded-2xl border p-5 flex flex-col gap-4 shadow-sm transition-all self-start ${
                  theme === "dark"
                    ? "bg-bgSecondary border-gray-500 text-white"
                    : "bg-bgPrimary border-gray-200 text-black"
                }`}
              >
                {/* Header */}
                <div className="flex justify-between items-start gap-2">
                  <div className="flex flex-col gap-1 min-w-0">
                    <p className="text-xs text-gray-400 truncate">
                      {purchase.id}
                    </p>
                    <p className="font-semibold truncate">
                      {purchase.user_name}
                    </p>
                    <p className="font-semibold truncate text-sm">
                      {purchase.phone}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {purchase.user_email}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded-full shrink-0 ${STATUS_COLORS[purchase.status]}`}
                  >
                    {STATUS_LABELS[purchase.status] || purchase.status}
                  </span>
                </div>

                {/* Info */}
                <div
                  className={`rounded-xl p-3 flex flex-col gap-2 text-sm ${theme === "dark" ? "bg-gray-800" : "bg-gray-200"}`}
                >
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total</span>
                    <span className="font-bold">
                      ${Number(purchase.total).toLocaleString("es-CL")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Fecha</span>
                    <span>
                      {new Date(purchase.created_at).toLocaleDateString(
                        "es-CL",
                        {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        },
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-gray-400 shrink-0">Dirección</span>
                    <span className="text-right text-xs">
                      {purchase.direction}
                    </span>
                  </div>
                </div>

                {/* Botón expandir */}
                <button
                  onClick={() =>
                    setExpandedId(
                      expandedId === purchase.id ? null : purchase.id,
                    )
                  }
                  className="text-xs px-3 py-2 rounded-full border hover:scale-105 transition-all w-full"
                >
                  {expandedId === purchase.id
                    ? "Ocultar productos"
                    : `Ver ${purchase.products.length} producto${purchase.products.length !== 1 ? "s" : ""}`}
                </button>

                {/* Productos expandidos */}
                {expandedId === purchase.id && (
                  <div
                    className={`rounded-xl p-3 flex flex-col gap-2 ${theme === "dark" ? "bg-gray-800" : "bg-gray-50"}`}
                  >
                    {purchase.products.map((item) => (
                      <div
                        key={item.product_id}
                        className="flex justify-between text-xs border-b last:border-0 pb-2 last:pb-0"
                      >
                        <div className="min-w-0 pr-2">
                          <p className="font-medium truncate">{item.name}</p>
                          <p className="text-gray-400">
                            x{item.quantity} · $
                            {Number(item.unit_price).toLocaleString("es-CL")}{" "}
                            c/u
                          </p>
                        </div>
                        <p className="font-semibold shrink-0">
                          $
                          {(
                            Number(item.unit_price) * item.quantity
                          ).toLocaleString("es-CL")}
                        </p>
                      </div>
                    ))}

                    <div className="flex justify-between text-xs font-bold pt-2 border-t">
                      <span>Total</span>
                      <span>
                        ${Number(purchase.total).toLocaleString("es-CL")}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </main>
  );
}
