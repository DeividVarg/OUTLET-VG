import { useEffect, useState } from 'react';

export const Carrusel = () => {
  const [current, setCurrent] = useState(0);
  const [fade, setFade] = useState(true)

  const images = [
    "/carrusel/images.webp",
    "/carrusel/descarga.jpg",
  ]

  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     setFade(false)
  //     setTimeout(() => {
  //       setCurrent((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  //       setFade(true)
  //     }, 200)
  //   }, 5000)
  //   return () => clearTimeout(timer)
  // }, [current])

  return (
    <div className="h-full w-full absolute top-0">

      <img
        src={images[current]}
        alt={`img-${current}`}
        className={`object-cover h-full w-full transition-opacity duration-500  ${
          fade ? 'opacity-100' : 'opacity-0'
        }`}
        draggable={false}
      />
    </div>
  )
}
