// tailwind.config.ts
import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class", "dark"], // <-- UBAH BARIS INI
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
	],
  prefix: "",
  theme: {
    // ... (sisa konfigurasi) ...
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config