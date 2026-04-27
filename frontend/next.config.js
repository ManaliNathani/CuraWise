/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Django APPEND_SLASH adds trailing slashes; without this, Next strips them and /api/* loops 308↔301.
  skipTrailingSlashRedirect: true,
  // Use fallback so App Router routes (e.g. /api/auth/login) run before proxying to Django.
  async rewrites() {
    return {
      fallback: [
        {
          source: '/api/:path*',
          destination: 'http://localhost:8000/api/:path*'
        },
        {
          source: '/ws/:path*',
          destination: 'http://localhost:8000/ws/:path*'
        }
      ]
    };
  }
};

module.exports = nextConfig;
