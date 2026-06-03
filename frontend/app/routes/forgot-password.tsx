import { useState } from "react";
import { forgotPassword } from "~/api/users";
import { useTheme } from "~/context/themeContext";
import { useNavigate } from "react-router";

export default function ForgotPasswordPage() {
  const { theme } = useTheme();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await forgotPassword(email);
      setSent(true);
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center relative ${theme === "dark" ? "bg-bgSecondary text-white" : "bg-bgPrimary text-black"}`}
    >
      <div
        className={`h-[500px] w-[600px] absolute rounded-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 blur-3xl animate-flash animate-delay-300 ${
          theme === "dark" ? "bg-secondary/20" : "bg-secondary/20"
        }`}
      />

      <div className="relative flex flex-col items-center gap-6 w-80">
        <img
          src="/logo sin letras.svg"
          alt="Logo"
          className="h-60 w-60 -my-20"
        />
        <h1 className="text-3xl font-semibold">Olvidé mi contraseña</h1>

        {sent ? (
          <div className="flex flex-col items-center gap-4 text-center mt-5">
            <p
              className={`text-lg ${theme === "dark" ? "text-white" : "text-black"}`}
            >
              Si el correo está registrado, recibirás un enlace para restablecer
              tu contraseña.
            </p>
            <button
              onClick={() => navigate("/login")}
              className={`text-sm border-b transition-all hover:scale-105 mt-10 ${
                theme === "dark" ? "border-secondary" : "border-primary"
              }`}
            >
              Volver al inicio de sesión
            </button>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="flex flex-col items-center gap-4 w-full"
          >
            <p className="text-md text-gray-400 text-center">
              Ingresa tu correo y te enviaremos un enlace para restablecer tu
              contraseña.
            </p>

            <label htmlFor="email" className="text-xl self-start">
              Correo
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Ingresa tu correo"
              className={`border rounded-md p-2 w-full font-semibold ${
                theme === "dark"
                  ? "text-white border-gray-400 bg-transparent"
                  : "text-black border-gray-800"
              }`}
            />

            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading || !email}
              className="text-lg w-full py-2 rounded-3xl border transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? "Enviando..." : "Enviar enlace"}
            </button>

            <button
              onClick={() => navigate("/login")}
              className={`text-sm border-b transition-all hover:scale-105 ${
                theme === "dark" ? "border-secondary" : "border-primary"
              }`}
            >
              Volver al inicio de sesión
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
