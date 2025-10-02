import { Carrusel } from '~/components/home/carrusel'
import { AboutUs } from '~/components/home/aboutUs'
import { ProductsCarrusel } from '~/components/home/productsCarrusel'
import { Footer } from '~/components/home/footer'
import { useTheme } from '~/context/themeContext'

export default function Home() {
  const { theme } = useTheme()

  return (
    <main className={theme === 'dark' ? 'bg-black text-white' : 'bg-white text-black'}>
      <header className="h-screen flex items-center justify-center shadow-2xl">
        <Carrusel />
      </header>
      <section className="flex flex-col justify-center items-center mb-4 -mt-10">
        <h1 className="text-2xl">Alguno de nuestros productos</h1>
        <ProductsCarrusel />
      </section>

      <section className="flex flex-col items-center justify-center -space-y-10">
        <h1 className="text-2xl">Sobre nosotros</h1>
        <AboutUs />
      </section>

      <section className="flex flex-col justify-center items-center mb-4 mt-10">
        <h1 className="text-2xl">Nuestras Categorias</h1>
        <ProductsCarrusel />
      </section>

      <footer>
        <Footer />
      </footer>
    </main>
  )
}
