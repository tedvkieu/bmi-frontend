import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker optimization
  output: 'standalone',

  // Optimize for production
  compress: true,

  // Disable telemetry in production
  telemetry: {
    disabled: true,
  },
};

export default nextConfig;
