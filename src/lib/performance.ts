"use client";

// Performance monitoring utility
export class PerformanceMonitor {
  private static measurements: Map<string, number> = new Map();

  static start(label: string): void {
    this.measurements.set(label, performance.now());
  }

  static end(label: string): number {
    const startTime = this.measurements.get(label);
    if (!startTime) {
      console.warn(`Performance measurement for "${label}" was not started`);
      return 0;
    }

    const duration = performance.now() - startTime;
    this.measurements.delete(label);

    // Log performance metrics in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`⚡ ${label}: ${duration.toFixed(2)}ms`);
      
      // Warn about slow operations
      if (duration > 1000) {
        console.warn(`🐌 Slow operation detected: ${label} took ${duration.toFixed(2)}ms`);
      }
    }

    return duration;
  }

  static measure<T>(label: string, fn: () => Promise<T>): Promise<T> {
    this.start(label);
    return fn().finally(() => this.end(label));
  }
}
