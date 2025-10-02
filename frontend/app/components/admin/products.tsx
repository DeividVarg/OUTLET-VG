import { CardProducts } from '../products/cardProducts'
import { useState } from 'react'
import { ModalProductsAdmin } from './modalProducts'
import Productos from '~/routes/products'

export const AdminProducts = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <div className='h-screen flex flex-col items-center pt-20'>
      {/* Botón para añadir */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="mb-4 bg-blue-500 text-white px-4 py-2 rounded-lg"
      >
        Añadir producto
      </button>

      {/* Modal */}
      <ModalProductsAdmin isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      {/* Grid de productos */}
      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full'>
        {Array.from({ length: 10 }, (_, index) => (
          <CardProducts productId={'' } />
        ))}
      </div>
    </div>
  )
}
