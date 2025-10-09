/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    images: {
      domains: ['res.cloudinary.com'],  // sirf Cloudinary allow karo
      unoptimized: true, // 🚀 ye sabse important
    },
  };
  
  export default nextConfig;
  