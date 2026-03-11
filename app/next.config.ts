import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // When dev server is behind a proxy (e.g. Apache), allow the public origin for HMR / _next
  allowedDevOrigins: ["https://filmswipe.paulhoeller.at", "http://filmswipe.paulhoeller.at"],
};

export default nextConfig;
