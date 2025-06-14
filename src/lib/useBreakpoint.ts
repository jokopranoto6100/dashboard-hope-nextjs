import { useEffect, useState } from "react";

export function useIsDesktop(mdPx = 768) {
  const [isDesktop, setIsDesktop] = useState(
    typeof window !== "undefined" ? window.innerWidth >= mdPx : true
  );
  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= mdPx);
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [mdPx]);
  return isDesktop;
}
