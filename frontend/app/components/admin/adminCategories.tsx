import { useState, useEffect } from "react"

type Category = {
  name: string
  description: string
}

type ModalCategoryProps = {
  isOpen: boolean
  onClose: () => void
  category?: Category // si existe, es edición
}

export const ModalCategoriesAdmin = ({ isOpen, onClose, category }: ModalCategoryProps) => {
  const [formData, setFormData] = useState<Category>({
    name: "",
    description: "",
  })

  useEffect(() => {
    if (!isOpen) return

    if (category) {
      // Modo edición
      setFormData({
        name: category.name,
        description: category.description,
      })
    } else {
      // Modo creación
      setFormData({
        name: "",
        description: "",
      })
    }
  }, [isOpen, category])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (category) {
      console.log("Actualizar categoría:", formData)
      // aquí llamas a la API para actualizar
    } else {
      console.log("Crear categoría:", formData)
      // aquí llamas a la API para crear
    }
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-40 flex justify-center items-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-3xl"></div>

      <div className="relative rounded-2xl p-6 shadow-xl bg-white text-black z-50 w-11/12 sm:w-2/3 lg:w-1/3">
        <h2 className="text-xl font-bold mb-4">
          {category ? "Editar Categoría" : "Nueva Categoría"}
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <label>Nombre</label>
          <input
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            className="border p-2 rounded"
            placeholder="Nombre de la categoría"
          />

          <label>Descripción</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="border p-2 rounded"
            placeholder="Descripción de la categoría"
          />

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
              className="px-4 py-2 bg-green-600 text-white rounded-lg"
            >
              {category ? "Actualizar" : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
