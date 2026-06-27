import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  turbopack: {},
  transpilePackages: [
    '@stacks/transactions',
    '@stacks/network',
    '@stacks/connect',
    '@stacks/auth',
    '@stacks/common',
    '@stacks/encryption',
  ],
};

export default nextConfig;
