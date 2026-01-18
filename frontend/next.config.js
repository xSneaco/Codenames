/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  async rewrites() {
    // In development or when BACKEND_URL is set, proxy API requests to backend
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
