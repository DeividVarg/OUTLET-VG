import { CardProducts } from '../products/cardProducts'
import { useState, useEffect } from 'react'
import { ModalProductsAdmin } from './modalProducts'
import { fetchProducts } from '~/api/poducts'

export const AdminProducts = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [products, setProducts] = useState([])
  const [selectedProduct, setSelectedProduct] = useState<any>(null)

  const loadProducts = async () => {
    const data = await fetchProducts()
    setProducts(data)
  }

  const handleEdit = (product: any) => {
    setSelectedProduct(product)
    setIsModalOpen(true)
  }

  const handleCreate = () => {
    setSelectedProduct(null)
    setIsModalOpen(true)
  }

  useEffect(() => {
    loadProducts()
  }, [])

  return (
    <div className="h-screen flex flex-col items-center pt-20">
      <button
        onMouseDown={handleCreate}
        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 mb-5"
      >
        + Añadir Producto
      </button>

      <ModalProductsAdmin
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={selectedProduct}
        loadProducts={loadProducts}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full px-4">
        {products.map((product: any) => (
          <div
            key={product.id}
            onMouseDown={() => handleEdit(product)}
            className="cursor-pointer"
          >
            <CardProducts product={product} />
          </div>
        ))}
      </div>
    </div>
  )
}
