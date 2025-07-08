// src/components/ui/swipe-indicator.tsx
"use client";

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SwipeProgress } from '@/hooks/useSwipeGesture';

interface SwipeIndicatorProps {
  direction: 'left' | 'right';
  isVisible: boolean;
  className?: string;
  // Enhanced props for better UX
  progress?: number; // 0 to 1
  showProgress?: boolean;
}

interface EnhancedSwipeIndicatorProps {
  swipeProgress: SwipeProgress;
  className?: string;
  showProgress?: boolean;
}

// Original simple indicator
export const SwipeIndicator = React.memo(({ direction, isVisible, className, progress = 0, showProgress = false }: SwipeIndicatorProps) => {
  if (!isVisible) return null;

  return (
    <div
      className={cn(
        "fixed top-1/2 -translate-y-1/2 z-50 bg-primary/90 text-primary-foreground rounded-full p-3 animate-in fade-in-0 slide-in-from-left-2 duration-200 transition-all",
        direction === 'left' ? "right-4 slide-in-from-right-2" : "left-4 slide-in-from-left-2",
        className
      )}
      style={{
        transform: `translateY(-50%) scale(${0.8 + progress * 0.4})`,
        opacity: 0.7 + progress * 0.3
      }}
    >
      {direction === 'left' ? (
        <ChevronLeft className="h-6 w-6" />
      ) : (
        <ChevronRight className="h-6 w-6" />
      )}
      {showProgress && (
        <div className="absolute inset-0 rounded-full border-2 border-primary-foreground/30">
          <div 
            className="absolute inset-0 rounded-full bg-primary-foreground/20"
            style={{
              transform: `scaleX(${progress})`,
              transformOrigin: direction === 'left' ? 'right' : 'left'
            }}
          />
        </div>
      )}
    </div>
  );
});

// Enhanced indicator that uses SwipeProgress
export const EnhancedSwipeIndicator = React.memo(({ swipeProgress, className, showProgress = true }: EnhancedSwipeIndicatorProps) => {
  const isVisible = swipeProgress.direction !== null && swipeProgress.progress > 0.1;
  
  if (!isVisible || !swipeProgress.direction) return null;

  return (
    <SwipeIndicator
      direction={swipeProgress.direction}
      isVisible={isVisible}
      progress={swipeProgress.progress}
      showProgress={showProgress}
      className={className}
    />
  );
});

SwipeIndicator.displayName = 'SwipeIndicator';
EnhancedSwipeIndicator.displayName = 'EnhancedSwipeIndicator';
