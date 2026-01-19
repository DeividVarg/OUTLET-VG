import { useState } from 'react'
import { ModalProducts } from './modalProducts'
import { useLocation } from 'react-router'
import { ModalProductsAdmin } from '../admin/modalProducts'

const API_URL = import.meta.env.VITE_API_URL

export const CardProducts = ({ product }: { product: any }) => {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()

  return (
    <div className="relative group w-60" id={product.id}>
      <div
        className="group-hover:scale-105 transition-transform duration-300 cursor-pointer flex flex-col"
        onClick={() => setIsOpen(true)}
      >
        <header>
          <h2 className="text-2xl font-bold">{product.name}</h2>
        </header>
        <main className="my-1">
          <p className="text-2xl text-gray-700 text-center font-semibold">
            ${product.price}
          </p>
        </main>
        <footer className="h-48 w-full mt-2">
          <img
            className="w-full h-full object-fill rounded-2xl"
            src={`${API_URL}${product.images[0]?.url}`}
            alt="product"
          />
        </footer>
      </div>

      {/* Modal */}
      {location.pathname === '/admin' ? (
        <ModalProductsAdmin
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          product={product}
        />
      ) : (
        <ModalProducts
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          product={product}
        />
      )}
    </div>
  )
}
