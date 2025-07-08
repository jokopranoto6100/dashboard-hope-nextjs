// src/hooks/useSwipeGesture.ts
"use client";

import { useCallback, useRef, useState } from 'react';

interface SwipeGestureConfig {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number;
  preventDefaultTouchmoveEvent?: boolean;
  // New options for better UX
  velocityThreshold?: number;
  maxSwipeTime?: number;
  minSwipeDistance?: number;
  onSwipeStart?: () => void;
  onSwipeEnd?: () => void;
}

interface TouchState {
  startX: number;
  startY: number;
  startTime: number;
  // Track multiple touch points for velocity calculation
  lastX: number;
  lastY: number;
  lastTime: number;
}

interface SwipeProgress {
  deltaX: number;
  deltaY: number;
  progress: number; // 0 to 1 based on threshold
  direction: 'left' | 'right' | null;
  velocity: number;
}

export type { SwipeProgress };

export function useSwipeGesture({
  onSwipeLeft,
  onSwipeRight,
  threshold = 50,
  preventDefaultTouchmoveEvent = false,
  velocityThreshold = 0.5,
  maxSwipeTime = 500,
  minSwipeDistance = 30,
  onSwipeStart,
  onSwipeEnd
}: SwipeGestureConfig) {
  const touchState = useRef<TouchState | null>(null);
  const [isSwiping, setIsSwiping] = useState(false);
  const [swipeProgress, setSwipeProgress] = useState<SwipeProgress>({
    deltaX: 0,
    deltaY: 0,
    progress: 0,
    direction: null,
    velocity: 0
  });

  // Throttle touch move events to improve performance
  const throttleTimeout = useRef<NodeJS.Timeout | null>(null);

  const calculateVelocity = useCallback((currentX: number, currentY: number, currentTime: number) => {
    if (!touchState.current) return 0;
    
    const deltaX = currentX - touchState.current.lastX;
    const deltaY = currentY - touchState.current.lastY;
    const deltaTime = currentTime - touchState.current.lastTime;
    
    if (deltaTime === 0) return 0;
    
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    return distance / deltaTime;
  }, []);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    const touch = e.touches[0];
    const currentTime = Date.now();
    
    touchState.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      startTime: currentTime,
      lastX: touch.clientX,
      lastY: touch.clientY,
      lastTime: currentTime
    };
    
    setIsSwiping(false);
    setSwipeProgress({
      deltaX: 0,
      deltaY: 0,
      progress: 0,
      direction: null,
      velocity: 0
    });
    
    onSwipeStart?.();
  }, [onSwipeStart]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!touchState.current) return;

    const touch = e.touches[0];
    const currentTime = Date.now();
    const deltaX = touch.clientX - touchState.current.startX;
    const deltaY = touch.clientY - touchState.current.startY;
    const velocity = calculateVelocity(touch.clientX, touch.clientY, currentTime);

    // Update last position for velocity calculation
    touchState.current.lastX = touch.clientX;
    touchState.current.lastY = touch.clientY;
    touchState.current.lastTime = currentTime;

    // Check if horizontal swipe is dominant
    const isHorizontalSwipe = Math.abs(deltaX) > Math.abs(deltaY);
    const exceedsMinDistance = Math.abs(deltaX) > minSwipeDistance;

    if (isHorizontalSwipe && exceedsMinDistance) {
      // Throttle state updates to improve performance
      if (throttleTimeout.current) {
        clearTimeout(throttleTimeout.current);
      }
      
      throttleTimeout.current = setTimeout(() => {
        setIsSwiping(true);
        setSwipeProgress({
          deltaX,
          deltaY,
          progress: Math.min(Math.abs(deltaX) / threshold, 1),
          direction: deltaX > 0 ? 'right' : 'left',
          velocity
        });
      }, 16); // ~60fps

      if (preventDefaultTouchmoveEvent) {
        e.preventDefault();
      }
    }
  }, [threshold, preventDefaultTouchmoveEvent, minSwipeDistance, calculateVelocity]);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (!touchState.current) return;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchState.current.startX;
    const deltaY = touch.clientY - touchState.current.startY;
    const deltaTime = Date.now() - touchState.current.startTime;
    const velocity = calculateVelocity(touch.clientX, touch.clientY, Date.now());

    // Clear throttle timeout
    if (throttleTimeout.current) {
      clearTimeout(throttleTimeout.current);
      throttleTimeout.current = null;
    }

    // Enhanced swipe detection with velocity consideration
    const isValidSwipe = (
      Math.abs(deltaX) > threshold &&
      Math.abs(deltaX) > Math.abs(deltaY) &&
      deltaTime < maxSwipeTime &&
      (velocity > velocityThreshold || Math.abs(deltaX) > threshold * 1.5)
    );

    if (isValidSwipe) {
      if (deltaX > 0 && onSwipeRight) {
        onSwipeRight();
      } else if (deltaX < 0 && onSwipeLeft) {
        onSwipeLeft();
      }
    }

    touchState.current = null;
    setIsSwiping(false);
    setSwipeProgress({
      deltaX: 0,
      deltaY: 0,
      progress: 0,
      direction: null,
      velocity: 0
    });
    
    onSwipeEnd?.();
  }, [threshold, onSwipeLeft, onSwipeRight, velocityThreshold, maxSwipeTime, calculateVelocity, onSwipeEnd]);

  // Handle touch cancel events for better UX
  const handleTouchCancel = useCallback(() => {
    if (throttleTimeout.current) {
      clearTimeout(throttleTimeout.current);
      throttleTimeout.current = null;
    }
    
    touchState.current = null;
    setIsSwiping(false);
    setSwipeProgress({
      deltaX: 0,
      deltaY: 0,
      progress: 0,
      direction: null,
      velocity: 0
    });
    
    onSwipeEnd?.();
  }, [onSwipeEnd]);

  const bindToElement = useCallback((element: HTMLElement | null) => {
    if (!element) return;

    // Use more specific passive options for better performance
    const passiveOptions = { passive: true };
    const activeOptions = { passive: !preventDefaultTouchmoveEvent };

    element.addEventListener('touchstart', handleTouchStart, passiveOptions);
    element.addEventListener('touchmove', handleTouchMove, activeOptions);
    element.addEventListener('touchend', handleTouchEnd, passiveOptions);
    element.addEventListener('touchcancel', handleTouchCancel, passiveOptions);

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
      element.removeEventListener('touchcancel', handleTouchCancel);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, handleTouchCancel, preventDefaultTouchmoveEvent]);

  return {
    bindToElement,
    isSwiping,
    swipeProgress,
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
      onTouchCancel: handleTouchCancel
    }
  };
}
