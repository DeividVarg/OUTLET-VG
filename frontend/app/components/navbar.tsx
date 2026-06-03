import { NavLinkComponent } from "~/components/navlink";
import { useTheme } from "~/context/themeContext";
import { HiOutlineSun } from "react-icons/hi";
import { HiSun } from "react-icons/hi";
import { useNavigate } from "react-router";
import { useAuth } from "~/hooks/auth";
import { HiUser } from "react-icons/hi2";
import { useState, useRef, useEffect } from "react";
import { logoutAction } from "~/api/users";
import { HiShoppingCart } from "react-icons/hi";

export const Navbar = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  const [view, OpenView] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        OpenView(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  let clicks = 4;
  const onMultipleClick = () => {
    clicks = clicks - 1;

    if (clicks === 0) {
      navigate("/admin");
      clicks = 4;
    }
  };

  return (
    <div
      className={`flex transition-all backdrop-blur-md justify-center items-center w-fit mx-auto rounded-xl px-1.5 mt-2 h-14 shadow-lg ${
        theme === "dark" ? "bg-black/70" : "bg-white/50"
      } `}
    >
      <button className="mt-2 " onClick={onMultipleClick}>
        <img
          src="/logo sin letras.svg"
          alt="Logo"
          className="w-[70px] h-[70px]"
        />
      </button>

      <nav className="flex gap-x-3 mr-2 z-30 justify-center items-center">
        <NavLinkComponent to="/">Home</NavLinkComponent>

        <NavLinkComponent to="/categories">Categorias</NavLinkComponent>

        <NavLinkComponent to="/products">Productos</NavLinkComponent>

        {user ? (
          <button
            onClick={() => OpenView((prev) => !prev)}
            className={`transition-all duration-100 hover:scale-110 rounded-2xl hover:rotate-x-25 ${theme === "dark" ? "text-white" : "text-black"}`}
          >
            <HiUser size={25} />
          </button>
        ) : (
          <NavLinkComponent to="/login">Login</NavLinkComponent>
        )}

        <NavLinkComponent to="/cart">
          <button className="mt-1 size-6 md:size-8">
            <HiShoppingCart size={25} />
          </button>
        </NavLinkComponent>

        <div className="flex justify-center items-center relative">
          <button
            onClick={toggleTheme}
            className="w-6 items-center justify-center hover:scale-110 "
            type="button"
          >
            <HiOutlineSun
              className={`absolute inset-0 m-auto size-6 transition-opacity duration-400
          ${theme === "dark" ? "opacity-100" : "opacity-0"}
        `}
            />
            <HiSun
              className={`absolute inset-0 m-auto size-6 transition-opacity duration-400
          ${theme !== "dark" ? "opacity-100 text-black" : "opacity-0"}
        `}
            />
          </button>
        </div>

        <div className="z-10">
          {view ? (
            <div
              ref={menuRef}
              className={`absolute top-14.5 -right-12 w-48 flex flex-col justify-center items-start  rounded-lg shadow-lg p-4 z-0 ${theme === "dark" ? "bg-black/70" : "bg-white/50 text-black"}`}
            >
              <button
                onClick={() => {
                  logoutAction();
                  window.location.reload();
                  OpenView(false);
                }}
                className="hover:scale-110 transition-all duration-300"
              >
                logout
              </button>

              <NavLinkComponent to={"purchase/mypurchases"}>
                <button className="hover:scale-105 transition-all duration-300 -ml-2 text-md">
                  Mis compras
                </button>
              </NavLinkComponent>
            </div>
          ) : null}
        </div>
      </nav>
    </div>
  );
};
