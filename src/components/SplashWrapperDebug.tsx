"use client";

import React, { useState, useEffect } from 'react';
import SplashScreen from './SplashScreen';

interface SplashWrapperProps {
  children: React.ReactNode;
}

export default function SplashWrapperDebug({ children }: SplashWrapperProps) {
  const [showSplash, setShowSplash] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    // For debugging - always show splash screen
    // Comment this out and use the real PWA detection later
    setShowSplash(true);
    
    // Uncomment for production PWA detection:
    // const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
    //                     (window.navigator as any).standalone ||
    //                     document.referrer.includes('android-app://');
    // if (isStandalone) {
    //   setShowSplash(true);
    // }
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
