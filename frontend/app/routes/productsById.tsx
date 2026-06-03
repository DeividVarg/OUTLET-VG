import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { fetchProductById } from "~/api/poducts";
import { useTheme } from "~/context/themeContext";
import { addToCart } from "~/api/cart";
import { useNavigate } from "react-router";
import { Footer } from "~/components/home/footer";

const API_URL = import.meta.env.VITE_API_URL;

interface product {
  category_id: string;
  category_name: string;
  description: string;
  id: string;
  images: Array<{ id: string; url: string }>;
  state: string;
  price: number;
  stock: number;
  subcategory_id: string;
  subcategory_name: string;
  name: string;
}

export default function ProductoById() {
  const { theme } = useTheme();
  const [current, setCurrent] = useState(0);
  const { id } = useParams();
  const [product, setProduct] = useState<product | null>(null);
  const navigate = useNavigate();

  // FETCH PRODUCT
  useEffect(() => {
    const load = async () => {
      if (!id) return;

      const data = await fetchProductById(id);
      setProduct(data);
    };

    load();
  }, [id]);

  const images = product?.images ?? [];

  // AUTOPLAY SLIDER
  useEffect(() => {
    if (images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [images.length]);

  // LOADER
  if (!product) {
    return (
      <p className="flex justify-center items-center h-screen text-4xl">
        Cargando...
      </p>
    );
  }

  return (
    <main
      className={`flex flex-col min-h-screen ${theme === "dark" ? "bg-bgSecondary text-white" : "bg-bgPrimary text-black"}`}
    >
      <div className="flex justify-center items-center w-full h-screen ">
        <div className="flex flex-col lg:flex-row w-full h-full">
          <div className="relative w-full h-full flex justify-center items-center rounded-2xl overflow-hidden">
            {images.map((img, i) => (
              <img
                key={img.id}
                src={`${API_URL}${img.url}`}
                alt={product.name}
                className={`absolute lg:w-1/2 lg:h-1/2 object-fill transition-opacity duration-1500 rounded-4xl ${
                  i === current ? "opacity-100" : "opacity-0"
                }`}
              />
            ))}
          </div>

          <div className="w-full h-full p-6 flex flex-col justify-center -mt-40 lg:mt-0">
            <div className="flex flex-col justify-around p-4 w-full h-full mt-4 lg:w-1/2 ">
              <div className="space-y-4">
                <h2 className="md:text-4xl text-2xl font-bold ">
                  {product.name}
                </h2>

                <p
                  className={`md:text-md text-sm
                    ${theme === "dark" ? "text-gray-300" : "text-gray-850"}`}
                >
                  {product.description || "Producto sin descripción"} Lorem
                  ipsum dolor sit amet consectetur adipisicing elit. Nam
                  blanditiis, quas, tempora praesentium deleniti iste
                  perspiciatis provident placeat vero illum veritatis alias eum
                  atque sint! Magni officiis debitis sed aperiam. Lorem ipsum
                  dolor sit amet consectetur adipisicing elit. Nam blanditiis,
                  quas, tempora praesentium deleniti iste perspiciatis provident
                  placeat vero illum veritatis alias eum atque sint! Magni
                  officiis debitis sed aperiam.
                </p>
              </div>

              <div className="space-x-2 items-center -mt-15">
                <button
                  onClick={() => {
                    navigate(`/products?category=${product.category_id}`);
                  }}
                  className={`px-4 py-1 md:text-md text-sm rounded-4xl transition-all duration-200 text-white ${theme === "dark" ? "bg-amber-800 hover:bg-amber-600" : "bg-red-900 hover:bg-red-950"}`}
                >
                  {product.category_name}
                </button>
                <button
                  onClick={() => {
                    navigate(`/products?subcategory=${product.subcategory_id}`);
                  }}
                  className={`px-4 py-1 md:text-md text-sm rounded-4xl transition-all duration-200 text-white ${theme === "dark" ? "bg-amber-800 hover:bg-amber-600" : "bg-red-900 hover:bg-red-950"}`}
                >
                  {product.subcategory_name}
                </button>
              </div>

              <div className="flex justify-center items-center -mt-15">
                <p className="font-semibold md:text-3xl text-xl ">
                  {product.price}
                </p>
              </div>

              <div className="flex flex-col space-y-4 -mt-15">
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
                  }}
                  className={`md:px-4 py-2  text-white rounded-2xl md:text-lg text-md hover:scale-105  transition-all duration-300 ${theme === "dark" ? "bg-primary hover:bg-primary/90" : "bg-secondary hover:bg-secondary/90"}`}
                >
                  Comprar ahora
                </button>

                <button
                  onClick={async () => {
                    alert("Producto agregado al carrito");
                    await addToCart(product.id, 1);
                  }}
                  className={`md:px-4 py-2  text-white rounded-2xl md:text-lg text-md hover:scale-105  transition-all duration-300 ${theme === "dark" ? "bg-primary hover:bg-primary/90" : "bg-secondary hover:bg-secondary/90"}`}
                >
                  Agregar al carrito
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
