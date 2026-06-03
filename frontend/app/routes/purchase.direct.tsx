import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { useTheme } from "~/context/themeContext";
import { createPucharses } from "~/api/pucharse";
import { initPayment, initPaymentMP } from "~/api/payment";
import { AddressAutocomplete } from "~/components/purchases/AddressAutocomplete";
import type { StructuredAddress } from "~/hooks/useAddressAutocomplete";
import { Footer } from "~/components/home/footer";

const API_URL = import.meta.env.VITE_API_URL;

type PaymentMethod = "transbank" | "mercadopago";

export default function PurchaseDirectView() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const product = location.state;

  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("transbank");
  const [quantity, setQuantity] = useState(1);
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
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!product?.product_id) {
      navigate("/products");
    }
  }, []);

  const subtotal = Number(product.price) * quantity;

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
        product_id: product.product_id,
        quantity,
        direction: directionString,
        phone: formData.phone,
      });

      if (!res?.id) throw new Error("No se pudo crear la compra");

      await redirectToPayment(res.id);
    } catch (err: any) {
      // Compra pendiente existente — retomar con el mismo método
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

  const paymentLabel: Record<PaymentMethod, string> = {
    transbank: "Webpay",
    mercadopago: "MercadoPago",
  };

  return (
    <main
      className={`flex flex-col min-h-screen pt-20  ${
        theme === "dark"
          ? "bg-bgSecondary text-white"
          : "bg-bgPrimary text-black"
      }`}
    >
      <div className="max-w-4xl mx-auto flex-1 w-full px-4 md:px-10">
        <h1 className="text-3xl font-semibold mb-8">Comprar ahora</h1>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col lg:flex-row gap-8"
        >
          {/* Panel izquierdo */}
          <div className="flex flex-col gap-6 flex-grow">
            {/* Producto */}
            <div
              className={`rounded-2xl border p-6 flex gap-4 items-center ${
                theme === "dark"
                  ? "bg-bgSecondary border-gray-500"
                  : "bg-bgPrimary border-gray-300"
              }`}
            >
              {product.image && (
                <img
                  src={`${API_URL}${product.image}`}
                  alt={product.name}
                  className="w-20 h-20 object-contain rounded-xl"
                />
              )}
              <div className="flex-grow">
                <p className="font-semibold text-lg">{product.name}</p>
                <p className="text-gray-500 text-sm">
                  ${Number(product.price).toLocaleString("es-CL")} c/u
                </p>
              </div>

              {/* Selector de cantidad */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors ${
                    theme === "dark"
                      ? "hover:bg-gray-500"
                      : "hover:bg-gray-600 hover:text-white"
                  }`}
                >
                  −
                </button>
                <span className="text-lg font-semibold w-6 text-center">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setQuantity((q) => Math.min(product.stock, q + 1))
                  }
                  disabled={quantity >= product.stock}
                  className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors ${
                    theme === "dark"
                      ? "hover:bg-gray-500"
                      : "hover:bg-gray-600 hover:text-white"
                  }`}
                >
                  +
                </button>
              </div>
            </div>

            {/* Datos de entrega */}
            <div
              className={`rounded-2xl border p-6 flex flex-col gap-4 ${
                theme === "dark"
                  ? "bg-bgSecondary border-gray-500"
                  : "bg-bgPrimary border-gray-200"
              }`}
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
                  className={`border rounded-lg p-3 outline-none ${
                    errors.phone ? "border-red-500" : ""
                  } ${
                    theme === "dark"
                      ? "bg-bgSecondary border-gray-600 text-white"
                      : "bg-bgPrimary border-gray-300"
                  }`}
                />
                {errors.phone && (
                  <p className="text-red-500 text-xs">{errors.phone}</p>
                )}
              </div>
            </div>
          </div>

          {/* Panel derecho — resumen */}
          <div
            className={`lg:w-80 h-fit rounded-2xl border p-6 flex flex-col gap-4 shadow-sm ${
              theme === "dark"
                ? "bg-bgSecondary border-gray-500"
                : "bg-bgPrimary border-gray-200"
            }`}
          >
            <h2 className="text-xl font-semibold">Resumen</h2>

            <div className="flex justify-between text-sm text-gray-500">
              <span>
                {product.name} x{quantity}
              </span>
              <span>${subtotal.toLocaleString("es-CL")}</span>
            </div>

            <div className="border-t pt-4 flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>${subtotal.toLocaleString("es-CL")}</span>
            </div>

            {/* Selector de método de pago */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Método de pago</label>
              <select
                value={paymentMethod}
                onChange={(e) =>
                  setPaymentMethod(e.target.value as PaymentMethod)
                }
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
                : `Pagar con ${paymentLabel[paymentMethod]}`}
            </button>

            <button
              type="button"
              onClick={() => navigate(-1)}
              className="w-full py-2 rounded-2xl text-white bg-red-700 hover:bg-red-600 transition-all hover:scale-105 duration-300"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
      <Footer />
    </main>
  );
}
