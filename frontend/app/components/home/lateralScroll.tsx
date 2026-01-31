import { CardProduct } from "~/components/home/cartProductCarrousel"
import { fetchProducts } from '~/api/poducts'
import { fetchCategories } from '~/api/categories'
import { useEffect, useRef, useState } from 'react'
import { CardCategories } from '../categories/cardCategories'

type RenderType = 'products' | 'categories'

function useVisibleCards() {
  const getCards = () => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth < 768) return 1
      if (window.innerWidth < 1024) return 2
      return 4
    }
    return 4
  }

  const [visible, setVisible] = useState(getCards())

  useEffect(() => {
    const handleResize = () => {
      setVisible(getCards())
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return visible
}

const AUTOCHANGE_INTERVAL = 3500

const fetchApi = async (render: RenderType): Promise<any[]> => {
  try {
    if (render === 'products') {
      return await fetchProducts()
    }

    if (render === 'categories') {
      return await fetchCategories()
    }

    return []
  } catch (error) {
    console.error('Carousel fetch error:', error)
    return []
  }
}

export function Carousel({ render }: { render: RenderType }) {
  const [data, setData] = useState<any[]>([])
  const VISIBLES = useVisibleCards()
  const [pagina, setPagina] = useState(0)
  const timeoutRef = useRef<number | null>(null)

  const numPaginas = Math.max(1, Math.ceil(data.length / VISIBLES))

  // ✅ SOLO UN FETCH
  useEffect(() => {
    const load = async () => {
      const res = await fetchApi(render)
      setData(res)
    }

    load()
  }, [render])

  // reset page when responsive changes
  useEffect(() => {
    setPagina(0)
  }, [VISIBLES])

  // autoplay
  useEffect(() => {
    timeoutRef.current = window.setTimeout(() => {
      setPagina((prev) => (prev + 1) % numPaginas)
    }, AUTOCHANGE_INTERVAL)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [pagina, numPaginas])

  const tarjetasParaRenderizar = [
    ...data,
    ...Array(numPaginas * VISIBLES - data.length).fill(null),
  ]

  return (
    <div className="w-full h-full">
      <div className="overflow-x-hidden relative py-4">
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
                .map((item, idx) => (
                  <div key={idx} className=" flex justify-center">
                    {item &&
                      (render === 'products' ? (
                        <CardProduct producto={item} />
                      ) : (
                        <CardCategories categoryId={item.id} name={item.name} />
                      ))}
                  </div>
                ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
