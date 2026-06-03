import { CardProduct } from "~/components/home/cartProductCarrousel";
import { fetchProducts } from "~/api/poducts";
import { fetchCategories } from "~/api/categories";
import { useEffect, useRef, useState } from "react";
import { CardCategories } from "../categories/cardCategories";

type RenderType = "products" | "categories";

function useVisibleCards() {
  const getCards = () => {
    if (typeof window !== "undefined") {
      if (window.innerWidth < 768) return 1;
      if (window.innerWidth < 1023) return 2;
      if (window.innerWidth < 1280) return 3;
      if (window.innerWidth > 1920) return 5;
      return 4;
    }
    return 4;
  };

  const [visible, setVisible] = useState(getCards());

  useEffect(() => {
    const handleResize = () => {
      setVisible(getCards());
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return visible;
}

const AUTOCHANGE_INTERVAL = 3500;

const fetchApi = async (render: RenderType): Promise<any[]> => {
  try {
    if (render === "products") {
      return await fetchProducts();
    }

    if (render === "categories") {
      return await fetchCategories();
    }

    return [];
  } catch (error) {
    console.error("Carousel fetch error:", error);
    return [];
  }
};

export function Carousel({ render }: { render: RenderType }) {
  const [data, setData] = useState<any[]>([]);
  const VISIBLES = useVisibleCards();
  const [pagina, setPagina] = useState(0);
  const timeoutRef = useRef<number | null>(null);

  const numPaginas = Math.max(1, Math.ceil(data.length / VISIBLES));

  useEffect(() => {
    const load = async () => {
      const res = await fetchApi(render);
      setData(res);
    };
    load();
  }, [render]);

  useEffect(() => {
    setPagina(0);
  }, [VISIBLES]);

  useEffect(() => {
    timeoutRef.current = window.setTimeout(() => {
      setPagina((prev) => (prev + 1) % numPaginas);
    }, AUTOCHANGE_INTERVAL);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [pagina, numPaginas]);

  const tarjetasParaRenderizar = [
    ...data,
    ...Array(numPaginas * VISIBLES - data.length).fill(null),
  ];

  return (
    // 1. Agregamos max-width y mx-auto para que no se estire infinito en pantallas gigantes
    <div className="w-full max-w-7xl mx-auto px-4 md:px-8">
      {/* 2. Overflow hidden para el contenedor del slider */}
      <div className="overflow-hidden relative py-8">
        <div
          className="flex transition-transform duration-700 ease-in-out"
          style={{
            width: `${numPaginas * 100}%`,
            transform: `translateX(-${pagina * (100 / numPaginas)}%)`,
          }}
        >
          {Array.from({ length: numPaginas }).map((_, pageIdx) => (
            <div
              key={pageIdx}
              className="grid w-full"
              style={{
                gridTemplateColumns: `repeat(${VISIBLES}, minmax(0, 1fr))`,
                columnGap: "2rem",
                // 4. Padding horizontal para que las tarjetas no toquen los bordes del slider
                paddingLeft: "1rem",
                paddingRight: "1rem",
              }}
            >
              {tarjetasParaRenderizar
                .slice(pageIdx * VISIBLES, pageIdx * VISIBLES + VISIBLES)
                .map((item, idx) => (
                  <div key={idx} className="flex justify-center h-full py-2">
                    {item &&
                      (render === "products" ? (
                        <CardProduct producto={item} />
                      ) : (
                        <CardCategories categoryId={item.id} name={item.name} />
                      ))}
                  </div>
                ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
