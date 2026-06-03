import { useState, useEffect } from "react";
import { ModalSubcategoriesAdmin } from "./modalSubcategories";
import { CardSubCategories } from "../subCategories/cardSubCategories";
import { fetchSubCategories, deleteSubCategory } from "~/api/subCategories";

type SubCategory = {
  id: string;
  name: string;
  id_category: string;
};

export const AdminSubCategories = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [editingSubCategory, setEditingSubCategory] =
    useState<SubCategory | null>(null);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);

  useEffect(() => {
    loadSubCategories();
  }, []);

  const loadSubCategories = async () => {
    try {
      const data = await fetchSubCategories();
      setSubCategories(data);
    } catch (error) {
      console.error("Error cargando subcategorías:", error);
    }
  };

  const handleAdd = () => {
    setEditingSubCategory(null);
    setIsOpen(true);
  };

  const handleEdit = (subCategory: SubCategory) => {
    setEditingSubCategory(subCategory);
    setIsOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar esta subcategoría?")) return;
    try {
      await deleteSubCategory(id);
      setSubCategories((prev) => prev.filter((s) => s.id !== id));
    } catch (error) {
      console.error("Error eliminando subcategoría:", error);
    }
  };

  const handleSave = (data: SubCategory) => {
    setSubCategories((prev) => {
      const exists = prev.find((s) => s.id === data.id);
      if (exists) {
        return prev.map((s) => (s.id === data.id ? data : s));
      }
      return [...prev, data];
    });
    setEditingSubCategory(null);
    setIsOpen(false);
  };

  return (
    <div className="flex flex-col items-center lg:mt-20 mt-40 w-full p-4 pb-10">
      <div className="mb-6 w-full flex justify-center">
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-tertiary transition-colors font-semibold duration-300"
        >
          + Añadir Subcategoría
        </button>
      </div>

      <ModalSubcategoriesAdmin
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        subCategory={editingSubCategory || undefined}
        onSave={handleSave}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full place-items-center">
        {" "}
        {subCategories.map((sub) => (
          <div key={sub.id} className="flex flex-col gap-2">
            <div onClick={() => handleEdit(sub)} className="cursor-pointer">
              <CardSubCategories subCategoryId={sub.id} name={sub.name} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
