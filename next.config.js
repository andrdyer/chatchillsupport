const path = require("path")

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
  webpack: (config) => {
    // Force alias for eventemitter2
    config.resolve.alias["eventemitter2"] = path.resolve(__dirname, "lib/shims/eventemitter2.js")
    return config
  },
}

module.exports = nextConfig
