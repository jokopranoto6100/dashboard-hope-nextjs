// Example usage of PortalSkeleton component
// 
// src/components/ui/portal-skeleton.tsx

// Basic usage
<PortalSkeleton />

// Custom configurations
<PortalSkeleton 
  cardCount={6}
  showNavigation={false}
  gradientClasses="from-blue-600 to-cyan-700 dark:from-blue-800 dark:to-cyan-900"
  titleWidth="w-32 sm:w-64"
  subtitleWidth="w-28 sm:w-56"
/>

// For different portal types
<PortalSkeleton 
  cardCount={3}
  gradientClasses="from-green-600 to-emerald-700 dark:from-green-800 dark:to-emerald-900"
/>

<PortalSkeleton 
  cardCount={8}
  showNavigation={true}
  gradientClasses="from-red-600 to-pink-700 dark:from-red-800 dark:to-pink-900"
/>
