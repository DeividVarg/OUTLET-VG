import { useState, useEffect } from "react";
import { createSubCategory, updateSubCategory } from "~/api/subCategories";
import { fetchCategories } from "~/api/categories";

type SubCategoryFormData = {
  id?: string;
  name: string;
  id_category: string;
};

type Category = {
  id: string;
  name: string;
};

type ModalSubCategoriesProps = {
  isOpen: boolean;
  onClose: () => void;
  subCategory?: SubCategoryFormData;
  onSave: (data: SubCategoryFormData) => void;
};

export const ModalSubcategoriesAdmin = ({
  isOpen,
  onClose,
  subCategory,
  onSave,
}: ModalSubCategoriesProps) => {
  const [formData, setFormData] = useState<SubCategoryFormData>({
    name: "",
    id_category: "",
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    if (subCategory) {
      setFormData({
        id: subCategory.id,
        name: subCategory.name,
        id_category: subCategory.id_category ?? "",
      });
    } else {
      setFormData({ name: "", id_category: "" });
    }

    // Carga categorías al abrir el modal
    const loadCategories = async () => {
      setLoadingCategories(true);
      try {
        const data = await fetchCategories();
        setCategories(data);
      } catch (error) {
        console.error("Error cargando categorías:", error);
      } finally {
        setLoadingCategories(false);
      }
    };

    loadCategories();
  }, [isOpen, subCategory]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.name.trim().length < 2) {
      alert("El nombre debe tener al menos 2 caracteres");
      return;
    }

    if (!formData.id && !formData.id_category) {
      alert("Debes seleccionar una categoría");
      return;
    }

    try {
      let saved: SubCategoryFormData;

      if (formData.id) {
        await updateSubCategory(formData.id, { name: formData.name });
        saved = formData;
      } else {
        const created = await createSubCategory({
          name: formData.name,
          id_category: formData.id_category,
        });
        saved = created;
      }

      onSave(saved);
      alert(formData.id ? "Subcategoría actualizada" : "Subcategoría creada");
      onClose();
    } catch (error) {
      console.error("Error al guardar la subcategoría:", error);
      alert("Error al guardar. Intenta de nuevo.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 flex justify-center items-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-3xl"
        onClick={onClose}
      />

      <div className="relative rounded-2xl p-6 shadow-xl bg-white text-black z-50 w-11/12 sm:w-2/3 lg:w-1/3">
        <h2 className="text-xl font-bold mb-4">
          {subCategory ? "Editar Subcategoría" : "Nueva Subcategoría"}
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <label>Nombre</label>
          <input
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            className="border p-2 rounded"
            placeholder="Nombre de la subcategoría"
          />

          {/* Solo al crear — al editar no se cambia la categoría padre */}
          {!subCategory && (
            <>
              <label>Categoría</label>
              {loadingCategories ? (
                <p className="text-sm text-gray-400">Cargando categorías...</p>
              ) : (
                <select
                  name="id_category"
                  value={formData.id_category}
                  onChange={handleChange}
                  className="border p-2 rounded bg-white"
                >
                  <option value="">Selecciona una categoría</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              )}
            </>
          )}

          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-400 text-white rounded-lg"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              {subCategory ? "Actualizar" : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
