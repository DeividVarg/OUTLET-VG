import { NavLink } from "react-router";
import { useTheme } from "~/context/themeContext";

export const NavLinkComponent = ({ to, children }) => {
  const { theme } = useTheme();

  return (
    <NavLink
      to={to}
      className={`transition-all duration-100 hover:scale-110 hover:font-semibold p-2  rounded-2xl hover:rotate-x-25 md:text-md text-sm ${theme === "dark" ? "text-white" : "text-black"}`}
    >
      {children}
    </NavLink>
  );
};
