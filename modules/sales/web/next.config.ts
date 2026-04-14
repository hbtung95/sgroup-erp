import type { NextConfig } from "next";

process.env.NEXT_IGNORE_INCORRECT_LOCKFILE ??= "1";

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
