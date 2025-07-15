// src/components/ui/portal-skeleton.tsx
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface PortalSkeletonProps {
  /** Number of portal cards to show */
  cardCount?: number;
  /** Whether to show navigation arrows */
  showNavigation?: boolean;
  /** Custom gradient classes for the background */
  gradientClasses?: string;
  /** Custom title skeleton width */
  titleWidth?: string;
  /** Custom subtitle skeleton width */
  subtitleWidth?: string;
}

export function PortalSkeleton({
  cardCount = 4,
  showNavigation = true,
  gradientClasses = "from-purple-600 to-indigo-700 dark:from-purple-800 dark:to-indigo-900",
  titleWidth = "w-48 sm:w-80",
  subtitleWidth = "w-40 sm:w-72"
}: PortalSkeletonProps) {
  return (
    <Card className={`relative w-full overflow-hidden bg-gradient-to-br ${gradientClasses} shadow-2xl`}>
      <CardHeader className="text-white">
        <div className="flex justify-between items-start">
          <div>
            <Skeleton className={`h-6 sm:h-8 ${titleWidth} rounded-lg bg-white/20`} />
            <Skeleton className={`h-4 sm:h-5 ${subtitleWidth} rounded-lg bg-white/20 mt-2`} />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Responsive grid layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(cardCount)].map((_, i) => (
              <div key={i} className="perspective-1000">
                <div className="relative h-64 sm:h-72 lg:h-80 w-full">
                  <div className="absolute inset-0 flex h-full w-full flex-col items-center justify-center rounded-2xl p-4 sm:p-6 text-center shadow-lg bg-gradient-to-br from-white/20 to-white/10 dark:from-white/10 dark:to-white/5 border border-white/30 dark:border-white/20">
                    <Skeleton className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-white/20 mb-3 sm:mb-4" />
                    <Skeleton className="h-6 sm:h-8 w-24 sm:w-28 rounded bg-white/20" />
                    <Skeleton className="h-3 sm:h-4 w-28 sm:w-32 rounded bg-white/20 mt-2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Navigation arrows - hidden on mobile */}
          {showNavigation && (
            <div className="hidden sm:block">
              <Skeleton className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-md bg-white/10" />
              <Skeleton className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-md bg-white/10" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
