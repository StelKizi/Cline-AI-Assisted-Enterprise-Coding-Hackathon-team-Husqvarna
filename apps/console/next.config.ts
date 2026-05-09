import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",

  // Proxy compliance + brand API calls — uses env vars in prod, localhost in dev
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
        destination: `${kyraApi}/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
