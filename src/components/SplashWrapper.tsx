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
    
    // Check if app was launched as PWA
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                        (window.navigator as any).standalone ||
                        document.referrer.includes('android-app://');
    
    // Show splash screen for PWA launches
    if (isStandalone) {
      setShowSplash(true);
    }
  }, []);

  // Show children immediately if not client-side yet or no splash needed
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
