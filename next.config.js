/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async redirects() {
    return [
      { source: '/', destination: '/armor', permanent: false }
    ]
  }
}

module.exports = nextConfig
