/** @type {import('next').NextConfig} */
import path from 'path';

const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  images: { unoptimized: true },
  trailingSlash: true,
  webpack: (config, { dev }) => {
    config.module.rules.push({
      test: /\.json$/,
      type: 'json',
    });
    config.resolve.extensions.push('.json');
    if (!dev) {
      config.resolve.alias = {
        ...config.resolve.alias,
        '@data': path.resolve(process.cwd(), 'data'),
      };
    }
    return config;
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'geolocation=(self), camera=(), microphone=()' },
        ],
      },
    ];
  },
};

export default nextConfig;
