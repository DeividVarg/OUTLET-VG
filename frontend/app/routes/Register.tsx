import { RegisterCard } from "~/components/users/registerCard";
import { useTheme } from "~/context/themeContext";

export default function Register() {
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
        <RegisterCard />
      </div>
    </main>
  );
}
