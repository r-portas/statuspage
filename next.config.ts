import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  cacheComponents: true,
  serverExternalPackages: ["dockerode"],
};

export default nextConfig;
