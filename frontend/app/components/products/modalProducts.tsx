import { useEffect, useState } from "react";
import { WhatssapCard } from "~/components/whatssapCard";
import { useTheme } from "~/context/themeContext";
import { addToCart } from "~/api/cart";
import { useNavigate } from "react-router";
const API_URL = import.meta.env.VITE_API_URL;

export const ModalProducts = ({
  isOpen,
  onClose,
  product,
}: {
  isOpen: boolean;
  onClose: () => void;
  product: any;
}) => {
  const [current, setCurrent] = useState(0);
  const { theme } = useTheme();
  const navigate = useNavigate();

  const images = product?.images || [];

  useEffect(() => {
    if (!isOpen || images.length === 0) return;

    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [isOpen, images.length]);

  useEffect(() => {
    setCurrent(0);
  }, [product]);

  if (!isOpen || !product) return null;

  const handlePrev = () => {
    setCurrent((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleNext = () => {
    setCurrent((prev) => (prev + 1) % images.length);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center">
      {/* BACKDROP */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
        onClick={onClose}
      />

      {/* MODAL */}
      <div
        className={`relative rounded-2xl p-6 shadow-xl w-11/12 max-w-5xl h-[80vh] flex flex-col lg:flex-row z-50 ${theme === "dark" ? "bg-black " : "bg-bgPrimary"}`}
      >
        {/* SLIDER */}
        <div className="relative w-full lg:w-1/2 md:h-1/2 h-1/3 lg:h-full overflow-hidden rounded-xl">
          {images.map((img: any, i: number) => (
            <img
              key={i}
              src={`${API_URL}${img.url}`}
              className={`absolute inset-0 w-full h-full object-contain [image-rendering:smooth] transition-opacity duration-700 ${
                i === current ? "opacity-100" : "opacity-0"
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
        <div className="flex flex-col justify-around p-4 w-full md:h-1/2 lg:h-full lg:w-1/2 gap-y-2 lg:-mt-6">
          <div className="space-y-2">
            <h2 className="md:text-4xl text-xl font-bold ">{product.name}</h2>

            <p
              className={`lg:text-lg text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-850"}`}
            >
              {product.description || "Producto sin descripción"} Lorem ipsum
              dolor sit amet consectetur adipisicing elit. Nam blanditiis, quas,
              tempora praesentium deleniti iste perspiciatis provident placeat
              vero illum veritatis alias eum atque sint! Magni officiis debitis
              sed aperiam. Lorem ipsum dolor sit amet consectetur adipisicing
              elit. Nam blanditiis, quas, tempora praesentium deleniti iste
              perspiciatis provident placeat vero illum veritatis alias eum
              atque sint! Magni officiis debitis sed aperiam.
            </p>
          </div>

          <div className="space-x-2 items-center">
            <button
              onClick={() => {
                onClose();
                navigate(`/products?category=${product.category_id}`);
              }}
              className={`px-3 py-1 md:text-lg text-xs  rounded-4xl transition-all duration-200 text-white ${theme === "dark" ? "bg-amber-800 hover:bg-amber-600" : "bg-red-900 hover:bg-red-950"}`}
            >
              {product.category_name}
            </button>
            <button
              onClick={() => {
                onClose();
                navigate(`/products?subcategory=${product.subcategory_id}`);
              }}
              className={`px-3 py-1 md:text-lg text-xs   rounded-4xl transition-all duration-200 text-white ${theme === "dark" ? "bg-amber-800 hover:bg-amber-600" : "bg-red-900 hover:bg-red-950"}`}
            >
              {product.subcategory_name}
            </button>
          </div>

          <div className="flex justify-center items-center -mt-1 mb-1">
            <p className="font-semibold md:text-2xl text-xl ">
              {product.price}
            </p>
          </div>

          <div className="flex flex-col space-y-4">
            <button
              onClick={async () => {
                navigate("/purchase/direct", {
                  state: {
                    product_id: product.id,
                    name: product.name,
                    price: product.price,
                    stock: product.stock,
                    image: product.images?.[0]?.url ?? null,
                  },
                });
                await addToCart(product.id, 1);
              }}
              className={`px-4 py-2  text-white rounded-2xl md:text-lg text-sm hover:scale-105  transition-all duration-300 ${theme === "dark" ? "bg-primary hover:bg-primary/90" : "bg-secondary hover:bg-secondary/90"}`}
            >
              Comprar ahora
            </button>

            <button
              onClick={async () => {
                alert("Producto agregado al carrito");
                await addToCart(product.id, 1);
              }}
              className={`px-4 py-2  text-white rounded-2xl md:text-lg text-sm hover:scale-105  transition-all duration-300 ${theme === "dark" ? "bg-primary hover:bg-primary/90" : "bg-secondary hover:bg-secondary/90"}`}
            >
              Agregar al carrito
            </button>
          </div>

          <div className="flex justify-between items-center mt-4">
            <WhatssapCard />

            <button
              onClick={onClose}
              className="px-4 py-2 bg-secondary text-white rounded-lg "
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
