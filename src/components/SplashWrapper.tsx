"use client";

import React, { useState, useEffect } from 'react';
import SplashScreen from './SplashScreen';

interface SplashWrapperProps {
  children: React.ReactNode;
}

export default function SplashWrapper({ children }: SplashWrapperProps) {
  const [showSplash, setShowSplash] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    // Check if app was launched as PWA
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                        (window.navigator as any).standalone ||
                        document.referrer.includes('android-app://');
    
    // Only show splash screen for PWA launches
    if (!isStandalone) {
      setShowSplash(false);
    }
  }, []);

  // Don't render anything on server side
  if (!isClient) {
    return <>{children}</>;
  }

  if (showSplash) {
    return (
      <>
        <SplashScreen onFinish={() => setShowSplash(false)} />
        <div style={{ display: 'none' }}>
          {children}
        </div>
      </>
    );
  }

  return <>{children}</>;
}
