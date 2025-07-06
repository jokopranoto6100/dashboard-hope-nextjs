// src/components/ui/swipe-indicator.tsx
"use client";

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SwipeIndicatorProps {
  direction: 'left' | 'right';
  isVisible: boolean;
  className?: string;
}

export const SwipeIndicator = React.memo(({ direction, isVisible, className }: SwipeIndicatorProps) => {
  if (!isVisible) return null;

  return (
    <div
      className={cn(
        "fixed top-1/2 -translate-y-1/2 z-50 bg-primary/90 text-primary-foreground rounded-full p-3 animate-in fade-in-0 slide-in-from-left-2 duration-200",
        direction === 'left' ? "right-4 slide-in-from-right-2" : "left-4 slide-in-from-left-2",
        className
      )}
    >
      {direction === 'left' ? (
        <ChevronLeft className="h-6 w-6" />
      ) : (
        <ChevronRight className="h-6 w-6" />
      )}
    </div>
  );
});

SwipeIndicator.displayName = 'SwipeIndicator';
