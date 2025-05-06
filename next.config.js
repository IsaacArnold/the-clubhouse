/** @type {import('next').NextConfig} */
const nextConfig = {
  devIndicators: false,
  reactStrictMode: true,
  env: {
    DB_API_KEY: process.env.DB_API_KEY,
    DB_PROJECT_ID: process.env.DB_PROJECT_ID,
    DB_APP_ID: process.env.DB_APP_ID,
  },
  images: {
    domains: ["firebasestorage.googleapis.com"],
  },
};

module.exports = nextConfig;
