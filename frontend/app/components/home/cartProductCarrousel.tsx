import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const API_URL = import.meta.env.VITE_API_URL

export const CardProduct = ({ producto }) => {
  const navigate = useNavigate()
  console.log(producto)
  return (
    <div
      className=" rounded-2xl space-y-2 shadow-lg shadow-indigo-500/50 p-2 cursor-pointer hover:scale-105 transition-transform duration-300"
      onClick={() => navigate(`/product/productDetail/${producto.id}`)}
    >
      <div className="flex flex-col justify-center items-center text-xl ">
        <p>{producto.name} </p>
        <img
          src={`${API_URL}${producto.images[0]?.url}`}
          alt="image"
          className="object-contain rounded-xl"
        />
      </div>
    </div>
  )
}
