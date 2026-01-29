import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'yakoqbzwjxbpyedxmtnp.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
    // 图片优化配置
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 天缓存
    formats: ['image/webp', 'image/avif'], // 使用现代格式
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840], // 响应式尺寸
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384], // 小图尺寸
  },
  // 性能优化
  compress: true, // 启用 Gzip 压缩
  poweredByHeader: false, // 移除 X-Powered-By 头
  reactStrictMode: true, // React 严格模式
  // Edge Runtime 配置
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb', // 限制 Server Actions 请求体大小
    },
  },
};

export default nextConfig;
