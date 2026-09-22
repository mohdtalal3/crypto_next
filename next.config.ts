import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["undici"],
  // Emit a self-contained server (.next/standalone) for the Electron desktop app.
  output: "standalone",
};

export default nextConfig;
