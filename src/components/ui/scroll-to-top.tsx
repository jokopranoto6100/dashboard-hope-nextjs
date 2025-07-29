"use client";

import * as React from "react";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ScrollToTopProps {
  threshold?: number;
  className?: string;
  smooth?: boolean;
  showProgress?: boolean;
  variant?: "default" | "secondary" | "outline" | "ghost";
}

export function ScrollToTop({ 
  threshold = 300, 
  className,
  smooth = true,
  showProgress = true,
  variant = "default"
}: ScrollToTopProps) {
  const [isVisible, setIsVisible] = React.useState(false);
  const [scrollProgress, setScrollProgress] = React.useState(0);

  React.useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = Math.min((scrollY / documentHeight) * 100, 100);
      
      setIsVisible(scrollY > threshold);
      setScrollProgress(progress);
    };

    // Add scroll event listener
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Initial check
    handleScroll();

    // Cleanup
    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: smooth ? 'smooth' : 'auto'
    });
  };

  // Variant styles yang sesuai dengan shadcn/ui theme
  const getVariantStyles = () => {
    switch (variant) {
      case "secondary":
        return "bg-secondary hover:bg-secondary/80 text-secondary-foreground border-border/50";
      case "outline":
        return "bg-background hover:bg-accent hover:text-accent-foreground border-border text-foreground";
      case "ghost":
        return "bg-background/80 hover:bg-accent hover:text-accent-foreground border-border/30 text-foreground backdrop-blur-md";
      default:
        return "bg-primary hover:bg-primary/90 text-primary-foreground border-border/50";
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Button
        onClick={scrollToTop}
        size="icon"
        className={cn(
          "relative h-12 w-12 rounded-full shadow-lg transition-all duration-300 ease-in-out",
          "hover:shadow-xl hover:scale-110 active:scale-95",
          "group overflow-hidden",
          getVariantStyles(),
          isVisible 
            ? "opacity-100 translate-y-0 pointer-events-auto" 
            : "opacity-0 translate-y-4 pointer-events-none",
          className
        )}
        aria-label="Scroll to top"
        title="Kembali ke atas"
      >
        {/* Progress Ring Background */}
        {showProgress && (
          <svg 
            className="absolute inset-0 h-full w-full -rotate-90" 
            viewBox="0 0 48 48"
          >
            <circle
              cx="24"
              cy="24"
              r="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="opacity-30"
            />
            <circle
              cx="24"
              cy="24"
              r="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className="transition-all duration-150 ease-out"
              strokeDasharray={`${2 * Math.PI * 20}`}
              strokeDashoffset={`${2 * Math.PI * 20 * (1 - scrollProgress / 100)}`}
            />
          </svg>
        )}
        
        {/* Arrow Icon */}
        <ArrowUp className="relative z-10 h-5 w-5 transition-transform group-hover:scale-110" />
      </Button>
    </div>
  );
}
