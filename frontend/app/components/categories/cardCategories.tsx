import { useLocation } from 'react-router'
import { deleteCategory } from '~/api/categories'
import { useNavigate } from 'react-router'

export const CardCategories = ({
  categoryId,
  name,
}: {
  categoryId: string
  name: string
}) => {
  const location = useLocation()
  const navigate = useNavigate()

  const handleDelete = () => {
    const confirmed = window.confirm('¿Desea eliminar la categoría?')
    if (!confirmed) return

    try {
      deleteCategory(categoryId)
      window.location.reload()
    } catch (error) {
      console.error('Error al eliminar la categoría:', error)
    }
  }

  const handleSubmit = () => {
    if (location.pathname !== '/admin') {
      navigate(`/product/${categoryId}`)
    }
  }

  return (
    <div
      className="relative flex justify-center items-center group hover:scale-105 transition-all duration-300 h-60 w-72 bg-red-950/60 rounded-2xl animate-blink"
      id={categoryId}
      onClick={handleSubmit}
    >
      <div>
        {location.pathname === '/admin' ? (
          <button
            className="text-3xl absolute top-1 right-3 hover:scale-90 transition-transform"
            onClick={handleDelete}
          >
            X
          </button>
        ) : null}
      </div>
      <p className="absolute text-2xl text-center font-semibold px-2 text-white">
        {name}
      </p>
    </div>
  )
}
