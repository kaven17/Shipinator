/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  eslint: { ignoreDuringBuilds: true },
  images: { unoptimized: true },
  experimental: {
    swcMinify: true, // Forces Next.js to use SWC for minification
  },
};

module.exports = nextConfig;
