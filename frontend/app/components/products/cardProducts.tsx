import { useTheme } from "~/context/themeContext";

const API_URL = import.meta.env.VITE_API_URL;

export const CardProducts = ({
  product,
  onOpen,
}: {
  product: any;
  onOpen: (product: any) => void;
}) => {
  const { theme } = useTheme();

  return (
    <div className="relative w-60 animate-blink" id={product.id}>
      <div
        className={`
          relative overflow-hidden
    hover:scale-105 
    transition-all duration-500 
    cursor-pointer flex flex-col 
    p-2 rounded-4xl
          shadow-lg  ${theme === "dark" ? "shadow-primary/30" : "shadow-secondary/50"}`}
        onClick={() => onOpen(product)}
      >
        <header className="h-48">
          <img
            className="w-full h-full object-contain [image-rendering:smooth] rounded-2xl"
            src={`${API_URL}${product.images[0]?.url}`}
            alt="product"
          />
        </header>

        <main className="my-1 flex flex-col justify-center items-center">
          <h2 className="text-2xl font-bold">{product.name}</h2>
          {product.state === "not available" && (
            <div className="absolute top-4 -right-12 rotate-45 bg-red-500 text-white text-xs font-bold py-1 mt-1 w-40 text-center shadow-lg z-20">
              no disponible
            </div>
          )}
          <div
            className={`border-b-2 w-11/12 my-1 ${theme === "dark" ? "border-primary" : "border-secondary"}`}
          />
          <p className="text-2xl text-center font-semibold">
            <span className="text-lg">$</span>
            {product.price}
          </p>
        </main>
      </div>
    </div>
  );
};
