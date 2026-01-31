import { Carrusel } from '~/components/home/carrusel'
import { AboutUs } from '~/components/home/aboutUs'
import { ProductsCarrusel } from '~/components/home/productsCarrusel'
import { CategoryCarrusel } from '~/components/home/categoryCarrusel'
import { Footer } from '~/components/home/footer'
import { useTheme } from '~/context/themeContext'
import { RevealOnScroll } from '~/components/home/entraceAnimation'

export default function Home() {
  const { theme } = useTheme()

  return (
    <main
      className={
        theme === 'dark' ? 'bg-black text-white ' : 'bg-white text-black'
      }
    >
      <header className="h-screen flex items-center justify-center shadow-2xl">
        <Carrusel />
      </header>

      <article className="overflow-x-hidden">
        <section className="flex flex-col justify-center items-center mt-20 w-full px-4">
          <RevealOnScroll animation="animate-slide-up-fade animate-duration-700 ">
            <h1 className="text-3xl font-bold mb-8 text-center">
              Alguno de nuestros productos
            </h1>
            <ProductsCarrusel />
          </RevealOnScroll>
        </section>

        <section className="flex flex-col items-center justify-center mt-20 px-4">
          <RevealOnScroll animation="animate-slide-up-fade animate-duration-700">
            <h1 className="text-3xl font-bold mb-6 text-center">
              Sobre nosotros
            </h1>
            <div className="max-w-6xl">
              <AboutUs />
            </div>
          </RevealOnScroll>
        </section>

        <section className="flex flex-col justify-center items-center mt-32 mb-20 px-4">
          <RevealOnScroll animation="animate-slide-up-fade animate-duration-700">
            <h1 className="text-3xl font-bold mb-8 text-center">
              Nuestras Categorías
            </h1>
            <CategoryCarrusel />
          </RevealOnScroll>
        </section>
      </article>

      <footer>
        <Footer />
      </footer>
    </main>
  )
}
