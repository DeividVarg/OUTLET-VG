import { CardProducts } from "~/components/products/cardProducts";
import { useTheme } from "~/context/themeContext";
import { Footer } from "~/components/home/footer";
import { fetchProductsByCategory } from "~/api/poducts";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ModalProducts } from "~/components/products/modalProducts";

export default function Productos() {
  const { theme } = useTheme();
  const { id } = useParams();
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = (product: any) => {
    setSelectedProduct(product);
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    setSelectedProduct(null);
  };

  const loadProducts = async () => {
    if (!id) return;

    const data = await fetchProductsByCategory(id);
    console.log(data);
    setProducts(data);
  };

  useEffect(() => {
    console.log("Category ID changed:", id);
    loadProducts();
  }, []);

  return (
    <main
      className={
        theme === "dark"
          ? "bg-bgSecondary text-white min-h-screen"
          : "bg-bgPrimary text-black min-h-screen"
      }
    >
      <section className="grid lg:grid-cols-5 md:grid-cols-3 gap-y-4 pt-18 pb-10 justify-center items-center">
        {products.map((product: any) => (
          <CardProducts
            key={product.id}
            product={product}
            onOpen={handleOpen}
          />
        ))}

        <ModalProducts
          isOpen={isOpen}
          onClose={handleClose}
          product={selectedProduct}
        />
      </section>

      <footer>
        <Footer />
      </footer>
    </main>
  );
}
