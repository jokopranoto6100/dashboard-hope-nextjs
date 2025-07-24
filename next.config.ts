import type { NextConfig } from "next";
import withPWA from "next-pwa";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '25mb', // Naikkan batas menjadi 25MB
    },
  },
};

export default withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  buildExcludes: [/middleware-manifest\.json$/],
  runtimeCaching: [
    // Minimal caching untuk startup cepat
    {
      urlPattern: /\/_next\/static.+\.(js|css)$/i,
      handler: "NetworkFirst",
      options: {
        cacheName: "next-static-assets",
        networkTimeoutSeconds: 2, // Timeout sangat cepat
        expiration: {
          maxEntries: 15, // Cache sangat minimal
          maxAgeSeconds: 30 * 60, // 30 menit saja
        },
      },
    },
    {
      urlPattern: /\/api\/.*$/i,
      handler: "NetworkOnly", // Tidak ada cache untuk API, selalu fresh
      method: "GET",
    },
    {
      urlPattern: /.*/i,
      handler: "NetworkFirst",
      options: {
        cacheName: "pages",
        networkTimeoutSeconds: 1, // 1 detik timeout
        expiration: {
          maxEntries: 5, // Cache sangat sedikit
          maxAgeSeconds: 10 * 60, // 10 menit
        },
      },
    },
  ],
})(nextConfig);
