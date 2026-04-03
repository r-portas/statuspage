import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  cacheComponents: true,
  logging: {
    fetches: {},
  },
};

export default nextConfig;
