import { useState } from "react"
import { ModalCategoriesAdmin } from './adminCategories'

type Category = {
  id: string
  name: string
  description: string
}

export const AdminCategories = () => {
  const [isOpenCategory, setIsOpenCategory] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)

  // 👇 Ejemplo de categorías estáticas (luego puedes cargarlas desde el backend/contexto)
  const [categories, setCategories] = useState<Category[]>([
    { id: "1", name: "Electrónica", description: "Celulares, laptops, tablets" },
    { id: "2", name: "Ropa", description: "Moda para todos" },
  ])

  const handleAdd = () => {
    setEditingCategory(null) // modo creación
    setIsOpenCategory(true)
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category) // modo edición
    setIsOpenCategory(true)
  }

  return (
    <div className="h-screen flex flex-col items-center pt-20 w-full">
      {/* Botón añadir */}
      <div className="mb-6">
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          + Añadir Categoría
        </button>
      </div>

      <div>
        
      </div>
    </div>
  )
}