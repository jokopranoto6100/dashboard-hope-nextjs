// src/hooks/use-mobile.ts
import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  // ✅ 1. State awal sekarang bisa undefined
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    
    // Fungsi ini akan dipanggil saat ada perubahan DAN saat pertama kali
    const onChange = () => {
      setIsMobile(mql.matches)
    }

    mql.addEventListener("change", onChange)
    
    // Panggil sekali saat pertama kali untuk mengatur state awal
    onChange()

    return () => mql.removeEventListener("change", onChange)
  }, [])

  // ✅ 2. Kembalikan nilainya langsung (bisa true, false, atau undefined)
  return isMobile
}