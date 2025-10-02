import { useState, useEffect } from 'react'

export const ModalProducts = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
}) => {
  const [current, setCurrent] = useState(0)

  const images = ['/carrusel/images.webp', '/carrusel/descarga.jpg']

  useEffect(() => {
    if (!isOpen) return
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [isOpen, images.length])

  const handlePrev = () => {
    setCurrent((prev) => (prev - 1 + images.length) % images.length)
  }

  const handleNext = () => {
    setCurrent((prev) => (prev + 1) % images.length)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-40 flex justify-center items-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-3xl"></div>

      <div className="relative rounded-2xl p-6 shadow-xl bg-white text-black z-50 w-10/12 h-8/12 mx-4 lg:flex justify-center items-center">
        <header className="lg:w-10/12 lg:h-80 w-full h-1/2 flex justify-center items-center">
          <div className="relative w-full h-full rounded-2xl overflow-hidden">
            {images.map((img, i) => (
              <img
                key={i}
                src={img}
                alt={`img-${i}`}
                className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-700 ${
                  i === current ? 'opacity-100' : 'opacity-0'
                }`}
              />
            ))}

            <button
              className="absolute top-1/2 left-2 -translate-y-1/2 bg-black/50 text-white px-2 py-1 rounded-lg"
              onClick={handlePrev}
            >
              ‹
            </button>
            <button
              className="absolute top-1/2 right-2 -translate-y-1/2 bg-black/50 text-white px-2 py-1 rounded-lg"
              onClick={handleNext}
            >
              ›
            </button>
          </div>
        </header>

        <main className="flex lg:w-1/2 lg:ml-2 justify-center">
          <div className="mt-4">
            <p className="text-gray-700 mb-2">
              This is a description of the product.
            </p>
            <button className="px-4 py-2 bg-blue-500 text-white rounded-lg">
              Comprar
            </button>
          </div>
        </main>

        <button
          className="mt-6 px-4 py-2 bg-red-500 text-white rounded-lg absolute bottom-3 left-2"
          onClick={onClose}
        >
          Cerrar
        </button>
      </div>
    </div>
  )
}
