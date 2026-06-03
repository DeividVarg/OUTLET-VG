import { useLocation } from "react-router";
import { deleteCategory } from "~/api/categories";
import { useNavigate } from "react-router";
import { useTheme } from "~/context/themeContext";
import { MdDeleteForever } from "react-icons/md";

export const CardCategories = ({
  categoryId,
  name,
}: {
  categoryId: string;
  name: string;
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme } = useTheme();

  const handleDelete = () => {
    const confirmed = window.confirm("¿Desea eliminar la categoría?");
    if (!confirmed) return;

    try {
      deleteCategory(categoryId);
      window.location.reload();
    } catch (error) {
      console.error("Error al eliminar la categoría:", error);
    }
  };

  const handleSubmit = () => {
    if (location.pathname !== "/admin") {
      navigate(`/products?category=${categoryId}`);
    }
  };

  return (
    <div
      className={`relative flex justify-center items-center shadow-lg  group hover:scale-105 transition-all duration-300 h-60 w-72  rounded-2xl animate-blink ${theme === "dark" ? "bg-primary" : "bg-secondary"}`}
      id={categoryId}
      onClick={handleSubmit}
    >
      <div>
        {location.pathname === "/admin" ? (
          <button
            className="text-3xl absolute top-1 right-3 hover:scale-90 transition-transform text-white"
            onClick={handleDelete}
          >
            <MdDeleteForever />
          </button>
        ) : null}
      </div>
      <p className="absolute text-3xl text-center font-semibold px-2 text-white">
        {name}
      </p>
    </div>
  );
};
