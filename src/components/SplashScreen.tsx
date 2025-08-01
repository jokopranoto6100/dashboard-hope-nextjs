"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';

interface SplashScreenProps {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    // Preload the image
    const img = new window.Image();
    img.onload = () => setImageLoaded(true);
    img.src = '/icon/hope.png';

    // Splash screen akan mulai fade out setelah 2.5 detik
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, 2500);

    // Splash screen akan benar-benar hilang setelah fade out selesai
    const finishTimer = setTimeout(() => {
      setIsVisible(false);
      onFinish();
    }, 3000);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(finishTimer);
    };
  }, [onFinish]);

  if (!isVisible) {
    return null;
  }

  return (
    <div className={`fixed inset-0 bg-white dark:bg-gray-900 z-50 flex items-center justify-center transition-opacity duration-500 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}>
      {/* Background Gradient */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          background: 'linear-gradient(135deg, rgb(137, 132, 216) 0%, rgb(120, 115, 200) 50%, rgb(100, 95, 180) 100%)'
        }}
      />
      
      {/* Animated Logo Container */}
      <div className="relative flex flex-col items-center justify-center">
        {/* Outer Ring Animation */}
        <div className="absolute inset-0 w-32 h-32 border-4 border-transparent border-t-purple-300 rounded-full animate-spin-slow opacity-60" />
        
        {/* Logo with ChatGPT-style Animation */}
        <div className="w-24 h-24 relative animate-pulse-scale mb-6">
          <div className="relative w-12 h-12 mx-auto animate-rotate-scale">
            {imageLoaded ? (
              <Image
                src="/icon/hope.png"
                alt="Dashboard HOPE"
                fill
                className="object-contain"
                priority
                unoptimized
              />
            ) : (
              /* Fallback atom-like icon while loading */
              <div className="w-12 h-12 flex items-center justify-center">
                <div className="relative">
                  {/* Atom nucleus */}
                  <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
                  {/* Electron orbits */}
                  <div className="absolute inset-0 w-8 h-8 border border-purple-400 rounded-full transform -rotate-45" style={{top: '-10px', left: '-10px'}}></div>
                  <div className="absolute inset-0 w-8 h-8 border border-purple-400 rounded-full transform rotate-45" style={{top: '-10px', left: '-10px'}}></div>
                  {/* Electrons */}
                  <div className="absolute w-1 h-1 bg-purple-500 rounded-full animate-ping" style={{top: '-12px', left: '2px'}}></div>
                  <div className="absolute w-1 h-1 bg-purple-500 rounded-full animate-ping" style={{top: '2px', left: '14px', animationDelay: '0.5s'}}></div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* App Name with Typing Animation */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2 animate-fade-in">
            Dashboard HOPE
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-300 animate-fade-in-delay">
            BPS Kalimantan Barat
          </p>
        </div>
        
        {/* Loading Dots */}
        <div className="flex space-x-2 mt-8">
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}
