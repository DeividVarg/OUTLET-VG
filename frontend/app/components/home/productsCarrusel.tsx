import { Carousel } from '~/components/home/lateralScroll'

export const ProductsCarrusel = () => {
  return (
    <section className="w-full h-full">
      <Carousel render="products" />
    </section>
  )
}