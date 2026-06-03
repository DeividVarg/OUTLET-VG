import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "~/context/themeContext";

const API_URL = import.meta.env.VITE_API_URL;

export const CardProduct = ({ producto }) => {
  const navigate = useNavigate();
  const { theme } = useTheme();

  return (
    <div
      className={`rounded-2xl space-y-4 shadow-lg p-4 cursor-pointer hover:scale-105 transition-transform duration-300 ${theme === "dark" ? "shadow-primary/30" : "shadow-secondary/40"}`}
      onClick={() => navigate(`/product/productDetail/${producto.id}`)}
    >
      <div className="flex flex-col justify-center items-center text-xl mb-4">
        <p>{producto.name} </p>
        <img
          src={`${API_URL}${producto.images[0]?.url}`}
          alt="image"
          className="h-72 w-64 object-contain [image-rendering:smooth] rounded-xl"
        />
      </div>
    </div>
  );
};
