// ~/pages/cart.tsx
import { useEffect, useState } from "react";
import { useTheme } from "~/context/themeContext";
import {
  fetchCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from "~/api/cart";
import { MdDeleteForever } from "react-icons/md";
import { useNavigate } from "react-router";
import { Footer } from "~/components/home/footer";

const API_URL = import.meta.env.VITE_API_URL;

type CartItem = {
  cart_product_id: string;
  product_id: string;
  name: string;
  price: number;
  stock: number;
  quantity: number;
  state: string;
  images: Array<{ id: number; url: string }>;
};

export default function CartPage() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCart = async () => {
    try {
      const data = await fetchCart();
      const available = (data || []).filter(
        (item: CartItem) => item.stock > 0 && item.state === "available",
      );
      setItems(available);
    } catch (err) {
      console.error("Error cargando carrito:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  const handleQuantityChange = async (id: string, quantity: number) => {
    try {
      const item = items.find((i) => i.cart_product_id === id);

      console.log("Intentando actualizar cantidad:", item?.stock);

      if (!item) return;

      if (quantity > item.stock) {
        alert("No hay suficiente stock disponible");
        return;
      }

      await updateCartItem(id, quantity);
      setItems((prev) =>
        prev.map((item) =>
          item.cart_product_id === id ? { ...item, quantity } : item,
        ),
      );
    } catch (err) {
      console.error("Error actualizando cantidad:", err);
    }
  };

  const handleRemove = async (id: string) => {
    try {
      await removeFromCart(id);
      setItems((prev) => prev.filter((item) => item.cart_product_id !== id));
    } catch (err) {
      console.error("Error eliminando item:", err);
    }
  };

  const handleClear = async () => {
    if (!confirm("¿Vaciar el carrito?")) return;
    try {
      await clearCart();
      setItems([]);
    } catch (err) {
      console.error("Error vaciando carrito:", err);
    }
  };

  const total = items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );

  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${theme === "dark" ? "bg-bgSecondary text-white" : "bg-bgPrimary text-black"}`}
      >
        <p className="text-gray-400">Cargando carrito...</p>
      </div>
    );
  }

  return (
    <main
      className={`flex flex-col min-h-screen pt-20  ${theme === "dark" ? "bg-bgSecondary text-white" : "bg-bgPrimary text-black"}`}
    >
      <div className="max-w-5xl mx-auto w-full flex-1 px-4 md:px-10">
        {/* Header */}
        <div className="flex items-center justify-end mb-8">
          {items.length > 0 && (
            <button
              onClick={handleClear}
              className="text-sm text-secondary hover:text-red-700 transition-colors flex items-center gap-1 "
            >
              <MdDeleteForever className="text-lg" />
              Vaciar carrito
            </button>
          )}
        </div>

        {items.length === 0 ? (
          // Carrito vacío
          <div className="flex flex-col items-center justify-center gap-6 py-24">
            <p className="text-xl text-gray-400">Tu carrito está vacío</p>
            <button
              onClick={() => navigate("/products")}
              className="px-6 py-2 rounded-3xl border hover:scale-105 transition-all"
            >
              Ver productos
            </button>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex flex-col gap-4 flex-grow">
              {items.map((item) => (
                <div
                  key={item.cart_product_id}
                  className={`flex gap-4 p-4 rounded-2xl border ${theme === "dark" ? "bg-bgSecondary border-gray-500" : "bg-bgPrimary border-gray-300"} shadow-sm`}
                >
                  <img
                    src={
                      item.images?.[0]
                        ? `${API_URL}${item.images[0].url}`
                        : "/placeholder.png"
                    }
                    alt={item.name}
                    className="w-24 h-24 object-contain rounded-xl "
                  />

                  {/* Info */}
                  <div className="flex flex-col flex-grow gap-1">
                    <h2 className="font-semibold text-lg">{item.name}</h2>
                    <p className="text-gray-400 text-sm">
                      Precio unitario: ${item.price}
                    </p>

                    <div className="flex items-center gap-3 mt-2">
                      <button
                        onClick={() =>
                          handleQuantityChange(
                            item.cart_product_id,
                            item.quantity - 1,
                          )
                        }
                        disabled={item.quantity <= 1}
                        className={`w-8 h-8 rounded-full border flex items-center justify-center text-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all ${theme === "dark" ? "hover:bg-tertiary" : "hover:bg-tertiary/80 hover:text-white"}`}
                      >
                        −
                      </button>
                      <span className="text-lg font-semibold w-6 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          handleQuantityChange(
                            item.cart_product_id,
                            item.quantity + 1,
                          )
                        }
                        disabled={item.quantity >= item.stock}
                        className={`w-8 h-8 rounded-full border flex items-center justify-center text-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors ${theme === "dark" ? "hover:bg-tertiary" : "hover:bg-tertiary/80 hover:text-white"}`}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col items-end justify-between">
                    <button
                      onClick={() => handleRemove(item.cart_product_id)}
                      className="text-secondary hover:text-red-600 text-2xl transition-colors"
                    >
                      <MdDeleteForever />
                    </button>
                    <p className="font-bold text-lg">
                      ${(item.price * item.quantity).toLocaleString("es-CL")}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div
              className={`lg:w-80 h-fit rounded-2xl border p-6 flex flex-col gap-4 shadow-sm ${theme === "dark" ? "bg-bgSecondary border-gray-600" : "bg-bgPrimary border-gray-300"}`}
            >
              <h2 className="text-xl font-semibold">Resumen</h2>

              <div className="flex flex-col gap-2 text-sm">
                {items.map((item) => (
                  <div
                    key={item.cart_product_id}
                    className="flex justify-between text-gray-400"
                  >
                    <span>
                      {item.name} x{item.quantity}
                    </span>
                    <span>
                      ${(item.price * item.quantity).toLocaleString("es-CL")}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>${total.toLocaleString("es-CL")}</span>
              </div>

              <button
                onClick={() => navigate("/purchase")}
                className="w-full py-3 bg-tertiary hover:bg-blue-700 text-white rounded-2xl font-semibold hover:scale-105 transition-all"
              >
                Proceder al pago
              </button>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </main>
  );
}
