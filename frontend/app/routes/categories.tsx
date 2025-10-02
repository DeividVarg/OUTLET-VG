import { CardCategories } from '~/components/categories/cardCategories'
import { useTheme } from '~/context/themeContext'
import { Footer } from '~/components/home/footer'

export default function Categories() {
  const { theme } = useTheme()

  return (
    <main className={theme === 'dark' ? 'bg-black text-white' : 'bg-white text-black '}>
      <section className="grid lg:grid-cols-4 md:grid-cols-2 gap-4 place-items-center pt-20 pb-4 mx-auto ">
        {Array.from({ length: 8 }, (_, i) => (
          <CardCategories key={i}/>
        ))}
      </section>

      <footer>
        <Footer />
      </footer>
    </main>
  )
}