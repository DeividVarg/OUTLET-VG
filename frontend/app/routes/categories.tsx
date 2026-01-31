import { CardCategories } from '~/components/categories/cardCategories'
import { useTheme } from '~/context/themeContext'
import { Footer } from '~/components/home/footer'
import { fetchCategories } from '~/api/categories'
import { useEffect, useState } from 'react'

export default function Categories() {
  const { theme } = useTheme()
  const [categories, setCategories] = useState([])

  const loadCategories = async () => {
    const data = await fetchCategories()
    setCategories(data)
  }

  useEffect(() => {
    loadCategories()
  }, [])

  console.log(categories)

  return (
    <main
      className={
        theme === 'dark' ? 'bg-black text-white ' : 'bg-white text-black '
      }
    >
      <section className="grid lg:grid-cols-4 md:grid-cols-2 gap-4 place-items-start pt-20 pb-4 mx-auto h-screen px-4  ">
        {categories.length > 0 ? (
          categories.map((category: { id: string; name: string }) => (
            <CardCategories
              key={category.id}
              categoryId={category.id}
              name={category.name}
            />
          ))
        ) : (
          <p>Cargando categorías o no hay resultados...</p>
        )}
      </section>

      <footer className="mx-auto max-w-7xl">
        <Footer />
      </footer>
    </main>
  )
}