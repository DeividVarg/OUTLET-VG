import { useState } from "react";
import { useNavigate } from "react-router";
import { createUser } from "~/api/users";
import { useAuth } from "../../hooks/auth";
import { useTheme } from "~/context/themeContext";

export const RegisterCard = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      password2: formData.get("password2") as string,
      name: formData.get("name") as string,
      number_phone: formData.get("number_phone") as string,
    };

    try {
      const user = await createUser(data);

      if (user.success) {
        await login();
        navigate("/");
        return;
      }
      setError("Error al registrar. Verifique los datos e intente de nuevo.");
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
    }
  };

  return (
    <div>
      <div
        className={`h-[500px] w-[600px] absolute rounded-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 mt-5 blur-3xl animate-flash animate-delay-300 ${
          theme === "dark" ? "bg-secondary/20" : "bg-secondary/20"
        }`}
      />

      <div className="w-96 h-96 flex flex-col justify-center items-center rounded-4xl relative">
        <div className="flex items-center">
          <img
            src="/logo sin letras.svg"
            alt="Logo"
            className="h-40 w-40 -mr-4 -ml-10"
          />
          <h2 className="text-2xl font-semibold -ml-4 -mt-4">Registro</h2>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col justify-center items-center gap-3 -mt-10"
        >
          <label htmlFor="email" className="text-xl">
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
          <label htmlFor="name" className="text-xl">
            Nombre
          </label>
          <input
            id="name"
            type="text"
            name="name"
            className={`border rounded-md p-2 w-64 font-semibold ${
              theme === "dark"
                ? "text-white border-gray-400"
                : "text-black border-gray-800"
            }`}
            placeholder="Ingrese su nombre"
          />

          <label htmlFor="number_phone" className="text-xl">
            Número de teléfonico
          </label>
          <input
            id="number_phone"
            type="text"
            name="number_phone"
            className={`border rounded-md p-2 w-64 font-semibold ${
              theme === "dark"
                ? "text-white border-gray-400"
                : "text-black border-gray-800"
            }`}
            placeholder="Ingrese su número de teléfono"
          />

          <label htmlFor="password" className="text-xl">
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

          <label htmlFor="password2" className="text-xl">
            Repita Contraseña
          </label>
          <input
            id="password2"
            type="password"
            name="password2"
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
            className="text-lg mt-2 py-1 px-6 rounded-3xl transition-all animate-duration-400  border mb-2 hover:scale-110 hover:border-gray-500"
          >
            Registrarse
          </button>
        </form>
        <button
          onClick={() => navigate("/login")}
          className={`hover:scale-110 border-b transition-all animate-duration-400 mt-2 ${
            theme === "dark" ? "border-secondary" : "border-primary"
          }`}
        >
          ¿Ya tienes cuenta? Inicia sesión aquí
        </button>
      </div>
    </div>
  );
};
