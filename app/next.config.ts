import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: process.env.NEXTAUTH_URL ? [process.env.NEXTAUTH_URL] : [],
};

export default nextConfig;
