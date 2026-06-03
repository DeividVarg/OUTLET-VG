import { useMemo } from "react";

const useFilteredProducts = (products: Product[], filters: Filters) => {
  return useMemo(() => {
    return products.filter((p) => {
      if (filters.category && p.category_id !== filters.category) return false;
      if (filters.subcategory && p.subcategory_id !== filters.subcategory)
        return false;
      if (filters.minPrice && p.price < filters.minPrice) return false;
      if (filters.maxPrice && p.price > filters.maxPrice) return false;
      return true;
    });
  }, [products, filters]);
};
