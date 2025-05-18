// next.config.ts
import type { NextConfig } from 'next';
import type { Configuration } from 'webpack';

const nextConfig: NextConfig = {
  webpack(config: Configuration, { isServer }) {
    config.module?.rules?.push({
      test: /\.svg$/,
      issuer: /\.(js|ts)x?$/,
      use: ['@svgr/webpack'],
      type: 'asset/resource',
    });
    return config;
  },
  images: {
    domains: [
        'coin-images.coingecko.com',
    ],
    unoptimized: true,
},
};

export default nextConfig;
