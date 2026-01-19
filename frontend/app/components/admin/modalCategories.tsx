import { useState, useEffect } from "react"
import { createCategory, updateCategory } from '~/api/categories'

type CategoryFormData = {
    id?: string;
    name: string;
    description: string;
}

type ModalCategoryProps = {
    isOpen: boolean
    onClose: () => void
    category?: CategoryFormData 
    onSave: (data: CategoryFormData) => void 
}

export const ModalCategoriesAdmin = ({ isOpen, onClose, category, onSave }: ModalCategoryProps) => {
    
    const [formData, setFormData] = useState<CategoryFormData>({
        name: "",
        description: "",
    })

    useEffect(() => {
        if (!isOpen) return

        if (category) {
            setFormData({
                id: category.id,
                name: category.name,
                description: category.description,
            })
        } else {
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

    const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()

  const nameLength = formData.name.trim().length
  const descriptionLength = formData.description.trim().length

  if (nameLength < 4 || descriptionLength < 4) {
    alert('El nombre y la descripción deben tener al menos 4 caracteres')
    return
  }

  try {
    let savedCategory: CategoryFormData

    if (formData.id) {
      await updateCategory(formData.id, {
        name: formData.name,
        description: formData.description,
      })

      savedCategory = formData
    } else {
      const created = await createCategory({
        name: formData.name,
        description: formData.description,
      })

      savedCategory = created
    }

    onSave(savedCategory)

    alert(
      formData.id
        ? 'Categoría actualizada exitosamente'
        : 'Categoría creada exitosamente'
    )

    onClose()
  } catch (error) {
    console.error('Error al guardar la categoría:', error)
  }
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
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                        >
                            {category ? "Actualizar" : "Guardar"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}