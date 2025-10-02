import { useState } from 'react'
import { ModalProducts } from './modalProducts'
import { useLocation } from 'react-router'
import { ModalProductsAdmin } from '../admin/modalProducts'
// import { useProductsContext } from '~/context/productsContext' // ejemplo

export const CardProducts = ({ productId }: { productId: string }) => {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()
  // const { deleteProduct } = useProductsContext() // función del contexto

  const handleDelete = () => {
    if (confirm("¿Seguro que quieres eliminar este producto?")) {
      // deleteProduct(productId)
    }
  }

  return (
    <div className="relative group">
      <article className="relative">
        {/* Botón de eliminar solo en admin */}
        {location.pathname === '/admin' && (
          <button
            onClick={handleDelete}
            className="absolute top-0 right-1  px-2 py-1 rounded z-10 group-hover:scale-105 place-items-center"
          >
            ❌
          </button>
        )}

        <button
          className="group-hover:scale-105 w-60 transition-all duration-300"
          onClick={() => setIsOpen(true)}
        >
          <div className="flex flex-col justify-center items-center">
            <header>
              <h2 className="text-2xl font-bold">Product Title</h2>
            </header>
            <main>
              <p className="text-2xl text-gray-700 text-center font-semibold">
                $99.99
              </p>
            </main>
            <footer className="h-48 w-full mt-2">
              <img
                className="w-full h-full object-fill rounded-2xl"
                src={'/carrusel/descarga.jpg'}
                alt="product"
              />
            </footer>
          </div>
        </button>
      </article>

      {/* Modal según la ruta */}
      {location.pathname === '/admin' ? (
        <ModalProductsAdmin isOpen={isOpen} onClose={() => setIsOpen(false)} />
      ) : (
        <ModalProducts isOpen={isOpen} onClose={() => setIsOpen(false)} />
      )}
    </div>
  )
}
