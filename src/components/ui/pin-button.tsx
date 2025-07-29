"use client";

import * as React from "react";
import { Pin } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface PinButtonProps {
  kpiId: string;
  isPinned: boolean;
  pinOrder?: number | null;
  onTogglePin: (kpiId: string) => Promise<void>;
  disabled?: boolean;
  canPinMore?: boolean;
  className?: string;
}

export function PinButton({ 
  kpiId,
  isPinned, 
  pinOrder,
  onTogglePin,
  disabled = false,
  canPinMore = true,
  className
}: PinButtonProps) {
  const [isLoading, setIsLoading] = React.useState(false);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (disabled || isLoading) return;
    
    // Check if trying to pin when can't pin more
    if (!isPinned && !canPinMore) return;
    
    setIsLoading(true);
    try {
      await onTogglePin(kpiId);
    } catch (error) {
      console.error('Error toggling pin:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTooltipText = () => {
    if (disabled) return "PIN tidak tersedia";
    if (isPinned) return `Pin #${pinOrder} - Klik untuk unpin`;
    if (!canPinMore) return "Maksimal 3 KPI yang bisa di-pin";
    return "Pin ke atas dashboard";
  };

  const getButtonVariant = () => {
    if (isPinned) return "default";
    if (!canPinMore) return "secondary";
    return "ghost";
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={getButtonVariant()}
            size="icon"
            onClick={handleClick}
            disabled={disabled || isLoading || (!isPinned && !canPinMore)}
            className={cn(
              "h-8 w-8 transition-all duration-200 shrink-0",
              isPinned && [
                "bg-amber-500 hover:bg-amber-600 text-white",
                "shadow-md hover:shadow-lg",
                "scale-110"
              ],
              !isPinned && canPinMore && [
                "text-muted-foreground hover:text-foreground",
                "hover:bg-muted/50"
              ],
              !canPinMore && !isPinned && [
                "text-muted-foreground/50 cursor-not-allowed",
                "opacity-50"
              ],
              isLoading && "animate-pulse",
              className
            )}
            title={getTooltipText()}
          >
            <Pin 
              className={cn(
                "h-4 w-4 transition-all duration-200",
                isPinned && "fill-current rotate-12",
                isLoading && "animate-spin"
              )} 
            />
            {isPinned && pinOrder && (
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-white text-amber-600 text-xs font-bold flex items-center justify-center">
                {pinOrder}
              </span>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-sm">{getTooltipText()}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
