"use client";

import { useCallback, useRef } from 'react';

interface SwipeToCloseConfig {
  onClose: () => void;
  threshold?: number;
  enabled?: boolean;
}

export function useSwipeToClose({
  onClose,
  threshold = 100,
  enabled = true
}: SwipeToCloseConfig) {
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);
  const isDragging = useRef<boolean>(false);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (!enabled) return;
    
    const touch = e.touches[0];
    touchStartX.current = touch.clientX;
    touchStartY.current = touch.clientY;
    isDragging.current = false;
  }, [enabled]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!enabled) return;

    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStartX.current;
    const deltaY = Math.abs(touch.clientY - touchStartY.current);
    
    // Check if it's a horizontal swipe (more horizontal than vertical)
    if (Math.abs(deltaX) > deltaY && Math.abs(deltaX) > 20) {
      isDragging.current = true;
      
      // For left sidebar, swipe left to close
      if (deltaX < -threshold) {
        onClose();
      }
    }
  }, [enabled, threshold, onClose]);

  const handleTouchEnd = useCallback(() => {
    isDragging.current = false;
  }, []);

  const bindToElement = useCallback((element: HTMLElement | null) => {
    if (!element || !enabled) return;

    const options = { passive: true };
    element.addEventListener('touchstart', handleTouchStart, options);
    element.addEventListener('touchmove', handleTouchMove, options);
    element.addEventListener('touchend', handleTouchEnd, options);

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, enabled]);

  return { bindToElement };
}
