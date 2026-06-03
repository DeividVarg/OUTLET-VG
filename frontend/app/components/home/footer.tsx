import { SiWhatsapp } from "react-icons/si";
import { BsInstagram } from "react-icons/bs";
import { SiFacebook } from "react-icons/si";
import { useTheme } from "~/context/themeContext";
import { createQuestion } from "~/api/questions";

export const Footer = () => {
  const { theme } = useTheme();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    const form = e.currentTarget;
    try {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);

      const question = formData.get("question") as string;
      const email = formData.get("email") as string;

      await createQuestion(question, email);

      form.reset();

      alert("¡Pregunta enviada con éxito!");
    } catch (error) {
      console.error("Error al enviar la pregunta:", error);
      alert(
        "Hubo un error al enviar la pregunta. Por favor, inténtalo de nuevo.",
      );
    }
  };
  return (
    <footer className="border-t mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-6 grid gap-6 md:grid-cols-2 place-items-center">
        <form action="post" onSubmit={handleSubmit}>
          <h5 className="font-semibold mb-3">
            ¿Tienes alguna pregunta? Contáctanos.
          </h5>

          <div className="flex gap-3 flex-col lg:flex-row">
            <textarea
              id="question"
              name="question"
              placeholder="Escribe tu pregunta aquí..."
            />
            <input
              type="email"
              name="email"
              id="email"
              placeholder="Ingresa tu correo"
              className="flex-1 px-4 py-2 border rounded-md "
            />
            <button
              type="submit"
              className={`px-4 py-2 bg-tertiary rounded-md hover:bg-blue-600 hover:scale-105 transition-all duration-300 text-white font-semibold `}
            >
              Enviar
            </button>
          </div>
        </form>
        <section>
          <h5 className="font-semibold mb-3">Nuestras Redes</h5>

          <ul className="flex gap-4">
            <button className="text-4xl hover:scale-110 transition-transform duration-300">
              <a
                href="http://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <BsInstagram />
              </a>
            </button>
            <button className="text-4xl hover:scale-110 transition-transform duration-300">
              <a
                href="http://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <SiFacebook />
              </a>
            </button>
            <button className="text-4xl hover:scale-110 transition-transform duration-300">
              <a href="http://whatsapp.com" target="_blank" rel="noopener">
                <SiWhatsapp />
              </a>
            </button>
          </ul>
        </section>
      </div>
    </footer>
  );
};
