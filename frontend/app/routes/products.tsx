import { CardProducts } from "~/components/products/cardProducts";
import { useTheme } from "~/context/themeContext";
import { Footer } from "~/components/home/footer";
import { fetchProductsAvailable } from "~/api/poducts";
import { fetchCategories } from "~/api/categories";
import { fetchSubCategories } from "~/api/subCategories";
import { useEffect, useState, useMemo, useRef } from "react";
import { ModalProducts } from "~/components/products/modalProducts";
import { ModalProductsAdmin } from "~/components/admin/modalProducts";
import { useLocation } from "react-router";
import { MdFilterList, MdClose } from "react-icons/md";

import { useSearchParams } from "react-router";

type Product = {
  id: string;
  name: string;
  category_id: string;
  subcategory_id: string;
  price: number;
  state: string;
  description: string;
  stock: number;
  images: Array<{ id: number; url: string }>;
};

type Category = { id: string; name: string };
type SubCategory = { id: string; name: string; category_id: string };

type Filters = {
  category: string;
  subcategory: string;
  minPrice: string;
  maxPrice: string;
};

export default function Productos() {
  const { theme } = useTheme();
  const location = useLocation();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    category: "",
    subcategory: "",
    minPrice: "",
    maxPrice: "",
  });

  const [searchParams] = useSearchParams();

  useEffect(() => {
    const categoryParam = searchParams.get("category");
    const subcategoryParam = searchParams.get("subcategory");

    if (categoryParam) {
      setFilters((prev) => ({ ...prev, category: categoryParam }));
    }

    if (subcategoryParam) {
      setFilters((prev) => ({ ...prev, subcategory: subcategoryParam }));
    }

    const loadData = async () => {
      const [prods, cats, subs] = await Promise.all([
        fetchProductsAvailable(),
        fetchCategories(),
        fetchSubCategories(),
      ]);
      setProducts(prods || []);
      setCategories(cats || []);
      setSubCategories(subs || []);

      console.log("Productos cargados:", prods);
    };
    loadData();
  }, [searchParams]);

  // Subcategorías filtradas según categoría seleccionada
  const filteredSubCategories = useMemo(() => {
    if (!filters.category) return subCategories;
    return subCategories.filter(
      (s: any) =>
        s.category_id === filters.category ||
        s.id_category === filters.category,
    );
  }, [subCategories, filters.category]);

  // Productos filtrados en cliente
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (filters.category && p.category_id !== filters.category) return false;
      if (filters.subcategory && p.subcategory_id !== filters.subcategory)
        return false;
      if (filters.minPrice && Number(p.price) < Number(filters.minPrice))
        return false;
      if (filters.maxPrice && Number(p.price) > Number(filters.maxPrice))
        return false;
      return true;
    });
  }, [products, filters]);

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    // Al cambiar categoría resetear subcategoría
    if (name === "category") {
      setFilters((prev) => ({ ...prev, category: value, subcategory: "" }));
      return;
    }
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleClearFilters = () => {
    setFilters({ category: "", subcategory: "", minPrice: "", maxPrice: "" });
  };

  const activeFiltersCount = Object.values(filters).filter(
    (v) => v !== "",
  ).length;

  const handleOpen = (product: Product) => {
    setSelectedProduct(product);
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    setSelectedProduct(null);
  };

  const footerRef = useRef<HTMLDivElement>(null);
  const [bottomOffset, setBottomOffset] = useState(24);

  // 2. Observa el footer
  useEffect(() => {
    const footer = footerRef.current;
    if (!footer) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setBottomOffset(entry.isIntersecting ? footer.offsetHeight + 24 : 24);
      },
      { threshold: 0 },
    );
    observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  return (
    <main
      className={`flex flex-col min-h-screen ${
        theme === "dark"
          ? "bg-bgSecondary text-white"
          : "bg-bgPrimary text-black"
      }`}
    >
      {/* Overlay */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* Drawer lateral */}
      <div
        className={`fixed top-0 right-0 h-full z-50 w-80 shadow-2xl flex flex-col transition-transform duration-300 ${drawerOpen ? "translate-x-0" : "translate-x-full"} ${theme === "dark" ? "bg-black text-white" : "bg-white text-black"}`}
      >
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="text-lg font-semibold">Filtros</h2>
          <button
            onClick={() => setDrawerOpen(false)}
            className="text-2xl hover:scale-110 transition-all"
          >
            <MdClose />
          </button>
        </div>

        <div className="flex flex-col gap-5 p-5 overflow-y-auto flex-grow">
          {/* Categoría */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Categoría</label>
            <select
              name="category"
              value={filters.category}
              onChange={handleFilterChange}
              className={`border rounded-lg p-2 outline-none ${theme === "dark" ? "bg-black border-secondary text-white" : "bg-white border-primary"}`}
            >
              <option value="" className="">
                Todas las categorías
              </option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Subcategoría */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Subcategoría</label>
            <select
              name="subcategory"
              value={filters.subcategory}
              onChange={handleFilterChange}
              disabled={!filters.category}
              className={`border rounded-lg p-2 outline-none disabled:opacity-50 ${theme === "dark" ? "bg-black border-secondary text-white" : "bg-white border-primary text-black"}`}
            >
              <option value="">Todas las subcategorías</option>
              {filteredSubCategories.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Precio */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Rango de precio</label>
            <div className="flex gap-2 items-center">
              <input
                name="minPrice"
                type="number"
                min="0"
                placeholder="Mín"
                value={filters.minPrice}
                onChange={handleFilterChange}
                className={`border rounded-lg p-2 w-full outline-none ${theme === "dark" ? "bg-black border-secondary text-white" : "bg-white border-primary text-black"}`}
              />
              <span className="text-gray-400">—</span>
              <input
                name="maxPrice"
                type="number"
                min="0"
                placeholder="Máx"
                value={filters.maxPrice}
                onChange={handleFilterChange}
                className={`border rounded-lg p-2 w-full outline-none ${theme === "dark" ? "bg-black border-secondary text-white" : "bg-white border-primary text-black"}`}
              />
            </div>
          </div>
        </div>

        {/* Footer del drawer */}
        <div className="p-5 border-t flex flex-col gap-2">
          <p className="text-sm text-gray-400 text-center">
            {filteredProducts.length} producto
            {filteredProducts.length !== 1 ? "s" : ""} encontrado
            {filteredProducts.length !== 1 ? "s" : ""}
          </p>
          <button
            onClick={handleClearFilters}
            disabled={activeFiltersCount === 0}
            className="w-full py-2 rounded-lg border hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Limpiar filtros
          </button>
          <button
            onClick={() => setDrawerOpen(false)}
            className="w-full py-2 rounded-lg bg-tertiary text-white hover:bg-blue-700 transition-colors font-semibold"
          >
            Ver resultados
          </button>
        </div>
      </div>

      {/* Grid de productos */}
      <section className="flex-1 grid lg:grid-cols-5 md:grid-cols-3 grid-cols-1 gap-6 pt-20 pb-10 px-6 max-w-[1600px] w-full mx-auto place-items-center md:place-items-start">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <CardProducts
              key={product.id}
              product={product}
              onOpen={handleOpen}
            />
          ))
        ) : (
          <div className="col-span-5 flex items-center justify-center h-64">
            <p className="text-gray-400 text-lg">
              No se encontraron productos con los filtros seleccionados.
            </p>
          </div>
        )}
      </section>

      <div className="sticky bottom-6 flex justify-end pb-2 mr-2 z-30 pointer-events-none">
        <button
          onClick={() => setDrawerOpen(true)}
          className="pointer-events-auto flex items-center gap-2 px-4 py-3 bg-tertiary text-white rounded-full shadow-lg hover:scale-105 transition-all"
        >
          <MdFilterList className="text-xl" />
          Filtros
          {activeFiltersCount > 0 && (
            <span className="bg-white text-tertiary text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
        </button>
      </div>

      {location.pathname === "/admin" ? (
        <ModalProductsAdmin
          isOpen={isOpen}
          onClose={handleClose}
          product={selectedProduct || undefined}
        />
      ) : (
        <ModalProducts
          isOpen={isOpen}
          onClose={handleClose}
          product={selectedProduct}
        />
      )}

      <div ref={footerRef}>
        <Footer />
      </div>
    </main>
  );
}
