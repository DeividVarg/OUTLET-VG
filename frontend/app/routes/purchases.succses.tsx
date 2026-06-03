import { useNavigate, useSearchParams } from "react-router";
import { useTheme } from "~/context/themeContext";

export default function PurchaseSuccessPage() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const purchaseId = searchParams.get("id");

  return (
    <main
      className={`min-h-screen flex items-center justify-center ${theme === "dark" ? "bg-bgSecondary text-white" : "bg-bgPrimary text-black"}`}
    >
      <div className="flex flex-col items-center gap-6 text-center p-8">
        <h1 className="text-4xl font-semibold">¡Compra realizada!</h1>
        <p className="text-gray-400 max-w-md text-lg">
          Tu pedido fue registrado exitosamente. Te contactaremos pronto para
          coordinar la entrega.
        </p>
        {purchaseId && (
          <p className=" text-gray-400">
            ID de pedido:{" "}
            <span
              className={`text-lg ${theme === "dark" ? " text-white" : "text-black"}`}
            >
              {purchaseId}
            </span>{" "}
          </p>
        )}
        <button
          onClick={() => navigate("/products")}
          className="px-8 py-3 bg-tertiary text-white rounded-2xl font-semibold hover:scale-105 transition-all"
        >
          Seguir comprando
        </button>
      </div>
    </main>
  );
}
