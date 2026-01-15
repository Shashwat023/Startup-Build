import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "prod.spline.design",
            },
            {
                protocol: "https",
                hostname: "**.spline.design",
            },
        ],
    },
};

export default nextConfig;
