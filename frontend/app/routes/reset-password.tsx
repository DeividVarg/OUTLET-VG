import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { resetPassword } from "~/api/users";
import { useTheme } from "~/context/themeContext";

export default function ResetPasswordPage() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="text-4xl">❌</div>
          <p className="text-md">Enlace inválido o expirado.</p>
          <button
            onClick={() => navigate("/forgot-password")}
            className="text-sm border-b border-gray-400 hover:scale-105 transition-all"
          >
            Solicitar nuevo enlace
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    if (newPassword.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    setLoading(true);

    try {
      const res = await resetPassword(token, newPassword);
      if (res.success) {
        setSuccess(true);
        setTimeout(() => navigate("/login"), 2000);
      } else {
        setError("El enlace es inválido o ha expirado.");
      }
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
      {/* Blur de fondo */}
      <div
        className={`h-[500px] w-[600px] absolute rounded-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 blur-3xl animate-flash animate-delay-300 ${
          theme === "dark" ? "bg-secondary/20" : "bg-secondary/20"
        }`}
      />

      <div className="relative flex flex-col items-center gap-6 w-80">
        <img
          src="/logo sin letras.svg"
          alt="Logo"
          className="h-44 w-44 -my-15"
        />
        <h1 className="text-3xl font-semibold">Nueva contraseña</h1>

        {success ? (
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="text-4xl">✅</div>
            <p className=" text-md">
              Contraseña actualizada correctamente. Redirigiendo al login...
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="flex flex-col items-center gap-4 w-full"
          >
            <label htmlFor="newPassword" className="text-lg self-start">
              Nueva contraseña
            </label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              placeholder="Mínimo 8 caracteres"
              className={`border rounded-md p-2 w-full font-semibold ${
                theme === "dark"
                  ? "text-white border-gray-400 bg-transparent"
                  : "text-black border-gray-600"
              }`}
            />

            <label htmlFor="confirmPassword" className="text-lg self-start">
              Confirmar contraseña
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Repite la contraseña"
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
              disabled={loading || !newPassword || !confirmPassword}
              className="text-lg w-full py-2 rounded-3xl border transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? "Guardando..." : "Cambiar contraseña"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
