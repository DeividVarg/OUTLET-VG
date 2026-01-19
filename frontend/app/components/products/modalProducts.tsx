import { useState, useEffect } from 'react'

const API_URL = import.meta.env.VITE_API_URL

export const ModalProducts = ({
  isOpen,
  onClose,
  product,
}: {
  isOpen: boolean
  onClose: () => void
  product?: any
}) => {
  const [current, setCurrent] = useState(0)

  const images = product ? product.images : []

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
            {images.map((imageObj, i) => (
              <img
                key={i}
                src={`${API_URL}${imageObj.url}`}
                alt={`img-${i}`}
                className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-700 rounded-2xl ${
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

        <main className="flex flex-col lg:w-1/2 lg:ml-2 justify-center">
          <div className="mt-4">
            <p className="text-gray-700 mb-2">
              {product
                ? product.description
                : 'el producto no posee descripción'}
            </p>
          </div>
          <div className="mt-4">
            <p className="text-center">Urls</p>
            <div className="flex flex-col">
              {product.urls?.map((url, index) => (
                <a
                  key={index}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline mb-1"
                >
                  {url}
                </a>
              ))}
            </div>
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
