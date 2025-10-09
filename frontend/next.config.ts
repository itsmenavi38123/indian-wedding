import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
     unoptimized: true, 
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001', // your backend port
        pathname: '/uploads/**', // allow uploaded images
      },
      {
        protocol: 'http',
        hostname: '209.38.121.128', // your production backend domain
        pathname: '/uploads/**',
      },
    ],
  },
};

export default nextConfig;
