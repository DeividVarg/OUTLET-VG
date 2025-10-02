
import { CardProducts } from '~/components/products/cardProducts'
import { useTheme } from '~/context/themeContext'
import { Footer } from '~/components/home/footer'

export default function Productos() {
  const { theme } = useTheme()

  return (
    <main className={theme === 'dark' ? 'bg-black text-white h-full' : 'bg-white text-black ' }>
      <section className="grid lg:grid-cols-5 md:grid-cols-3 gap-4 place-self-center-safe space-y-4 pt-18">
        {Array.from({ length: 12 }, (_, i) => (
          <CardProducts key={i} />
        ))}
      </section>

      <footer>
        <Footer />
      </footer>
    </main>
  )
  
}