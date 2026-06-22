import type { NextConfig } from 'next';

// transpilePackages: forces Turbopack to re-bundle @stacks/* through its own
// pipeline — fixes "module factory is not available" crashes in production.
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
