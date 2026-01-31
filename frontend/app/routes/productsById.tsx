import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { fetchProductById } from '~/api/poducts'
import { WhatssapCard } from '~/components/whatssapCard'

const API_URL = import.meta.env.VITE_API_URL

interface product { 
  category_id: string,
  category_name: string,
  description: string,
  id: string,
  images: Array<{ id: string, url: string }>,
  state: string,
  price: number,
  urls: string[],
  name: string
}

export default function ProductoById() {
  const [current, setCurrent] = useState(0)
  const { id } = useParams()
  const [product, setProduct] = useState<product | null>(null)

  // FETCH PRODUCT
  useEffect(() => {
    const load = async () => {
      if (!id) return

      const data = await fetchProductById(id)
      setProduct(data)
    }

    load()
  }, [id])

  const images = product?.images ?? []

  // AUTOPLAY SLIDER
  useEffect(() => {
    if (images.length <= 1) return

    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length)
    }, 6000)

    return () => clearInterval(interval)
  }, [images.length])


  // LOADER
  if (!product) {
    return (
      <p className="flex justify-center items-center h-screen text-4xl">
        Cargando...
      </p>
    )
  }

  return (

     <div className="flex justify-center items-center w-full h-screen ">
  <div className="flex flex-col lg:flex-row w-full h-full">

    <div className="relative w-full h-full flex justify-center items-center rounded-2xl overflow-hidden">
      {images.map((img, i) => (
        <img
          key={img.id}
          src={`${API_URL}${img.url}`}
          alt={product.name}
          className={`absolute w-1/2 h-1/2 object-contain transition-opacity duration-1500 rounded-4xl ${
            i === current ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ))}
     
    </div>

    <div className="w-full p-6 flex flex-col justify-center">
      <h2 className="font-bold text-2xl mb-2">{product.name}</h2>
      <p className="text-gray-700 mb-4">{product.description || 'Sin descripción'}</p>


      <div className="flex flex-col">
  {product.urls?.flatMap(urlGroup => urlGroup.split(' ')).map((url, index) => (
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

  <div className='absolute w-12 h-12 bottom-12 right-12'>

    <WhatssapCard />
  </div>
</div>

    </div>
   
  </div>
</div>

  )
}
