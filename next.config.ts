import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["image.tmdb.org"],
  },
};

export default nextConfig;
