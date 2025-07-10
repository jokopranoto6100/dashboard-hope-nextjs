"use client";

import { useEffect, useRef } from 'react';

interface SimpleSwipeConfig {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number;
  enabled?: boolean;
}

export function useSimpleSwipe({
  onSwipeLeft,
  onSwipeRight,
  threshold = 50,
  enabled = true
}: SimpleSwipeConfig) {
  const elementRef = useRef<HTMLElement | null>(null);
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || !enabled) return;

    let startX = 0;
    let startY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      startX = touch.clientX;
      startY = touch.clientY;
      touchStartX.current = startX;
      touchStartY.current = startY;

      if (process.env.NODE_ENV === 'development') {
        console.log('Simple swipe start:', { x: startX, y: startY });
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!e.changedTouches.length) return;
      
      const touch = e.changedTouches[0];
      const endX = touch.clientX;
      const endY = touch.clientY;
      
      const deltaX = endX - startX;
      const deltaY = Math.abs(endY - startY);
      
      if (process.env.NODE_ENV === 'development') {
        console.log('Simple swipe end:', { deltaX, deltaY, threshold });
      }

      // Make sure it's more horizontal than vertical
      if (Math.abs(deltaX) > deltaY && Math.abs(deltaX) > threshold) {
        if (deltaX > 0 && onSwipeRight) {
          console.log('Swipe right detected');
          onSwipeRight();
        } else if (deltaX < 0 && onSwipeLeft) {
          console.log('Swipe left detected');
          onSwipeLeft();
        }
      }
    };

    // Add event listeners
    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    if (process.env.NODE_ENV === 'development') {
      console.log('Simple swipe handlers attached to:', element);
    }

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchend', handleTouchEnd);
      
      if (process.env.NODE_ENV === 'development') {
        console.log('Simple swipe handlers removed');
      }
    };
  }, [enabled, threshold, onSwipeLeft, onSwipeRight]);

  return elementRef;
}
