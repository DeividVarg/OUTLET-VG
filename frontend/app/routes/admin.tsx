import { AdminCategories } from "~/components/admin/categories";
import { AdminProducts } from "~/components/admin/products";
import { AdminSubCategories } from "~/components/admin/subCategories";
import { AdminPurchases } from "~/components/admin/purchases";
import { AdminUsers } from "~/components/admin/users";
import { useState } from "react";
import { useTheme } from "~/context/themeContext";

export default function AdminView() {
  // ← mayúscula
  const [activeView, setActiveView] = useState("");
  const { theme } = useTheme();

  const renderActiveView = () => {
    switch (activeView) {
      case "products":
        return <AdminProducts />;
      case "users":
        return <AdminUsers />;
      case "categories":
        return <AdminCategories />;
      case "subCategories":
        return <AdminSubCategories />;
      case "purchases":
        return <AdminPurchases />;
      default:
        return null;
    }
  };

  return (
    <div
      className={`min-h-screen flex justify-center ${
        theme === "dark"
          ? "bg-bgSecondary text-white"
          : "bg-bgPrimary text-black"
      }`}
    >
      {/* Sidebar */}
      <div
        className={`flex lg:flex-col justify-center lg:items-start md:gap-4 gap-3 fixed lg:left-8 lg:top-1/3 border-y md:p-4 p-2 rounded-lg shadow-lg mt-20 z-50 ${
          theme === "dark" ? "bg-black lg:bg-bgSecondary" : "bg-bgPrimary"
        }`}
      >
        <button
          className="md:text-xl hover:scale-110 transition-all duration-300"
          onClick={() => setActiveView("products")}
        >
          products
        </button>
        <button
          className="md:text-xl hover:scale-110 transition-all duration-300"
          onClick={() => setActiveView("users")}
        >
          users
        </button>
        <button
          className="md:text-xl hover:scale-110 transition-all duration-300"
          onClick={() => setActiveView("categories")}
        >
          categories
        </button>
        <button
          className="md:text-xl hover:scale-110 transition-all duration-300"
          onClick={() => setActiveView("subCategories")}
        >
          SubCategories
        </button>
        <button
          className="md:text-xl hover:scale-110 transition-all duration-300"
          onClick={() => setActiveView("purchases")}
        >
          Purchases
        </button>
      </div>

      {/* Contenido — margen suficiente para no quedar bajo el sidebar */}
      <div className="w-full lg:pl-48 pt-5 flex justify-center">
        {renderActiveView()}
      </div>
    </div>
  );
}
