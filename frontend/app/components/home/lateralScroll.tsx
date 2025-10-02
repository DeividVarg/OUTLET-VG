import { CardProduct } from "~/components/home/cartProductCarrousel"

import { useEffect, useRef, useState } from 'react'

const productos = [
  'Producto 1',
  'Producto 2',
  'Producto 3',
  'Producto 4',
  'Producto 5',
  'Producto 6',
  'Producto 7',
  'Producto 8',
  'Producto 9',
  'Producto 10',
]

function useVisibleCards() {
  const getCards = () => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth < 768) return 1 // sm: 1 tarjeta
      if (window.innerWidth < 1024) return 2 // md: 2 tarjetas
      return 4 // lg+: 4 tarjetas
    }
    return 4
  }
  const [visible, setVisible] = useState(getCards())
  useEffect(() => {
    function handleResize() {
      setVisible(getCards())
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  return visible
}

const AUTOCHANGE_INTERVAL = 3500

export function Carousel() {
  const VISIBLES = useVisibleCards()
  const [pagina, setPagina] = useState(0)
  const numPaginas = Math.ceil(productos.length / VISIBLES)
  const timeoutRef = useRef<any>()

  useEffect(() => {
    setPagina(0)
  }, [VISIBLES])

  useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      setPagina((prev) => (prev + 1) % numPaginas)
    }, AUTOCHANGE_INTERVAL)
    return () => clearTimeout(timeoutRef.current)
  }, [pagina, numPaginas])

  const tarjetasParaRenderizar = [
    ...productos,
    ...Array(numPaginas * VISIBLES - productos.length).fill(null),
  ]

  return (
    <div className="w-full max-w-7xl mx-auto py-8 select-none">
      <div className="overflow-hidden w-full">
        <div
          className="flex transition-transform duration-700 ease-in-out"
          style={{
            width: `${numPaginas * 100}%`,
            transform: `translateX(-${pagina * (100 / numPaginas)}%)`,
          }}
        >
          {Array.from({ length: numPaginas }).map((_, pageIdx) => (
            <div
              key={pageIdx}
              className="grid w-full justify-center"
              style={{
                gridTemplateColumns: `repeat(${VISIBLES}, minmax(0, 1fr))`,
              }}
            >
              {tarjetasParaRenderizar
                .slice(pageIdx * VISIBLES, pageIdx * VISIBLES + VISIBLES)
                .map((producto, idx) => (
                  <div key={idx} className="px-2 flex justify-center">
                    {producto && <CardProduct producto={producto} />}
                  </div>
                ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
