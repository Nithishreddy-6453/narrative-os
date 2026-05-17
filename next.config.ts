import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    // Server-side only - never exposed to client
    IBM_BOB_API_KEY: process.env.IBM_BOB_API_KEY || '',
    GITHUB_TOKEN: process.env.GITHUB_TOKEN || '',
  },
};

export default nextConfig;
