import { useState, useEffect, useMemo } from "react";
import { fetchPurchases, updatePucharses } from "~/api/pucharse";
import { useTheme } from "~/context/themeContext";

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
  direction: string;
  phone: string;
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

export const AdminPurchases = () => {
  const { theme } = useTheme();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchName, setSearchName] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    loadPurchases();
  }, []);

  const loadPurchases = async () => {
    try {
      const data = await fetchPurchases();
      setPurchases(data || []);

      console.log("Compras cargadas:", data);
    } catch (err) {
      console.error("Error cargando compras:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (
    id: string,
    status: string,
    user_email: string,
  ) => {
    try {
      await updatePucharses(id, { status, user_email });
      setPurchases((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status } : p)),
      );
    } catch (err) {
      console.error("Error actualizando status:", err);
    }
  };

  const handleClearFilters = () => {
    setSearchName("");
    setFilterStatus("");
    setDateFrom("");
    setDateTo("");
  };

  const activeFilters = [searchName, filterStatus, dateFrom, dateTo].filter(
    Boolean,
  ).length;

  const filteredPurchases = useMemo(() => {
    return purchases.filter((p) => {
      const matchName = searchName
        ? p.user_name.toLowerCase().includes(searchName.toLowerCase()) ||
          p.user_email.toLowerCase().includes(searchName.toLowerCase())
        : true;

      const matchStatus = filterStatus ? p.status === filterStatus : true;

      const purchaseDate = new Date(p.created_at);
      const matchFrom = dateFrom ? purchaseDate >= new Date(dateFrom) : true;
      const matchTo = dateTo
        ? purchaseDate <= new Date(dateTo + "T23:59:59")
        : true;

      return matchName && matchStatus && matchFrom && matchTo;
    });
  }, [purchases, searchName, filterStatus, dateFrom, dateTo]);

  return (
    <div className="flex flex-col items-center pt-40 lg:pt-20 w-full p-4 pb-10">
      {/* Filtros */}
      <div className="w-full flex flex-col gap-3 mb-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Búsqueda por nombre */}
          <input
            type="text"
            placeholder="Buscar por nombre o email..."
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            className={`border rounded-lg px-4 py-2 text-sm outline-none flex-grow ${
              theme === "dark"
                ? "bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                : "bg-white border-gray-300 text-black"
            }`}
          />

          {/* Filtro por estado */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className={`border rounded-lg px-4 py-2 text-sm outline-none ${
              theme === "dark"
                ? "bg-gray-800 border-gray-600 text-white"
                : "bg-white border-gray-300 text-black"
            }`}
          >
            <option value="">Todos los estados</option>
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 items-center">
          {/* Rango de fechas */}
          <div className="flex gap-2 items-center flex-grow w-full">
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className={`border rounded-lg px-4 py-2 text-sm outline-none w-full ${
                theme === "dark"
                  ? "bg-gray-800 border-gray-600 text-white"
                  : "bg-white border-gray-300 text-black"
              }`}
            />
            <span className="text-gray-400 shrink-0">—</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className={`border rounded-lg px-4 py-2 text-sm outline-none w-full ${
                theme === "dark"
                  ? "bg-gray-800 border-gray-600 text-white"
                  : "bg-white border-gray-300 text-black"
              }`}
            />
          </div>

          {/* Limpiar filtros */}
          {activeFilters > 0 && (
            <button
              onClick={handleClearFilters}
              className="text-sm px-4 py-2 border rounded-lg hover:scale-105 transition-all shrink-0"
            >
              Limpiar ({activeFilters})
            </button>
          )}
        </div>
      </div>

      {/* Contador */}
      <p className="text-xs text-gray-400 w-full mb-4">
        {filteredPurchases.length} compra
        {filteredPurchases.length !== 1 ? "s" : ""} encontrada
        {filteredPurchases.length !== 1 ? "s" : ""}
      </p>

      {loading ? (
        <div className="flex items-center justify-center mt-20">
          <p className="text-gray-400">Cargando compras...</p>
        </div>
      ) : filteredPurchases.length === 0 ? (
        <div className="flex flex-col items-center justify-center mt-20 gap-4">
          <p className="text-2xl">🔍</p>
          <p className="text-gray-400">No se encontraron compras.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 w-full items-start">
          {filteredPurchases.map((purchase) => (
            <div
              key={purchase.id}
              className={`rounded-2xl border p-5 flex flex-col gap-4 shadow-sm self-start ${
                theme === "dark"
                  ? "bg-bgSecondary border-gray-500 text-white"
                  : "bg-white border-gray-200 text-black"
              }`}
            >
              {/* Header */}
              <div className="flex justify-between items-start gap-2">
                <div className="flex flex-col gap-1 min-w-0">
                  <p className="text-xs text-gray-400 truncate">
                    {purchase.id}
                  </p>
                  <p className="font-semibold truncate">{purchase.user_name}</p>
                  <p className="text-xs text-gray-400 truncate">
                    {purchase.user_email}
                  </p>
                  {purchase.phone && (
                    <p className="text-xs text-gray-400">📞 {purchase.phone}</p>
                  )}
                </div>

                {/* Estado editable */}
                <select
                  value={purchase.status}
                  onChange={(e) =>
                    handleStatusChange(
                      purchase.id,
                      e.target.value,
                      purchase.user_email,
                    )
                  }
                  className={`text-xs font-semibold px-2 py-1 rounded-full border-0 outline-none cursor-pointer shrink-0 ${STATUS_COLORS[purchase.status]}`}
                >
                  {Object.entries(STATUS_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Info */}
              <div
                className={`rounded-xl p-3 flex flex-col gap-2 text-sm ${theme === "dark" ? "bg-gray-800" : "bg-gray-100"}`}
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
                    {new Date(purchase.created_at).toLocaleDateString("es-CL", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
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
                  setExpandedId(expandedId === purchase.id ? null : purchase.id)
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
                          {Number(item.unit_price).toLocaleString("es-CL")} c/u
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
  );
};
