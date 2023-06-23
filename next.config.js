/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      { source: '/', destination: '/armor', permanent: false }
    ]
  }
}

module.exports = nextConfig
