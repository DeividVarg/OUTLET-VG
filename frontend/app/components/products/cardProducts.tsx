const API_URL = import.meta.env.VITE_API_URL

export const CardProducts = ({
  product,
  onOpen,
}: {
  product: any
  onOpen: (product: any) => void
}) => {
  return (
    <div className="relative w-60 animate-blink" id={product.id}>
      <div
        className="
          hover:ring hover:ring-amber-50 
          hover:scale-105 
          transition-all duration-500 
          cursor-pointer flex flex-col 
          p-2 rounded-4xl
          shadow-sm shadow-indigo-500/30"
        onClick={() => onOpen(product)}
      >
        <header className="h-48">
          <img
            className="w-full h-full object-fill rounded-2xl"
            src={`${API_URL}${product.images[0]?.url}`}
            alt="product"
          />
        </header>

        <main className="my-1 flex flex-col justify-center items-center">
          <h2 className="text-2xl font-bold">{product.name}</h2>
          <div className="border-b-2 border-gray-500 w-11/12 my-1" />
          <p className="text-2xl text-white text-center font-semibold">
            <span className="text-lg">$</span>
            {product.price}
          </p>
        </main>
      </div>
    </div>
  )
}
