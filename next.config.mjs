/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    serverComponentsExternalPackages: ["playwright"],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Allow requiring Playwright at runtime in API routes
      config.externals = config.externals || []
    }
    return config
  },
}

export default nextConfig
