"use client";

import { useEffect, useState } from "react";

export function useScrollDirection() {
  const [direction, setDirection] = useState<"up" | "down">("up");
  const [isTop, setIsTop] = useState(true);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const updateDirection = () => {
      const scrollY = window.scrollY;
      const newDirection = scrollY > lastScrollY ? "down" : "up";

      // On ignore les micro-défilements (moins de 10px)
      if (newDirection !== direction && Math.abs(scrollY - lastScrollY) > 10) {
        setDirection(newDirection);
      }
      setIsTop(scrollY <= 10);
      lastScrollY = scrollY > 0 ? scrollY : 0;
    };

    window.addEventListener("scroll", updateDirection, { passive: true });
    return () => window.removeEventListener("scroll", updateDirection);
  }, [direction]);

  return { direction, isTop };
}
