import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",

  async rewrites() {
    const complianceApi = process.env.COMPLIANCE_API_URL || "http://localhost:8000";
    const kyraApi = process.env.KYRA_API_URL || "http://localhost:3737";

    return [
      {
        source: "/api/compliance/:path*",
        destination: `${complianceApi}/:path*`,
      },
      {
        source: "/api/v1/:path*",
        destination: `${kyraApi}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
