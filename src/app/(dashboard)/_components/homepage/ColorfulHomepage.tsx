// Enhanced Homepage Color Scheme dengan referensi warna custom
// Lokasi: src/app/(dashboard)/_components/homepage/ColorfulHomepage.tsx

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Custom color palette berdasarkan referensi exact hex codes
export const customColorPalette = {
  coral: "#f97d83",      // Pink/Coral - untuk special/highlight
  orange: "#fab067",     // Orange/Amber - untuk palawija  
  mint: "#78d19a",       // Green/Mint - untuk padi
  lavender: "#c87cc3",   // Purple/Lavender - untuk simtp
  coffee: "#754842",     // Brown/Coffee - untuk default/secondary
  periwinkle: "#8e97fe", // Blue/Periwinkle - untuk KSA
  peach: "#fdb18f"       // Peach/Salmon - untuk KSA Jagung
};

// Color schemes menggunakan referensi exact hex codes - FLAT VERSION dengan Dark Mode
export const customColorSchemes = {
  padi: {
    baseColor: customColorPalette.mint,
    // Flat background dengan dark mode support
    background: "rgba(120, 209, 154, 0.1)",
    backgroundDark: "rgba(120, 209, 154, 0.15)",
    border: "border-2 border-[#78d19a]/30 hover:border-[#78d19a]/50 dark:border-[#78d19a]/40 dark:hover:border-[#78d19a]/60",
    iconColor: customColorPalette.mint,
    progressBg: "rgba(120, 209, 154, 0.2)",
    progressFill: customColorPalette.mint,
    textPrimary: "#0f4c2a",
    textPrimaryDark: "#86efac",
    textSecondary: "#166534",
    textSecondaryDark: "#4ade80"
  },
  palawija: {
    baseColor: customColorPalette.orange,
    background: "rgba(250, 176, 103, 0.1)",
    backgroundDark: "rgba(250, 176, 103, 0.15)",
    border: "border-2 border-[#fab067]/30 hover:border-[#fab067]/50 dark:border-[#fab067]/40 dark:hover:border-[#fab067]/60",
    iconColor: customColorPalette.orange,
    progressBg: "rgba(250, 176, 103, 0.2)",
    progressFill: customColorPalette.orange,
    textPrimary: "#7c2d12",
    textPrimaryDark: "#fed7aa",
    textSecondary: "#c2410c",
    textSecondaryDark: "#fb923c"
  },
  ksa: {
    baseColor: customColorPalette.periwinkle,
    background: "rgba(142, 151, 254, 0.1)",
    backgroundDark: "rgba(142, 151, 254, 0.15)",
    border: "border-2 border-[#8e97fe]/30 hover:border-[#8e97fe]/50 dark:border-[#8e97fe]/40 dark:hover:border-[#8e97fe]/60",
    iconColor: customColorPalette.periwinkle,
    progressBg: "rgba(142, 151, 254, 0.2)",
    progressFill: customColorPalette.periwinkle,
    textPrimary: "#1e1b4b",
    textPrimaryDark: "#c7d2fe",
    textSecondary: "#3730a3",
    textSecondaryDark: "#818cf8"
  },
  ksaJagung: {
    baseColor: customColorPalette.peach,
    background: "rgba(253, 177, 143, 0.1)",
    backgroundDark: "rgba(253, 177, 143, 0.15)",
    border: "border-2 border-[#fdb18f]/30 hover:border-[#fdb18f]/50 dark:border-[#fdb18f]/40 dark:hover:border-[#fdb18f]/60",
    iconColor: customColorPalette.peach,
    progressBg: "rgba(253, 177, 143, 0.2)",
    progressFill: customColorPalette.peach,
    textPrimary: "#9a3412",
    textPrimaryDark: "#fed7aa",
    textSecondary: "#ea580c",
    textSecondaryDark: "#fb923c"
  },
  simtp: {
    baseColor: customColorPalette.lavender,
    background: "rgba(200, 124, 195, 0.1)",
    backgroundDark: "rgba(200, 124, 195, 0.15)",
    border: "border-2 border-[#c87cc3]/30 hover:border-[#c87cc3]/50 dark:border-[#c87cc3]/40 dark:hover:border-[#c87cc3]/60",
    iconColor: customColorPalette.lavender,
    progressBg: "rgba(200, 124, 195, 0.2)",
    progressFill: customColorPalette.lavender,
    textPrimary: "#581c87",
    textPrimaryDark: "#e9d5ff",
    textSecondary: "#7c3aed",
    textSecondaryDark: "#a855f7"
  },
  special: {
    baseColor: customColorPalette.coral,
    background: "rgba(249, 125, 131, 0.1)",
    backgroundDark: "rgba(249, 125, 131, 0.15)",
    border: "border-2 border-[#f97d83]/30 hover:border-[#f97d83]/50 dark:border-[#f97d83]/40 dark:hover:border-[#f97d83]/60",
    iconColor: customColorPalette.coral,
    progressBg: "rgba(249, 125, 131, 0.2)",
    progressFill: customColorPalette.coral,
    textPrimary: "#881337",
    textPrimaryDark: "#fecaca",
    textSecondary: "#e11d48",
    textSecondaryDark: "#f87171"
  },
  default: {
    baseColor: customColorPalette.coffee,
    background: "rgba(117, 72, 66, 0.1)",
    backgroundDark: "rgba(117, 72, 66, 0.15)",
    border: "border-2 border-[#754842]/30 hover:border-[#754842]/50 dark:border-[#754842]/40 dark:hover:border-[#754842]/60",
    iconColor: customColorPalette.coffee,
    progressBg: "rgba(117, 72, 66, 0.2)",
    progressFill: customColorPalette.coffee,
    textPrimary: "#44403c",
    textPrimaryDark: "#d6d3d1",
    textSecondary: "#78716c",
    textSecondaryDark: "#a8a29e"
  }
};

// Komponen Card dengan custom colors
interface CustomColorfulCardProps {
  type: keyof typeof customColorSchemes;
  title: string;
  percentage?: number;
  status?: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  isHighlighted?: boolean;
}

export const CustomColorfulCard: React.FC<CustomColorfulCardProps> = ({ 
  type, 
  title, 
  percentage, 
  status, 
  icon, 
  children, 
  isHighlighted 
}) => {
  const colors = customColorSchemes[type];
  
  return (
    <Card 
      className={`
        h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1 relative
        ${colors.border}
        ${isHighlighted ? 'ring-4 ring-amber-400 shadow-2xl' : 'shadow-lg'}
        bg-white dark:bg-gray-800
      `}
      style={{
        backgroundColor: colors.background,
        // Dark mode background akan di-handle oleh Tailwind dark: classes
      }}
    >
      {/* Dark mode background overlay */}
      <div className="absolute inset-0 rounded-lg hidden dark:block" style={{ backgroundColor: colors.backgroundDark }} />
      
      {isHighlighted && (
        <Badge 
          variant="default" 
          className="absolute -top-3 -right-3 flex items-center gap-1 text-white hover:scale-105 transition-transform z-10"
          style={{ backgroundColor: customColorPalette.coral }}
        >
          ⚡ Prioritas Tinggi
        </Badge>
      )}
      
      <CardHeader className="pb-2 relative z-10">
        <div className="flex items-center justify-between">
          <CardTitle 
            className={`text-sm font-semibold transition-colors`}
            style={{ color: colors.textPrimary }}
          >
            <span className="dark:hidden">{title}</span>
            <span className="hidden dark:inline" style={{ color: colors.textPrimaryDark }}>{title}</span>
          </CardTitle>
          {icon && (
            <div 
              className="transition-transform duration-300 hover:scale-110"
              style={{ color: colors.iconColor }}
            >
              {icon}
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="relative z-10">
        <div className="dark:hidden">
          {children}
        </div>
        <div className="hidden dark:block text-gray-200">
          {children}
        </div>
        
        {/* Status Badge */}
        {status && (
          <div className="mt-4">
            <Badge 
              className="text-xs font-medium text-white"
              style={{ backgroundColor: colors.baseColor + 'cc' }}
            >
              {status}
            </Badge>
          </div>
        )}
        
        {/* Custom Progress Bar - Flat Design */}
        {percentage !== undefined && (
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-xs font-medium">
              <span style={{ color: colors.textSecondary }} className="dark:hidden">Progress</span>
              <span style={{ color: colors.textSecondaryDark }} className="hidden dark:inline">Progress</span>
              <span style={{ color: colors.textSecondary }} className="dark:hidden">{percentage}%</span>
              <span style={{ color: colors.textSecondaryDark }} className="hidden dark:inline">{percentage}%</span>
            </div>
            <div 
              className="w-full rounded-full h-3 relative overflow-hidden"
              style={{ backgroundColor: colors.progressBg }}
            >
              <div 
                className="h-3 rounded-full transition-all duration-700 ease-out"
                style={{ 
                  width: `${Math.min(percentage, 100)}%`,
                  backgroundColor: colors.progressFill // Flat color instead of gradient
                }}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Header dengan flat color design dan dark mode support
export const CustomColorfulHeader = ({ year }: { year: number }) => (
  <div 
    className="text-white p-6 rounded-xl mb-6 shadow-2xl relative overflow-hidden transition-all duration-300"
    style={{
      backgroundColor: customColorPalette.periwinkle, // Flat color instead of gradient
    }}
  >
    {/* Dark mode overlay */}
    <div className="absolute inset-0 bg-black/20 dark:bg-black/40 rounded-xl" />
    
    {/* Subtle pattern overlay */}
    <div className="absolute inset-0 opacity-10">
      <div className="absolute inset-0 bg-white/10" />
    </div>
    
    <div className="relative flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">🌾 Dashboard Statistik Pertanian</h1>
        <p className="text-white/90 mt-2 text-lg">
          Monitoring kegiatan survei dan sensus tahun {year}
        </p>
      </div>
      <div 
        className="rounded-full p-4 backdrop-blur-sm"
        style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
      >
        <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
    </div>
  </div>
);

// Grid responsif dengan spacing yang optimal
export const CustomColorfulGrid = ({ children }: { children: React.ReactNode }) => (
  <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 auto-rows-fr">
    {children}
  </div>
);
