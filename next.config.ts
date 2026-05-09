import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // This allows the dev server to be accessed from other devices on the same network
  allowedDevOrigins: ["192.168.1.43", "localhost:3000"],
};



export default nextConfig;
