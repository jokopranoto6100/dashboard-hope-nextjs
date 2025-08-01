"use client";

import React, { useState, useEffect } from 'react';
import SplashScreen from './SplashScreen';

interface SplashWrapperProps {
  children: React.ReactNode;
}

export default function SplashWrapper({ children }: SplashWrapperProps) {
  const [showSplash, setShowSplash] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    // More accurate PWA detection
    const isPWA = () => {
      // Check if running in standalone mode (iOS Safari)
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      
      // Check if running as PWA on iOS
      const isIOSPWA = (window.navigator as any).standalone === true;
      
      // Check if running as Android PWA
      const isAndroidPWA = document.referrer.includes('android-app://');
      
      // Check if running in fullscreen mode (some Android browsers)
      const isFullscreen = window.matchMedia('(display-mode: fullscreen)').matches;
      
      // Check if window.location has app-like characteristics
      const hasAppMode = window.location.search.includes('pwa=true') || 
                        window.location.hash.includes('pwa');
      
      return isStandalone || isIOSPWA || isAndroidPWA || isFullscreen || hasAppMode;
    };
    
    // Only show splash screen if actually running as PWA
    if (isPWA()) {
      setShowSplash(true);
    }
  }, []);

  // Always show children first if not PWA or not client-side yet
  if (!isClient || !showSplash) {
    return <>{children}</>;
  }

  return (
    <>
      <SplashScreen onFinish={() => setShowSplash(false)} />
      <div style={{ display: 'none' }}>
        {children}
      </div>
    </>
  );
}
