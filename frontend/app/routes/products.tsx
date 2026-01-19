import { CardProducts } from '~/components/products/cardProducts'
import { useTheme } from '~/context/themeContext'
import { Footer } from '~/components/home/footer'
import { fetchProducts } from '~/api/poducts'
import { useEffect, useState } from 'react'

export default function Productos() {
  const { theme } = useTheme()
  const [products, setProducts] = useState([])

  const loadProducts = async () => {
    const data = await fetchProducts()
    setProducts(data)
  }

  useEffect(() => {
    loadProducts()
  }, [])

  return (
    <main
      className={
        theme === 'dark' ? 'bg-black text-white h-full' : 'bg-white text-black '
      }
    >
      <section className="grid lg:grid-cols-5 md:grid-cols-3 gap-4 place-self-center-safe space-y-4 pt-18 h-screen pb-10">
        {products.map((product: any) => (
          <CardProducts key={product.id} product={product} />
        ))}
      </section>

      <footer>
        <Footer />
      </footer>
    </main>
  )
}
