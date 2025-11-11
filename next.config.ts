import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    turbo: {
      rules: {
        "*.LICENSE": { loaders: ["ignore"] },
      },
    },
  },
};

export default nextConfig;
