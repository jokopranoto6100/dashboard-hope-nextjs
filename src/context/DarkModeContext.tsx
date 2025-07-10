'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';

type DarkModeContextType = {
  isDark: boolean;
  toggleDarkMode: () => void;
  mounted: boolean;
};

const DarkModeContext = createContext<DarkModeContextType>({
  isDark: false,
  toggleDarkMode: () => {},
  mounted: false,
});

export const DarkModeProvider = ({ children }: { children: React.ReactNode }) => {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Prevent flash by setting initial theme immediately
    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = saved === 'dark' || (saved === null && prefersDark);
    
    // Set state immediately to prevent hydration mismatch
    setIsDark(shouldBeDark);
    
    // Apply theme class without transition first
    if (shouldBeDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Add smooth transition after initial render
    requestAnimationFrame(() => {
      document.documentElement.style.transition = 'background-color 0.3s ease, color 0.3s ease';
      setMounted(true);
    });
  }, []);

  const toggleDarkMode = () => {
    setIsDark((prev) => {
      const newVal = !prev;
      localStorage.setItem('theme', newVal ? 'dark' : 'light');
      
      // Ensure transition is applied
      if (!document.documentElement.style.transition) {
        document.documentElement.style.transition = 'background-color 0.3s ease, color 0.3s ease';
      }
      
      if (newVal) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      
      return newVal;
    });
  };

  return (
    <DarkModeContext.Provider value={{ isDark, toggleDarkMode, mounted }}>
      {children}
    </DarkModeContext.Provider>
  );
};

export const useDarkMode = () => useContext(DarkModeContext);