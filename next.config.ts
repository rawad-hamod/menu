import type { NextConfig } from "next";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const remotePatterns: NonNullable<NonNullable<NextConfig["images"]>["remotePatterns"]> = [
  ...(supabaseUrl
    ? [
        {
          protocol: "https" as const,
          hostname: new URL(supabaseUrl).hostname,
          pathname: "/storage/v1/**",
        },
      ]
    : []),
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns,
  },
};

export default nextConfig;
