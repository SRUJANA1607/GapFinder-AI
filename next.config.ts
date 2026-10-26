import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  serverExternalPackages: ['pdfjs-dist', 'canvas'],
  devIndicators: {
    position: 'bottom-right',
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async redirects() {
    return [
      {
        source: '/dahsboard',
        destination: '/dashboard',
        permanent: true,
      },
      {
        source: '/dashbaord',
        destination: '/dashboard',
        permanent: true,
      },
      {
        source: '/dashbord',
        destination: '/dashboard',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
