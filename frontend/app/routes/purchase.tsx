import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useTheme } from "~/context/themeContext";
import { fetchCart } from "~/api/cart";
import { createPucharses } from "~/api/pucharse";
import { initPayment, initPaymentMP } from "~/api/payment";
import { AddressAutocomplete } from "~/components/purchases/AddressAutocomplete";
import type { StructuredAddress } from "~/hooks/useAddressAutocomplete";
import { Footer } from "~/components/home/footer";

const API_URL = import.meta.env.VITE_API_URL;

type CartItem = {
  cart_product_id: string;
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  images: Array<{ id: number; url: string }>;
};

export default function PucharseView() {
  const { theme } = useTheme();
  const navigate = useNavigate();

  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    address: {
      fullAddress: "",
      street: "",
      streetNumber: "",
      commune: "",
      city: "",
      region: "",
      postalCode: "",
      country: "Chile",
    } as StructuredAddress,
    phone: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [paymentMethod, setPaymentMethod] = useState("transbank");

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchCart();
        if (!data?.length) {
          navigate("/cart");
          return;
        }
        setItems(data);
      } catch {
        navigate("/cart");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const total = items.reduce(
    (acc, item) => acc + Number(item.price) * item.quantity,
    0,
  );

  const validate = () => {
    const newErrors: Record<string, string> = {};

    const { street, streetNumber, commune, postalCode } = formData.address;

    if (!street || !streetNumber || !commune)
      newErrors.address = "Selecciona una dirección del listado";

    if (!postalCode || postalCode.trim().length < 5)
      // ← nuevo
      newErrors.postalCode = "Ingresa el código postal";

    if (formData.phone.trim().length < 8)
      newErrors.phone = "Ingresa un teléfono válido";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddressChange = (newAddress: StructuredAddress) => {
    setFormData((prev) => ({ ...prev, address: newAddress }));
    if (errors.address) setErrors((prev) => ({ ...prev, address: "" }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const redirectToPayment = async (purchaseId: string) => {
    if (paymentMethod === "transbank") {
      const paymentRes = await initPayment(purchaseId);
      window.location.href = `${paymentRes.url}?token_ws=${paymentRes.token}`;
      return;
    }

    if (paymentMethod === "mercadopago") {
      const paymentRes = await initPaymentMP(purchaseId);
      window.location.href = paymentRes.url;
      return;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);

    const directionString = [
      formData.address.street,
      formData.address.streetNumber,
      formData.address.commune,
      formData.address.region,
      formData.address.postalCode,
    ]
      .filter(Boolean)
      .join(", ");

    try {
      const res = await createPucharses({
        direction: directionString,
        phone: formData.phone,
      });

      if (!res?.id) throw new Error("No se pudo crear la compra");

      await redirectToPayment(res.id);
    } catch (err: any) {
      if (err.response?.status === 409) {
        const pendingId = err.response.data.data?.id;
        if (pendingId) {
          try {
            await redirectToPayment(pendingId);
            return;
          } catch {
            alert(
              "Error al retomar el pago pendiente. Intenta de nuevo en unos minutos.",
            );
          }
        }
      }

      console.error("Error al crear compra:", err);
      alert("Ocurrió un error al procesar tu compra. Intenta de nuevo.");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${theme === "dark" ? "bg-bgSecondary text-white" : "bg-bgPrimary text-black"}`}
      >
        <p className="text-gray-400">Cargando...</p>
      </div>
    );
  }

  return (
    <main
      className={`flex flex-col min-h-screen pt-20 ${theme === "dark" ? "bg-bgSecondary text-white" : "bg-bgPrimary text-black"}`}
    >
      <div className="max-w-5xl mx-auto flex-1 w-full px-4 md:px-10 mb-10">
        <h1 className="text-3xl font-semibold mb-8">Finalizar compra</h1>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col lg:flex-row gap-8"
        >
          {/* Panel izquierdo */}
          <div className="flex flex-col gap-6 flex-grow">
            {/* Datos de entrega */}
            <div
              className={`rounded-2xl border p-6 flex flex-col gap-4 ${theme === "dark" ? "bg-bgSecondary border-gray-500" : "bg-white border-gray-300"}`}
            >
              <h2 className="text-xl font-semibold">Datos de entrega</h2>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Dirección</label>
                <AddressAutocomplete
                  value={formData.address.fullAddress}
                  onChange={handleAddressChange}
                  error={errors.address}
                  postalCodeError={errors.postalCode} // ← nuevo
                />
                {errors.direction && (
                  <p className="text-red-500 text-xs">{errors.direction}</p>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">
                  Teléfono de contacto
                </label>
                <input
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Ej: +56 9 1234 5678"
                  className={`border rounded-lg p-3 outline-none ${errors.phone ? "border-red-500" : ""} ${theme === "dark" ? "bg-bgSecondary border-gray-500 text-white" : "bg-white border-gray-300"}`}
                />
                {errors.phone && (
                  <p className="text-red-500 text-xs">{errors.phone}</p>
                )}
              </div>
            </div>

            {/* Productos */}
            <div
              className={`rounded-2xl border p-6 flex flex-col gap-3 ${theme === "dark" ? "bg-bgSecondary border-gray-500" : "bg-white border-gray-300"}`}
            >
              <h2 className="text-xl font-semibold">Productos</h2>
              {items.map((item) => (
                <div
                  key={item.cart_product_id}
                  className="flex items-center gap-4 py-3 border-b last:border-0 "
                >
                  <img
                    src={
                      item.images?.[0]
                        ? `${API_URL}${item.images[0].url}`
                        : "/placeholder.png"
                    }
                    alt={item.name}
                    className="w-14 h-14 object-contain rounded-lg "
                  />
                  <div className="flex-grow">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-gray-400 text-sm">x{item.quantity}</p>
                  </div>
                  <p className="font-semibold">
                    $
                    {(Number(item.price) * item.quantity).toLocaleString(
                      "es-CL",
                    )}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Panel derecho — resumen */}
          <div
            className={`lg:w-80 h-fit rounded-2xl border p-6 flex flex-col gap-4 shadow-sm ${theme === "dark" ? "bg-bgSecondary border-gray-500" : "bg-white border-gray-300"}`}
          >
            <h2 className="text-xl font-semibold">Resumen</h2>

            <div className="flex flex-col gap-2 text-sm text-gray-400">
              {items.map((item) => (
                <div
                  key={item.cart_product_id}
                  className="flex justify-between"
                >
                  <span className="truncate max-w-[160px]">
                    {item.name} x{item.quantity}
                  </span>
                  <span>
                    $
                    {(Number(item.price) * item.quantity).toLocaleString(
                      "es-CL",
                    )}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>${total.toLocaleString("es-CL")}</span>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Método de pago</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className={`border rounded-lg p-3 outline-none ${
                  theme === "dark"
                    ? "bg-gray-800 border-gray-600 text-white"
                    : "bg-white border-gray-300"
                }`}
              >
                <option value="transbank">
                  Webpay Plus (débito / crédito)
                </option>
                <option value="mercadopago">MercadoPago</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-tertiary hover:bg-blue-700 text-white rounded-2xl font-semibold transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {submitting
                ? "Procesando..."
                : `Pagar con ${paymentMethod === "transbank" ? "Webpay" : "MercadoPago"}`}
            </button>

            <button
              type="button"
              onClick={() => navigate("/cart")}
              className={`w-full py-2 border rounded-2xl hover:scale-105 duration-300 transition-all ${theme === "dark" ? "hover:bg-gray-700 hover:text-white" : "hover:bg-gray-500 hover:text-white "}`}
            >
              Volver al carrito
            </button>
          </div>
        </form>
      </div>
      <Footer />
    </main>
  );
}
