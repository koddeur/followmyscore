import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    // Tell browsers to always use HTTPS for this origin going forward. Only
    // meaningful once actually served over HTTPS (production), and harmless
    // to skip in dev where the app runs over plain HTTP on localhost.
    if (process.env.NODE_ENV !== "production") return [];

    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
