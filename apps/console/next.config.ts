import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Proxy compliance API calls to Mark's Python FastAPI server
  async rewrites() {
    return [
      {
        source: "/api/compliance/:path*",
        destination: "http://localhost:8000/:path*",
      },
    ];
  },
};

export default nextConfig;
