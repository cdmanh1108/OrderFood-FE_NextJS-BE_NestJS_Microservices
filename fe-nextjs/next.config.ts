import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "order-food-media.s3.ap-southeast-1.amazonaws.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "d3j0s5326wg516.cloudfront.net",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;