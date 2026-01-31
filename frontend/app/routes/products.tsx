import { CardProducts } from '~/components/products/cardProducts'
import { useTheme } from '~/context/themeContext'
import { Footer } from '~/components/home/footer'
import { fetchProducts } from '~/api/poducts'
import { useEffect, useState } from 'react'
import { ModalProducts } from '~/components/products/modalProducts'
import { ModalProductsAdmin } from '~/components/admin/modalProducts'
import { useLocation } from 'react-router'

export default function Productos() {
  const { theme } = useTheme()
  const location = useLocation()

  const [products, setProducts] = useState([])
  const [isOpen, setIsOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<any>(null)

  const loadProducts = async () => {
    const data = await fetchProducts()
    setProducts(data)
  }

  useEffect(() => {
    loadProducts()
  }, [])

  const handleOpen = (product: any) => {
    setSelectedProduct(product)
    setIsOpen(true)
  }

  const handleClose = () => {
    setIsOpen(false)
    setSelectedProduct(null)
  }

  return (
    <main
      className={
        theme === 'dark'
          ? 'bg-black text-white min-h-screen'
          : 'bg-white text-black min-h-screen'
      }
    >
      <section className="grid lg:grid-cols-5 md:grid-cols-3 gap-4 pt-18 pb-10 px-5">
        {products.map((product: any) => (
          <CardProducts
            key={product.id}
            product={product}
            onOpen={handleOpen}
          />
        ))}
      </section>

      {location.pathname === '/admin' ? (
        <ModalProductsAdmin
          isOpen={isOpen}
          onClose={handleClose}
          product={selectedProduct}
        />
      ) : (
        <ModalProducts
          isOpen={isOpen}
          onClose={handleClose}
          product={selectedProduct}
        />
      )}

      <Footer />
    </main>
  )
}
