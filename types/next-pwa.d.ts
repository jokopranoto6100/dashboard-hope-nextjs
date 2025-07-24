declare module 'next-pwa' {
  import { NextConfig } from 'next'
  
  interface PWAConfig {
    dest?: string
    register?: boolean
    skipWaiting?: boolean
    disable?: boolean
    buildExcludes?: RegExp[]
    runtimeCaching?: Array<{
      urlPattern: RegExp
      handler: string
      method?: string
      options?: {
        cacheName: string
        expiration?: {
          maxEntries: number
          maxAgeSeconds: number
        }
        networkTimeoutSeconds?: number
        rangeRequests?: boolean
      }
    }>
  }
  
  function withPWA(config: PWAConfig): (nextConfig: NextConfig) => NextConfig
  export = withPWA
}
