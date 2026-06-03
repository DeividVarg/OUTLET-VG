import { useEffect, useState } from "react";

export const Carrusel = () => {
  const [current, setCurrent] = useState(0);
  const [fade, setFade] = useState(true);

  const images = [
    "/carrusel/outlet vg.jpg",
    "/carrusel/364862007294838973.jpg",
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      setFade(false);
      setTimeout(() => {
        setCurrent((prev) => (prev === images.length - 1 ? 0 : prev + 1));
        setFade(true);
      }, 200);
    }, 10000);
    return () => clearTimeout(timer);
  }, [current]);

  return (
    <div className="h-full w-full absolute top-0 animate-fade-in animate-duration-500">
      <img
        src={images[current]}
        alt={`img-${current}`}
        className={`object-cover h-full w-full transition-opacity duration-500  ${
          fade ? "opacity-100" : "opacity-0"
        }`}
        draggable={false}
      />
    </div>
  );
};
