// src/app/(dashboard)/pengguna/loading.tsx
import { Users } from "lucide-react";

export default function LoadingPage() {
  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <header className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Users className="h-8 w-8 text-blue-600 animate-pulse" />
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Manajemen Pengguna
          </h1>
        </div>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Memuat data pengguna...
        </p>
      </header>

      {/* Loading skeleton dengan responsive design */}
      <div className="space-y-6">
        {/* Header section skeleton */}
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 gap-4">
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-md w-full max-w-sm animate-pulse"></div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <div className="h-10 w-full sm:w-32 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
            <div className="h-10 w-full sm:w-40 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
          </div>
        </div>
        
        {/* Desktop table skeleton */}
        <div className="hidden lg:block border rounded-lg">
          <div className="p-4 border-b bg-muted/30">
            <div className="flex gap-4">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4 animate-pulse"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-40 animate-pulse"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-36 animate-pulse"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse"></div>
            </div>
          </div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="p-4 border-b last:border-b-0">
              <div className="flex items-center gap-4">
                <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-40 animate-pulse"></div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-16 animate-pulse"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-36 animate-pulse"></div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-20 animate-pulse"></div>
                <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse ml-auto"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile cards skeleton */}
        <div className="lg:hidden space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse"></div>
                    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-full w-16 animate-pulse"></div>
                  </div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-40 animate-pulse"></div>
                  <div className="flex gap-1 pt-1">
                    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-full w-20 animate-pulse"></div>
                    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-full w-24 animate-pulse"></div>
                  </div>
                </div>
                <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination skeleton */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-40 animate-pulse order-2 sm:order-1"></div>
          <div className="flex items-center space-x-2 order-1 sm:order-2">
            <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
