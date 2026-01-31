import { useEffect, useRef, useState } from 'react';

export function RevealOnScroll({ children, animation = "" }) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Opcional: dejar de observar una vez que se anima
          observer.unobserve(ref.current);
        }
      },
      { threshold: 0.1 } // Se activa cuando el 10% del elemento es visible
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={isVisible ? animation : "opacity-0"}>
      {children}
    </div>
  );
}