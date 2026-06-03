import { CardCategories } from "~/components/categories/cardCategories";
import { useTheme } from "~/context/themeContext";
import { Footer } from "~/components/home/footer";
import { fetchCategories } from "~/api/categories";
import { useEffect, useState } from "react";

export default function Categories() {
  const { theme } = useTheme();
  const [categories, setCategories] = useState([]);

  const loadCategories = async () => {
    const data = await fetchCategories();
    setCategories(data);
  };

  useEffect(() => {
    loadCategories();
  }, []);

  console.log(categories);

  return (
    <main
      className={`flex flex-col min-h-screen ${
        theme === "dark"
          ? "bg-bgSecondary text-white"
          : "bg-bgPrimary text-black"
      }`}
    >
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 place-items-center justify-center gap-4 pt-20  px-4 max-w-7xl h-full">
        {categories.length > 0 ? (
          categories.map((category: { id: string; name: string }) => (
            <CardCategories
              key={category.id}
              categoryId={category.id}
              name={category.name}
            />
          ))
        ) : (
          <p>Cargando categorías o no hay resultados...</p>
        )}
      </section>

      <Footer />
    </main>
  );
}
