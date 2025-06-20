// src/hooks/use-mobile.ts (Versi Perbaikan)
import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile(): boolean {
  // 1. Inisialisasi state ke `false` secara default.
  //    Ini konsisten dengan nilai saat SSR (karena window tidak ada).
  const [isMobile, setIsMobile] = React.useState(false)

  React.useEffect(() => {
    // Fungsi ini hanya akan berjalan di client.
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)

    // 2. Buat fungsi untuk mengatur state berdasarkan kondisi media query.
    const handleResize = (event: MediaQueryListEvent | MediaQueryList) => {
      setIsMobile(event.matches)
    }
    
    // 3. Panggil sekali di awal untuk mengatur state yang benar saat komponen mount.
    handleResize(mql);

    // 4. Gunakan 'change' listener yang lebih modern dan efisien.
    mql.addEventListener("change", handleResize)

    // Cleanup listener saat komponen unmount
    return () => mql.removeEventListener("change", handleResize)
  }, []) // Dependency array kosong memastikan ini hanya berjalan sekali saat mount.

  return isMobile
}