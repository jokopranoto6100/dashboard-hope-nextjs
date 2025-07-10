"use client";

// Simple haptic feedback utility for mobile devices
export const hapticFeedback = {
  // Light tap feedback
  light: () => {
    if ('vibrate' in navigator && /Mobi|Android/i.test(navigator.userAgent)) {
      navigator.vibrate(10);
    }
  },

  // Medium feedback for button presses
  medium: () => {
    if ('vibrate' in navigator && /Mobi|Android/i.test(navigator.userAgent)) {
      navigator.vibrate(20);
    }
  },

  // Strong feedback for important actions
  strong: () => {
    if ('vibrate' in navigator && /Mobi|Android/i.test(navigator.userAgent)) {
      navigator.vibrate([30, 10, 30]);
    }
  },

  // Success pattern
  success: () => {
    if ('vibrate' in navigator && /Mobi|Android/i.test(navigator.userAgent)) {
      navigator.vibrate([50, 25, 50]);
    }
  },

  // Error pattern
  error: () => {
    if ('vibrate' in navigator && /Mobi|Android/i.test(navigator.userAgent)) {
      navigator.vibrate([100, 50, 100, 50, 100]);
    }
  }
};

// Hook for using haptic feedback with components
export function useHapticFeedback() {
  return hapticFeedback;
}
