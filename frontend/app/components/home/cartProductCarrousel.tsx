
export const CardProduct = ({producto}) => {
  return (
    <div className="p-2 border-1 rounded-lg border-[#fd8100] ">
      <div className="flex flex-col space-y-2 justify-center items-center">
        <p>{producto} </p>
        <img
          src="/carrusel/images.webp"
          alt="image"
          className="object-contain"
        />
        <button className="border-1 py-1 px-8 rounded-xl transition-all border-[#fd8100] hover:bg-[#fd8100]/50 hover:scale-110">
          Comprar
        </button>
      </div>
    </div>
  )
}