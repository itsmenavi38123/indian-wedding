import type { NextConfig } from 'next';
import dotenv from 'dotenv';
import path from 'path';

// Load .env from project root (parent directory)
// Use .env.production if NODE_ENV is production, otherwise use .env
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env';
dotenv.config({ path: path.resolve(__dirname, '../', envFile) });

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
