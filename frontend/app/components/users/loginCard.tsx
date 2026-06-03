import { useState } from "react";
import { useNavigate } from "react-router";
import { loginUser, verifyLoginCode } from "~/api/users";
import { useAuth } from "~/hooks/auth";
import { useTheme } from "~/context/themeContext";

export const LoginCard = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const { login } = useAuth();

  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    };

    try {
      const res = await loginUser(data);
      if (res.success) {
        setUserId(res.data.userId);
        setShowModal(true);
      } else {
        setError("Correo o contraseña incorrectos.");
      }
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!userId || code.length !== 6) return;
    setCodeError(null);
    setLoading(true);

    try {
      const res = await verifyLoginCode({ userId, code });
      if (res.success) {
        await login();
        navigate("/admin");
      } else {
        setCodeError("Código incorrecto o expirado.");
      }
    } catch {
      setCodeError("Error de conexión. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCode("");
    setCodeError(null);
    setUserId(null);
  };

  return (
    <div>
      <div
        className={`h-[500px] w-[600px] absolute rounded-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 mt-5 blur-3xl animate-flash animate-delay-300 ${
          theme === "dark" ? "bg-secondary/20" : "bg-secondary/20"
        }`}
      />

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/60 backdrop-blur-sm">
          <div
            className={`rounded-2xl p-8 w-80 flex flex-col items-center gap-4 shadow-2xl border ${
              theme === "dark"
                ? "bg-black/90 text-white border-secondary"
                : "bg-bgPrimary text-black border-primary border-3"
            }`}
          >
            <img
              src="/logo sin letras.svg"
              alt="Logo"
              className="h-30 w-30 -my-10"
            />
            <h2 className="text-xl font-semibold">Verificar identidad</h2>
            <p
              className={`text-sm text-center ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
            >
              Ingresa el código de 6 dígitos que enviamos a tu correo
            </p>

            <input
              type="text"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              placeholder="000000"
              className={`border rounded-md p-2 w-48 text-center text-2xl tracking-widest font-mono ${
                theme === "dark"
                  ? "border-secondary bg-black text-white"
                  : "border-primary text-black border-2"
              }`}
            />

            {codeError && (
              <p className="text-red-500 text-sm text-center">{codeError}</p>
            )}

            <button
              onClick={handleVerify}
              disabled={code.length !== 6 || loading}
              className="text-lg w-full py-2 rounded-3xl border transition-all animate-duration-400 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? "Verificando..." : "Verificar"}
            </button>

            <button
              onClick={handleCloseModal}
              className="text-sm text-gray-400 hover:text-gray-500 transition-all"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="w-96 h-96 flex flex-col justify-center items-center rounded-4xl relative">
        <div className="flex items-center">
          <img
            src="/logo sin letras.svg"
            alt="Logo"
            className="h-40 w-40 -mr-4 -ml-10"
          />
          <h2 className="text-3xl font-semibold -ml-4 -mt-4">Iniciar Sesión</h2>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col justify-center items-center gap-4 -mt-10"
        >
          <label htmlFor="email" className="text-2xl">
            Correo
          </label>
          <input
            id="email"
            type="email"
            name="email"
            className={`border rounded-md p-2 w-64 font-semibold ${
              theme === "dark"
                ? "text-white border-gray-400"
                : "text-black border-gray-800"
            }`}
            placeholder="Ingrese su correo"
          />
          <label htmlFor="password" className="text-2xl">
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            name="password"
            className={`border rounded-md p-2 w-64 font-semibold ${
              theme === "dark"
                ? "text-white border-gray-400"
                : "text-black border-gray-800"
            }`}
            placeholder="Ingrese su contraseña"
          />
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="text-xl mt-2 py-1 px-6 rounded-3xl transition-all border animate-duration-400 hover:scale-110 hover:border-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Enviando..." : "Login"}
          </button>
          <button
            onClick={() => navigate("/register")}
            className={`hover:scale-110 border-b transition-all animate-duration-400 ${
              theme === "dark" ? "border-secondary" : "border-primary"
            }`}
          >
            ¿Aun no tienes cuenta? Regístrate aquí
          </button>
          <button
            onClick={() => navigate("/forgot-password")}
            className={`hover:scale-110 border-b transition-all animate-duration-400 ${
              theme === "dark" ? "border-secondary" : "border-primary"
            }`}
          >
            ¿Olvidaste tu contraseña?
          </button>
        </form>
      </div>
    </div>
  );
};
