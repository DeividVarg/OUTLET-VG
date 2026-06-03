import { useNavigate, useSearchParams } from "react-router";
import { useTheme } from "~/context/themeContext";

const REASONS: Record<string, string> = {
  cancelled: "Cancelaste el pago.",
  rejected: "El pago fue rechazado por el banco.",
  timeout: "El tiempo de pago expiró.",
  error: "Ocurrió un error al procesar el pago.",
  not_found: "No se encontró la transacción.",
};

export default function PurchaseFailedPage() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const reason = searchParams.get("reason") ?? "error";

  return (
    <main
      className={`min-h-screen flex items-center justify-center ${theme === "dark" ? "bg-bgSecondary text-white" : "bg-bgPrimary text-black"}`}
    >
      <div className="flex flex-col items-center gap-6 text-center p-8">
        <h1 className="text-3xl font-semibold">Pago no completado</h1>
        <p className="text-gray-400 max-w-sm">{REASONS[reason]}</p>
        <div className="flex gap-4">
          <button
            onClick={() => navigate("/cart")}
            className="px-6 py-3 border rounded-2xl hover:scale-105 transition-all"
          >
            Volver al carrito
          </button>
          <button
            onClick={() => navigate("/products")}
            className="px-6 py-3 bg-tertiary text-white rounded-2xl hover:scale-105 transition-all"
          >
            Ver productos
          </button>
        </div>
      </div>
    </main>
  );
}
