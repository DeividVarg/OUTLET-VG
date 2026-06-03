import { LoginCard } from "~/components/users/loginCard";
import { useTheme } from "~/context/themeContext";

export default function login() {
  const { theme } = useTheme();

  return (
    <main
      className={
        theme === "dark"
          ? "bg-bgSecondary text-white min-h-screen"
          : "bg-bgPrimary text-black min-h-screen"
      }
    >
      <div className="h-screen flex justify-center items-center ">
        <LoginCard />
      </div>
    </main>
  );
}
