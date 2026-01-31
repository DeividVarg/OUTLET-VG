import { CardProducts } from '~/components/products/cardProducts'
import { useTheme } from '~/context/themeContext'
import { Footer } from '~/components/home/footer'
import { fetchProductsByCategory } from '~/api/poducts'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

export default function Productos() {
  const { theme } = useTheme()
  const { id } = useParams()
  const [products, setProducts] = useState([])

  const loadProducts = async () => {
    const data = await fetchProductsByCategory(id)
    console.log(data)
    setProducts(data)
  }

  useEffect(() => {
    console.log('Category ID changed:', id)
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
