/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: process.env.APP_BASE_PATH || '',
  allowedDevOrigins: ['10.20.30.124'],
};

export default nextConfig;
