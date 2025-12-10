/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Disable Turbopack for production builds - use standard webpack
  experimental: {},
}

module.exports = nextConfig
