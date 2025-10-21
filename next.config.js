/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['mongoose'],
  },
  webpack: (config) => {
    config.experiments = {
      ...config.experiments,
      topLevelAwait: true,
    }
    return config
  },
  // Suppress hydration warnings from browser extensions
  reactStrictMode: true,
  swcMinify: true,
}

module.exports = nextConfig
