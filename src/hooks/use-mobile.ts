// src/hooks/use-mobile.ts
import * as React from "react"

const MOBILE_BREAKPOINT = 768

// ✅ TAMBAHKAN TIPE RETURN ': boolean' DI SINI
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    
    const onChange = () => {
      // Pengecekan 'window' untuk keamanan ekstra
      if (typeof window !== "undefined") {
        setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
      }
    }

    // Panggil sekali di awal saat komponen dimuat di client
    onChange();
    
    mql.addEventListener("change", onChange)

    // Fungsi cleanup untuk menghapus event listener
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}