import { useState, useEffect } from "react";
import { ModalCategoriesAdmin } from "./modalCategories";
import { CardCategories } from "../categories/cardCategories";
import { fetchCategories } from "~/api/categories";

type CategoryFormData = {
  id?: string;
  name: string;
  description: string;
};

type Category = {
  id: string;
  name: string;
  description: string;
};

export const AdminCategories = () => {
  const [isOpenCategory, setIsOpenCategory] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const loadCategories = async () => {
      const fetchedCategories = await fetchCategories();
      setCategories(fetchedCategories);
    };

    loadCategories();
  }, []);

  const handleAdd = () => {
    setEditingCategory(null);
    setIsOpenCategory(true);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setIsOpenCategory(true);
  };

  const handleCategorySave = (data: CategoryFormData) => {
    if (!data.id) {
      console.error("La categoría creada no tiene id");
      return;
    }

    setCategories((prev) => {
      const exists = prev.find((cat) => cat.id === data.id);
      if (exists) {
        // actualizar
        return prev.map((cat) =>
          cat.id === data.id ? (data as Category) : cat,
        );
      } else {
        // crear
        return [...prev, data as Category];
      }
    });

    setEditingCategory(null);
    setIsOpenCategory(false);
  };

  return (
    <div className="flex flex-col items-center lg:mt-20 mt-40 w-full p-4 pb-10">
      <div className="mb-6 w-full flex justify-center">
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-tertiary transition-colors font-semibold duration-300"
        >
          + Añadir Categoría
        </button>
      </div>

      <ModalCategoriesAdmin
        isOpen={isOpenCategory}
        onClose={() => setIsOpenCategory(false)}
        category={editingCategory || undefined}
        onSave={handleCategorySave}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full place-items-center">
        {categories.map((cat) => (
          <div
            key={cat.id}
            onClick={() => handleEdit(cat)}
            className="cursor-pointer"
          >
            <CardCategories categoryId={cat.id} name={cat.name} />
          </div>
        ))}
      </div>
    </div>
  );
};
