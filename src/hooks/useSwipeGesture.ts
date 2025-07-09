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
  // New option to ignore swipes on scrollable elements
  ignoreScrollableElements?: boolean;
}

interface TouchState {
  startX: number;
  startY: number;
  startTime: number;
  // Track multiple touch points for velocity calculation
  lastX: number;
  lastY: number;
  lastTime: number;
  // Track the target element where touch started
  startTarget: EventTarget | null;
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
  onSwipeEnd,
  ignoreScrollableElements = true
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

  // Helper function to check if an element is horizontally scrollable
  const isElementScrollable = useCallback((element: Element): boolean => {
    if (!element) return false;
    
    const hasOverflowX = window.getComputedStyle(element).overflowX;
    const isScrollable = hasOverflowX === 'scroll' || hasOverflowX === 'auto';
    const hasScrollableContent = element.scrollWidth > element.clientWidth;
    
    return isScrollable && hasScrollableContent;
  }, []);

  // Helper function to check if touch started on or inside a scrollable element
  const isTargetInScrollableElement = useCallback((target: EventTarget | null): boolean => {
    if (!ignoreScrollableElements || !target || !(target instanceof Element)) {
      return false;
    }

    let currentElement: Element | null = target;
    
    // Check the target element and its parents up to 5 levels
    let depth = 0;
    while (currentElement && depth < 5) {
      // Check for common scrollable containers
      if (
        isElementScrollable(currentElement) ||
        currentElement.classList.contains('overflow-x-auto') ||
        currentElement.classList.contains('overflow-x-scroll') ||
        currentElement.tagName.toLowerCase() === 'table' ||
        currentElement.classList.contains('table') ||
        // Check for table-related elements
        ['tbody', 'thead', 'tr', 'td', 'th'].includes(currentElement.tagName.toLowerCase())
      ) {
        return true;
      }
      
      currentElement = currentElement.parentElement;
      depth++;
    }
    
    return false;
  }, [ignoreScrollableElements, isElementScrollable]);

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
      lastTime: currentTime,
      startTarget: e.target
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

    // Check if touch started on a scrollable element
    if (isTargetInScrollableElement(touchState.current.startTarget)) {
      return; // Don't process swipe if started on scrollable element
    }

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
  }, [threshold, preventDefaultTouchmoveEvent, minSwipeDistance, calculateVelocity, isTargetInScrollableElement]);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (!touchState.current) return;

    // Check if touch started on a scrollable element
    if (isTargetInScrollableElement(touchState.current.startTarget)) {
      // Reset state but don't trigger swipe
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
      return;
    }

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
  }, [threshold, onSwipeLeft, onSwipeRight, velocityThreshold, maxSwipeTime, calculateVelocity, onSwipeEnd, isTargetInScrollableElement]);

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
