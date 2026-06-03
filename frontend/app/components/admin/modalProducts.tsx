import { useEffect, useState } from "react";
import { fetchCategories } from "~/api/categories";
import { fetchSubCategories } from "~/api/subCategories";
import { updateProduct, createProduct, deleteProduct } from "~/api/poducts";
import { useTheme } from "~/context/themeContext";
import { MdDeleteForever } from "react-icons/md";

type Product = {
  id: string;
  name: string;
  category_id: string;
  category_name: string;
  subcategory_id: string;
  subcategory_name: string;
  price: number;
  state: "available" | "not available";
  description: string;
  stock: number;
  images: Array<{ id: number; url: string }>;
};

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  product?: Product;
  loadProducts?: () => void;
};

const API_URL = import.meta.env.VITE_API_URL;

export const ModalProductsAdmin = ({
  isOpen,
  onClose,
  product,
  loadProducts,
}: ModalProps) => {
  const { theme } = useTheme();

  const [formData, setFormData] = useState({
    name: "",
    category_id: "",
    subcategory_id: "",
    price: 0,
    stock: 0,
    state: "available",
    description: "",
  });

  const [categories, setCategories] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [subCategories, setSubCategories] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [images, setImages] = useState<Array<{ id: number; url: string }>>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<number[]>([]);

  useEffect(() => {
    if (!isOpen) return;
    let aborted = false;

    const loadData = async () => {
      try {
        const [fetchedCategories, fetchedSubCategories] = await Promise.all([
          fetchCategories(),
          fetchSubCategories(),
        ]);

        if (aborted) return;

        setCategories(fetchedCategories || []);
        setSubCategories(fetchedSubCategories || []);

        if (product) {
          setFormData({
            name: product.name || "",
            category_id: String(product.category_id ?? ""),
            subcategory_id: String(product.subcategory_id ?? ""),
            price: product.price || 0,
            stock: product.stock || 0,
            state: product.state || "available",
            description: product.description || "",
          });
          setImages(product.images || []);
          setNewFiles([]);
          setPreviews([]);
          setImagesToDelete([]);
        } else {
          setFormData({
            name: "",
            category_id: "",
            subcategory_id: "",
            price: 0,
            stock: 0,
            state: "available",
            description: "",
          });
          setImages([]);
          setPreviews([]);
          setNewFiles([]);
          setImagesToDelete([]);
        }
      } catch (err) {
        console.error("Error cargando datos:", err);
      }
    };

    loadData();
    return () => {
      aborted = true;
    };
  }, [isOpen, product]);

  const filteredSubCategories = subCategories.filter(
    (s: any) =>
      s.id_category === formData.category_id ||
      s.category_id === formData.category_id,
  );

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    if (name === "price") {
      setFormData((prev) => ({ ...prev, price: parseFloat(value) || 0 }));
      return;
    }
    if (name === "stock") {
      setFormData((prev) => ({ ...prev, stock: parseInt(value) || 0 }));
      return;
    }
    if (name === "category_id") {
      setFormData((prev) => ({
        ...prev,
        category_id: value,
        subcategory_id: "",
      }));
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setPreviews((prev) => [...prev, ...newPreviews]);
    setNewFiles((prev) => [...prev, ...files]);
  };

  const handleRemoveImage = (index: number, fromPreview = false) => {
    if (fromPreview) {
      setPreviews((prev) => prev.filter((_, i) => i !== index));
      setNewFiles((prev) => prev.filter((_, i) => i !== index));
    } else {
      setImages((prev) => {
        const img = prev[index];
        if (img?.id) setImagesToDelete((ids) => [...ids, img.id]);
        return prev.filter((_, i) => i !== index);
      });
    }
  };

  const handleDelete = async () => {
    if (!product) return;
    if (!confirm("¿Seguro que quieres eliminar este producto?")) return;
    try {
      await deleteProduct(product.id);
      if (loadProducts) await loadProducts();
      onClose();
    } catch (err) {
      console.error("Error eliminando el producto:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = new FormData();
    body.append("name", formData.name);
    body.append("category_id", formData.category_id);
    body.append("subcategory_id", formData.subcategory_id);
    body.append("price", formData.price.toString());
    body.append("stock", formData.stock.toString());
    body.append("state", formData.state);
    body.append("description", formData.description);
    imagesToDelete.forEach((id) =>
      body.append("imagesToDelete[]", id.toString()),
    );
    newFiles.forEach((file) => body.append("images", file));

    try {
      if (product) {
        await updateProduct(product.id, body);
        alert("Producto actualizado con éxito");
      } else {
        await createProduct(body);
        alert("Producto creado con éxito");
      }
      if (loadProducts) await loadProducts();
      onClose();
    } catch (err) {
      console.error("Error:", err);
      alert("Ocurrió un error al guardar.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex justify-center items-center w-full h-full">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-3xl"
        onClick={onClose}
      />
      <div
        className={`relative rounded-2xl p-4 sm:p-6 shadow-xl z-50 w-11/12 h-[90vh] sm:h-5/6 mx-4 flex flex-col ${
          theme === "dark" ? "bg-black text-white" : "bg-bgPrimary"
        }`}
      >
        <form
          className="flex flex-col flex-grow overflow-hidden"
          onSubmit={handleSubmit}
        >
          <main className="flex flex-col lg:flex-row w-full overflow-auto flex-grow gap-4">
            {/* PANEL IZQUIERDO: IMÁGENES */}
            <div className="w-full lg:w-5/12 flex flex-col">
              <h2 className="font-semibold mb-2 text-center text-xl">
                {product ? "Editar producto" : "Nuevo producto"}
              </h2>

              <div className="w-full h-48 sm:h-64 overflow-y-auto grid grid-cols-3 sm:grid-cols-2 gap-2 p-2 border rounded-lg">
                {images.map((img, i) => (
                  <div key={`img-${i}`} className="relative">
                    <img
                      src={`${API_URL}${img.url}`}
                      className="w-full h-24 sm:h-32 object-contain rounded-lg border border-gray-400"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(i)}
                      className="absolute top-1 right-1 bg-black/50 text-white w-6 h-6 flex items-center justify-center rounded-full"
                    >
                      <MdDeleteForever />
                    </button>
                  </div>
                ))}
                {previews.map((src, i) => (
                  <div key={`prev-${i}`} className="relative">
                    <img
                      src={src}
                      className="w-full h-24 sm:h-32 object-contain rounded-lg border bg-gray-50"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(i, true)}
                      className="absolute top-1 right-1 bg-black/50 text-white w-6 h-6 flex items-center justify-center rounded-full"
                    >
                      <MdDeleteForever />
                    </button>
                  </div>
                ))}
              </div>

              <label className="mt-4 w-full cursor-pointer bg-tertiary hover:bg-blue-700 text-white text-center py-2 rounded-lg transition-colors">
                Subir imágenes
                <input
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleImageUpload}
                  accept="image/*"
                />
              </label>
            </div>

            {/* PANEL DERECHO: FORMULARIO */}
            <div className="flex flex-col w-full lg:w-7/12 gap-3">
              <div>
                <label className="block text-sm font-medium">Nombre</label>
                <input
                  name="name"
                  type="text"
                  required
                  className={`w-full border p-2 rounded outline-none ${theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-black"}`}
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium">Categoría</label>
                  <select
                    name="category_id"
                    className={`w-full border p-2 rounded outline-none ${theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-black"}`}
                    value={formData.category_id}
                    onChange={handleChange}
                  >
                    <option value="">Selecciona</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium">
                    Subcategoría
                  </label>
                  <select
                    name="subcategory_id"
                    className={`w-full border p-2 rounded outline-none ${theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-black"}`}
                    value={formData.subcategory_id}
                    onChange={handleChange}
                    disabled={!formData.category_id}
                  >
                    <option value="">Selecciona</option>
                    {filteredSubCategories.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium">Precio</label>
                  <input
                    name="price"
                    type="text"
                    inputMode="decimal"
                    className={`w-full border p-2 rounded outline-none ${theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-black"}`}
                    placeholder="0.00"
                    value={formData.price}
                    onChange={(e) => {
                      if (/^\d*\.?\d{0,2}$/.test(e.target.value))
                        handleChange(e);
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Stock</label>
                  <input
                    name="stock"
                    type="number"
                    min="0"
                    className={`w-full border p-2 rounded outline-none ${theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-black"}`}
                    value={formData.stock}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium">Estado</label>
                <select
                  name="state"
                  className={`w-full border p-2 rounded outline-none ${theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-black"}`}
                  value={formData.state}
                  onChange={handleChange}
                >
                  <option value="available">Disponible</option>
                  <option value="not available">No disponible</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium">Descripción</label>
                <textarea
                  name="description"
                  rows={3}
                  className={`w-full border p-2 rounded outline-none ${theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-black"}`}
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>
            </div>
          </main>

          <footer className="flex justify-end w-full mt-4 mb-2">
            <div className="flex gap-3 flex-wrap justify-end">
              <button
                type="button"
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors text-sm"
                onClick={onClose}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors font-semibold text-sm"
              >
                {product ? "Actualizar" : "Guardar"}
              </button>
              {product && (
                <button
                  type="button"
                  className="bg-secondary hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors font-semibold text-sm"
                  onClick={handleDelete}
                >
                  Eliminar
                </button>
              )}
            </div>
          </footer>
        </form>
      </div>
    </div>
  );
};
