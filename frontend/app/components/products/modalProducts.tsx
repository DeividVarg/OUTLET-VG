import { useEffect, useState } from 'react'
import { WhatssapCard } from '~/components/whatssapCard'

const API_URL = import.meta.env.VITE_API_URL

export const ModalProducts = ({
  isOpen,
  onClose,
  product,
}: {
  isOpen: boolean
  onClose: () => void
  product: any
}) => {
  const [current, setCurrent] = useState(0)

  const images = product?.images || []

  useEffect(() => {
    if (!isOpen || images.length === 0) return

    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length)
    }, 6000)

    return () => clearInterval(interval)
  }, [isOpen, images.length])

  useEffect(() => {
    setCurrent(0)
  }, [product])

  if (!isOpen || !product) return null

  const handlePrev = () => {
    setCurrent((prev) => (prev - 1 + images.length) % images.length)
  }

  const handleNext = () => {
    setCurrent((prev) => (prev + 1) % images.length)
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center">
      {/* BACKDROP */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* MODAL */}
      <div className="relative bg-white text-black rounded-2xl p-6 shadow-xl w-11/12 max-w-5xl h-[80vh] flex flex-col lg:flex-row z-50">
        {/* SLIDER */}
        <div className="relative w-full lg:w-1/2 h-64 lg:h-full overflow-hidden rounded-xl">
          {images.map((img: any, i: number) => (
            <img
              key={i}
              src={`${API_URL}${img.url}`}
              className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-700 ${
                i === current ? 'opacity-100' : 'opacity-0'
              }`}
            />
          ))}

          {images.length > 1 && (
            <>
              <button
                onClick={handlePrev}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white px-3 py-1 rounded-lg"
              >
                ‹
              </button>

              <button
                onClick={handleNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white px-3 py-1 rounded-lg"
              >
                ›
              </button>
            </>
          )}
        </div>

        {/* INFO */}
        <div className="flex flex-col justify-between p-4 w-full lg:w-1/2">
          <div>
            <h2 className="text-2xl font-bold mb-2">{product.name}</h2>

            <p className="text-gray-700 mb-4">
              {product.description || 'Producto sin descripción'}
            </p>

            <div>
              <p className="font-semibold mb-1">Urls</p>

              {product.urls?.map((url: string, i: number) => (
                <a
                  key={i}
                  href={url}
                  target="_blank"
                  className="block text-blue-600 underline"
                >
                  {url}
                </a>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center mt-4">
            <WhatssapCard />

            <button
              onClick={onClose}
              className="px-4 py-2 bg-red-500 text-white rounded-lg"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
